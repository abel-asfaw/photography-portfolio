from typing import List
from fastapi import APIRouter, UploadFile, Depends, Security, HTTPException, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from src.database import get_db
from src.exceptions import handle_db_exceptions
from src.models import Photos
from src.schemas import Photo
from src.utils import (
    VerifyToken,
    create_file_hash,
    delete_from_s3,
    get_file_name,
    upload_to_s3,
)


router = APIRouter()


@router.get("", response_model=List[Photo])
def get_photos(db: Session = Depends(get_db)) -> List[Photos]:
    """
    Fetches all photo entries from the database.

    :return: A list of Photo objects.
    """
    with handle_db_exceptions():
        photos = db.query(Photos).order_by(desc(Photos.created_at)).all()
        return photos


@router.post("", status_code=status.HTTP_201_CREATED, response_model=Photo)
def add_photo(
    file: UploadFile,
    _: None = Security(VerifyToken()),
    db: Session = Depends(get_db),
) -> Photos:
    """
    Uploads a photo to an S3 bucket and records its details in the database.

    :param file: The photo to be uploaded.
    :return: A Photo instance with the photo's unique id, generated name,
            and the corresponding url in the S3 bucket.
    """
    photo_id = create_file_hash(file.file)
    photo_name = get_file_name(photo_id)
    photo_url = upload_to_s3(file, photo_name)
    with handle_db_exceptions():
        photo = Photos(id=photo_id, name=photo_name, url=photo_url)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: str,
    _: None = Security(VerifyToken()),
    db: Session = Depends(get_db),
) -> None:
    """
    Deletes a photo's entry from the database using its unique id.

    :param photo_id: A unique identifier of a photo.
    """
    photo = db.query(Photos).filter(Photos.id == photo_id)
    if not photo.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo does not exist",
        )

    with handle_db_exceptions():
        photo.delete(synchronize_session=False)
        db.commit()

    delete_from_s3(get_file_name(photo_id))
