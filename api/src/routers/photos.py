from pathlib import PurePosixPath
from typing import Any
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from loguru import logger
from sqlalchemy import func, select

from src.auth import require_admin
from src.config import settings
from src.database import DbSession
from src.models import Photo
from src.schemas import PhotoIdsRequest, PhotoResponse
from src.storage import S3_ERRORS, delete_from_s3, upload_to_s3

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
        except S3_ERRORS:
            logger.exception(f"Could not remove orphaned S3 object {photo_name}")
        raise


@router.put("/reorder", response_model=list[PhotoResponse], dependencies=admin_only)
def reorder_photos(body: PhotoIdsRequest, db: DbSession) -> list[Any]:
    """
    Puts the listed photos first, in the order given, followed by any photos
    the list leaves out in their current order. Unknown and repeated IDs are
    ignored, so a client whose list is a moment out of date (a photo was just
    uploaded or deleted) can still save its order.

    :return: The photos in their saved order.
    """
    current = db.scalars(select(Photo).order_by(Photo.sort_order)).all()
    id_to_photo = {photo.id: photo for photo in current}
    listed = [id_to_photo[i] for i in dict.fromkeys(body.photo_ids) if i in id_to_photo]
    listed_ids = {photo.id for photo in listed}
    ordered = listed + [photo for photo in current if photo.id not in listed_ids]

    for index, photo in enumerate(ordered):
        photo.sort_order = index
    db.commit()
    return ordered


@router.delete("", status_code=status.HTTP_204_NO_CONTENT, dependencies=admin_only)
def delete_photos(body: PhotoIdsRequest, db: DbSession) -> None:
    """
    Deletes the listed photos' database entries, then their objects in S3.
    IDs that match no photo are ignored, so retrying a delete is harmless.
    """
    found = db.scalars(select(Photo).where(Photo.id.in_(body.photo_ids))).all()
    if not found:
        return
    names = [photo.name for photo in found]
    for photo in found:
        db.delete(photo)
    db.commit()

    # The rows are gone, so the photos are deleted as far as the client is
    # concerned. If S3 fails here, the leftover objects are unreferenced and
    # harmless, which beats rows pointing at missing files.
    try:
        delete_from_s3(*names)
    except S3_ERRORS:
        logger.exception(f"Deleted photos but not all their S3 objects: {names}")
