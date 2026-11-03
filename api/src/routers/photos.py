from pathlib import PurePosixPath
from typing import Any
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from loguru import logger
from sqlalchemy import func, select

from src.auth import require_admin
from src.config import settings
from src.database import DbSession
from src.models import Photo
from src.schemas import PhotoResponse, ReorderRequest
from src.storage import delete_from_s3, upload_to_s3

router = APIRouter(prefix="/photos", tags=["Photos"])

admin_only = [Depends(require_admin)]


def make_photo_name(filename: str | None) -> str:
    """
    Builds a unique S3 key for an upload, keeping the original extension so
    the image type stays recognizable. The client's filename is never used as
    the key, so an upload can't overwrite an existing photo.
    """
    suffix = PurePosixPath(filename or "").suffix.lower()
    if not suffix[1:].isalnum():
        suffix = ""
    return f"{uuid4().hex}{suffix}"


@router.get("", response_model=list[PhotoResponse])
def get_photos(db: DbSession) -> list[Any]:
    """
    Fetches all photo entries from the database.

    :return: The photos in display order.
    """
    return db.scalars(select(Photo).order_by(Photo.sort_order)).all()


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=PhotoResponse,
    dependencies=admin_only,
)
def add_photo(file: UploadFile, db: DbSession) -> Any:
    """
    Uploads a photo to an S3 bucket and records its details in the database.

    :param file: The photo to be uploaded.
    :return: The new photo with the photo's unique id, generated name,
            and the corresponding url in the S3 bucket.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File must be an image",
        )
    # The proxy also caps request bodies, but production may not run behind
    # it, so the API enforces the limit itself.
    if file.size is not None and file.size > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File must be {settings.MAX_UPLOAD_MB} MB or smaller",
        )

    photo_name = make_photo_name(file.filename)
    photo_url = upload_to_s3(file, photo_name)
    try:
        min_order = db.scalar(select(func.min(Photo.sort_order)))
        new_order = (min_order - 1) if min_order is not None else 0

        photo = Photo(name=photo_name, url=photo_url, sort_order=new_order)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo
    except Exception:
        # The row wasn't saved, so remove the object rather than orphan it.
        try:
            delete_from_s3(photo_name)
        except (ClientError, BotoCoreError):
            logger.exception(f"Could not remove orphaned S3 object {photo_name}")
        raise


@router.put("/reorder", status_code=status.HTTP_200_OK, dependencies=admin_only)
def reorder_photos(body: ReorderRequest, db: DbSession) -> None:
    """
    Reorders photos based on the provided list of photo IDs.
    Each photo's sort_order is set to its index in the list.

    The list must contain every photo exactly once. A partial list would give
    the listed photos indices that collide with the others' sort_order.
    """
    id_to_photo = {photo.id: photo for photo in db.scalars(select(Photo)).all()}
    if (
        len(body.photo_ids) != len(id_to_photo)
        or set(body.photo_ids) != id_to_photo.keys()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="photo_ids must list every photo exactly once",
        )

    for index, photo_id in enumerate(body.photo_ids):
        id_to_photo[photo_id].sort_order = index

    db.commit()


@router.delete(
    "/{photo_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=admin_only
)
def delete_photo(photo_id: UUID, db: DbSession) -> None:
    """
    Deletes a photo's database entry, then its object in S3.

    :param photo_id: A unique identifier of a photo.
    """
    photo = db.get(Photo, photo_id)
    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo does not exist",
        )
    photo_name = photo.name
    db.delete(photo)
    db.commit()

    # The row is gone, so the photo is deleted as far as the client is
    # concerned. If S3 fails here, the leftover object is unreferenced and
    # harmless, which beats a row pointing at a missing file.
    try:
        delete_from_s3(photo_name)
    except (ClientError, BotoCoreError):
        logger.exception(f"Deleted photo {photo_id} but not its S3 object {photo_name}")
