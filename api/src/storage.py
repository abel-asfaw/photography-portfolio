import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from src.config import settings

S3_RESOURCE = boto3.resource(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


class S3DeleteError(Exception):
    """S3 accepted a batch delete but failed some of its keys."""


# Everything a storage call can raise, for cleanup that should only log.
S3_ERRORS = (ClientError, BotoCoreError, S3DeleteError)


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


def delete_from_s3(*photo_names: str) -> None:
    """
    Deletes photo objects from the S3 bucket in one request (S3 takes up to
    1000 keys at once).

    :param photo_names: The names of the photos to delete.
    :raises S3DeleteError: If S3 could not delete some of them.
    """
    response = S3_RESOURCE.Bucket(settings.S3_BUCKET_NAME).delete_objects(
        Delete={"Objects": [{"Key": name} for name in photo_names], "Quiet": True}
    )
    if errors := response.get("Errors"):
        raise S3DeleteError(errors)
