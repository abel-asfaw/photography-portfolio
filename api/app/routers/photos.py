from typing import List, Annotated
from fastapi import APIRouter, Depends, UploadFile, HTTPException, status
from fastapi.security import HTTPBearer
from sqlalchemy import desc
from sqlalchemy.orm import Session
from loguru import logger

from app import models, schemas
from app.database import get_db
from app.utils import (
    VerifyToken,
    create_file_hash,
    delete_from_s3,
    get_file_name,
    upload_to_s3,
)


token_auth_scheme = HTTPBearer()

router = APIRouter()


@router.get("", response_model=List[schemas.Photo])
def get_photos(db: Annotated[Session, Depends(get_db)]):
    """
    Fetches all photo entries from the database.

    :return: A list of Photo objects, each representing the metadata of a photo.
    """
    try:
        photos = db.query(models.Photos).order_by(desc(models.Photos.created_at)).all()
        return photos

    except Exception as e:
        logger.error(f"Failed to fetch photos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch photos",
        ) from e


@router.post("", status_code=status.HTTP_201_CREATED, response_model=schemas.Photo)
def add_photo(
    file: UploadFile,
    token: Annotated[str, Depends(token_auth_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Uploads a photo to an S3 bucket and records its details in the database. The photo's name
    is derived from the SHA-256 hash of its content, ensuring a unique identifier for each photo.

    :param file: The photo to be uploaded, encapsulated in an UploadFile object
    :return: A Photo instance with the photo's unique ID (hash-based), generated name,
            and the corresponding URL in the S3 bucket.
    """
    result = VerifyToken(token.credentials).verify()
    if result.get("error"):
        logger.error(f'Token verification failed: {result["error"]["message"]}')
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )

    photo_id = create_file_hash(file.file)
    photo_name = get_file_name(photo_id)
    photo_url = upload_to_s3(file, photo_name)
    if not photo_id or not photo_name or not photo_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Photo does not exist",
        )

    try:
        photo = models.Photos(id=photo_id, name=photo_name, url=photo_url)
        db.add(photo)
        db.commit()
        db.refresh(photo)
        return photo

    except Exception as e:
        logger.error(f"Failed to add photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add photo",
        ) from e


@router.delete("/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_photo(
    photo_id: str,
    token: Annotated[str, Depends(token_auth_scheme)],
    db: Annotated[Session, Depends(get_db)],
):
    """
    Deletes a photo's entry from the database using its unique identifier (SHA-256 hash).

    :param photo_id: The unique identifier (SHA-256 hash) of the photo to be deleted.
    """
    result = VerifyToken(token.credentials).verify()
    if result.get("error"):
        logger.error(f'Token verification failed: {result["error"]["message"]}')
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )

    photo = db.query(models.Photos).filter(models.Photos.id == photo_id)
    if not photo.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo does not exist",
        )

    try:
        photo.delete(synchronize_session=False)
        db.commit()
        delete_from_s3(get_file_name(photo_id))

    except Exception as e:
        logger.error(f"Failed to delete photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo",
        ) from e
