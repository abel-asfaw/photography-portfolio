import psycopg2
import uvicorn

from utility import *
from fastapi import FastAPI, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic import BaseModel
from typing import List


class PhotoModel(BaseModel):
    id: str
    photo_name: str
    photo_url: str


app = FastAPI(debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/photos", status_code=status.HTTP_201_CREATED, response_model=PhotoModel)
async def add_photo(file: UploadFile):
    """
    Uploads a photo to an S3 bucket and records its details in the database. The photo's name
    is derived from the SHA-256 hash of its content, ensuring a unique identifier for each photo.

    :param file: The photo to be uploaded, encapsulated in an UploadFile object
    :return: A PhotoModel instance with the photo's unique ID (hash-based), generated name,
            and the corresponding URL in the S3 bucket.
    """
    try:
        photo_id = create_file_hash(file.file)
        photo_name = photo_id[:10] + JPEG_EXTENSION
        upload_to_s3(file, photo_name)
        photo_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{photo_name}"

        with psycopg2.connect(
            database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST
        ) as conn:
            with conn.cursor() as cur:
                query = (
                    "INSERT INTO photos (id, photo_name, photo_url) VALUES (%s, %s, %s)"
                )
                cur.execute(query, (photo_id, photo_name, photo_url))
                photo = PhotoModel(
                    id=photo_id, photo_name=photo_name, photo_url=photo_url
                )

        return photo

    except Exception as e:
        logger.error(f"Failed to add photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add photo",
        )


@app.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(photo_id: str):
    """
    Deletes a photo's entry from the database using its unique identifier (SHA-256 hash).

    :param photo_id: The unique identifier (SHA-256 hash) of the photo to be deleted.
    """
    try:
        with psycopg2.connect(
            database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST
        ) as conn:
            with conn.cursor() as cur:
                query = "DELETE FROM photos WHERE id=(%s)"
                cur.execute(query, (photo_id,))

    except Exception as e:
        logger.error(f"Failed to delete photo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo",
        )


@app.get("/photos", response_model=List[PhotoModel])
async def get_photos():
    """
    Fetches all photo entries from the database.

    :return: A list of PhotoModel objects, each representing the metadata of a photo.
    """
    try:
        with psycopg2.connect(
            database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, photo_name, photo_url FROM photos")
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


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=4001, reload=True)
