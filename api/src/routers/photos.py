from typing import Any
from fastapi import APIRouter, UploadFile, Security, HTTPException, status
from sqlalchemy import func

from src.database import get_db
from src.models import Photos
from src.schemas import Photo, ReorderRequest
from src.utils import (
    VerifyToken,
    delete_from_s3,
    upload_to_s3,
)

router = APIRouter(prefix="/photos", tags=["Photos"])

auth = VerifyToken()


@router.get("", response_model=list[Photo])
def get_photos() -> list[Any]:
    """
    Fetches all photo entries from the database.

    :return: A list of Photo objects.
    """
    with get_db() as db:
        photos = db.query(Photos).order_by(Photos.sort_order).all()
        return photos


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Photo)
def add_photo(
    file: UploadFile,
    _: None = Security(auth.verify),
) -> Any:
    """
    Uploads a photo to an S3 bucket and records its details in the database.

    :param file: The photo to be uploaded.
    :return: A Photo instance with the photo's unique id, generated name,
            and the corresponding url in the S3 bucket.
    """
    photo_name = file.filename
    if photo_name is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File does not have a filename",
        )

    photo_url = upload_to_s3(file, photo_name)
    with get_db() as db:
        min_order = db.query(func.min(Photos.sort_order)).scalar()
        new_order = (min_order - 1) if min_order is not None else 0

        photo = Photos(name=photo_name, url=photo_url, sort_order=new_order)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo


@router.put("/reorder", status_code=status.HTTP_200_OK)
def reorder_photos(
    body: ReorderRequest,
    _: None = Security(auth.verify),
) -> None:
    """
    Reorders photos based on the provided list of photo IDs.
    Each photo's sort_order is set to its index in the list.
    """
    with get_db() as db:
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


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: str,
    _: None = Security(auth.verify),
) -> None:
    """
    Deletes a photo's entry from the database using its unique id.

    :param photo_id: A unique identifier of a photo.
    """
    with get_db() as db:
        photo = db.query(Photos).filter(Photos.id == photo_id)
        photo_obj = photo.first()
        if not photo_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Photo does not exist",
            )
        delete_from_s3(photo_obj.name)
        photo.delete(synchronize_session=False)
        db.commit()
