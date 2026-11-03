from pathlib import PurePosixPath
from typing import Any
from uuid import UUID, uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import APIRouter, Depends, UploadFile, HTTPException, status
from loguru import logger
from sqlalchemy import func

from src.auth import require_admin
from src.database import DbSession
from src.models import Photos
from src.schemas import Photo, ReorderRequest
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


@router.get("", response_model=list[Photo])
def get_photos(db: DbSession) -> list[Any]:
    """
    Fetches all photo entries from the database.

    :return: A list of Photo objects.
    """
    return db.query(Photos).order_by(Photos.sort_order).all()


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=Photo,
    dependencies=admin_only,
)
def add_photo(file: UploadFile, db: DbSession) -> Any:
    """
    Uploads a photo to an S3 bucket and records its details in the database.

    :param file: The photo to be uploaded.
    :return: A Photo instance with the photo's unique id, generated name,
            and the corresponding url in the S3 bucket.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File must be an image",
        )

    photo_name = make_photo_name(file.filename)
    photo_url = upload_to_s3(file, photo_name)
    try:
        min_order = db.query(func.min(Photos.sort_order)).scalar()
        new_order = (min_order - 1) if min_order is not None else 0

        photo = Photos(name=photo_name, url=photo_url, sort_order=new_order)
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
    """
    photo_ids = [str(pid) for pid in body.photo_ids]

    existing = db.query(Photos).filter(Photos.id.in_(photo_ids)).all()
    if len(existing) != len(photo_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more photo IDs do not exist",
        )

    id_to_photo = {str(p.id): p for p in existing}
    for index, pid in enumerate(photo_ids):
        id_to_photo[pid].sort_order = index

    db.commit()


@router.delete(
    "/{photo_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=admin_only
)
def delete_photo(photo_id: UUID, db: DbSession) -> None:
    """
    Deletes a photo's database entry, then its object in S3.

    :param photo_id: A unique identifier of a photo.
    """
    photo = db.get(Photos, photo_id)
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
