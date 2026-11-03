import boto3
from fastapi import UploadFile

from src.config import settings

S3_RESOURCE = boto3.resource(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


def upload_to_s3(file: UploadFile, photo_name: str) -> str:
    """
    Uploads a photo to S3 under the given key, keeping its content type.

    :param file: A file to be uploaded to S3.
    :param photo_name: The S3 key for the photo.
    :return: The photo's S3 URL.
    """
    try:
        S3_RESOURCE.Bucket(settings.S3_BUCKET_NAME).upload_fileobj(
            file.file, photo_name, ExtraArgs={"ContentType": file.content_type}
        )
        return f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{photo_name}"
    finally:
        file.file.close()


def delete_from_s3(photo_name: str) -> None:
    """
    Deletes a specific photo object from an S3 bucket based on its name.

    :param photo_name: The name of the photo to be deleted from the S3 bucket.
    """
    S3_RESOURCE.Object(settings.S3_BUCKET_NAME, photo_name).delete()
