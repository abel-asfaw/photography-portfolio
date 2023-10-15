import uvicorn

from utils import (
    JPEG_EXTENSION,
    VerifyToken,
    create_file_hash,
    delete_from_s3,
    get_cursor,
    get_file_extension,
    upload_to_s3,
)
from fastapi import FastAPI, Depends, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from loguru import logger
from pydantic import BaseModel
from typing import List, Annotated


class PhotoModel(BaseModel):
    id: str
    photo_name: str
    photo_url: str


token_auth_scheme = HTTPBearer()

app = FastAPI(root_path="/api", debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/photos", response_model=List[PhotoModel])
async def get_photos():
    """
    Fetches all photo entries from the database.

    :return: A list of PhotoModel objects, each representing the metadata of a photo.
    """
    try:
        with get_cursor() as cur:
            cur.execute(
                "SELECT id, photo_name, photo_url FROM photos ORDER BY date DESC"
            )
            photos = [
                PhotoModel(id=row[0], photo_name=row[1], photo_url=row[2])
                for row in cur.fetchall()
            ]

        return photos

    except Exception as e:
        logger.error(f"Failed to fetch photos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch photos",
        )


@app.post("/photos", status_code=status.HTTP_201_CREATED, response_model=PhotoModel)
async def add_photo(
    file: UploadFile, token: Annotated[str, Depends(token_auth_scheme)]
):
    """
    Uploads a photo to an S3 bucket and records its details in the database. The photo's name
    is derived from the SHA-256 hash of its content, ensuring a unique identifier for each photo.

    :param file: The photo to be uploaded, encapsulated in an UploadFile object
    :return: A PhotoModel instance with the photo's unique ID (hash-based), generated name,
            and the corresponding URL in the S3 bucket.
    """
    result = VerifyToken(token.credentials).verify()

    if result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )

    try:
        photo_id = create_file_hash(file.file)
        photo_name = get_file_extension(photo_id)
        photo_url = upload_to_s3(file, photo_name)

        upload_to_s3(file, photo_name)
        with get_cursor() as cur:
            query = "INSERT INTO photos (id, photo_name, photo_url) VALUES (%s, %s, %s)"
            cur.execute(query, (photo_id, photo_name, photo_url))
            photo = PhotoModel(id=photo_id, photo_name=photo_name, photo_url=photo_url)

        return photo

    except Exception as e:
        logger.error(f"Failed to add photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add photo",
        )


@app.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: str, token: Annotated[str, Depends(token_auth_scheme)]
):
    """
    Deletes a photo's entry from the database using its unique identifier (SHA-256 hash).

    :param photo_id: The unique identifier (SHA-256 hash) of the photo to be deleted.
    """
    result = VerifyToken(token.credentials).verify()

    if result.get("status"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token",
        )

    try:
        with get_cursor() as cur:
            query = "DELETE FROM photos WHERE id=(%s)"
            cur.execute(query, (photo_id,))
        delete_from_s3(get_file_extension(photo_id))

    except Exception as e:
        logger.error(f"Failed to delete photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=4000, reload=True)
