from hashlib import sha256
from io import BytesIO
from fastapi import Depends, UploadFile
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image
import boto3
import jwt

from src.config import settings
from src.exceptions import handle_s3_exceptions, handle_token_exceptions


MAX_FILE_SIZE = 2_000_000
PHOTO_NAME_LEN = 10
JPEG_MIME_TYPE = "image/jpeg"
JPEG_EXTENSION = ".jpg"

S3_RESOURCE = boto3.resource(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


class VerifyToken:
    def __init__(self):
        jwks_url = f"https://{settings.DOMAIN}/.well-known/jwks.json"
        self.jwks_client = jwt.PyJWKClient(jwks_url)

    def __call__(
        self, token: HTTPAuthorizationCredentials = Depends(HTTPBearer())
    ) -> None:
        """
        Verifies the JWT token.
        """
        with handle_token_exceptions():
            signing_key = self.jwks_client.get_signing_key_from_jwt(
                token.credentials
            ).key
            jwt.decode(
                token.credentials,
                signing_key,
                algorithms=settings.ALGORITHMS,
                audience=settings.API_AUDIENCE,
                issuer=settings.ISSUER,
            )


def create_file_hash(file: UploadFile) -> str:
    """
    Generates a unique identifier based on the SHA-256 hash of the file's content.

    :param file: A file-like object containing the content to be hashed.
    :return: The SHA-256 hash of the file's content as a string.
    """
    hasher = sha256()
    file_content = file.read()
    hasher.update(file_content)
    file.seek(0)
    return hasher.hexdigest()


def optimize_image(file: UploadFile) -> BytesIO:
    """
    Compresses an image and returns it as a bytes buffer.

    :param file: The file to be compressed.
    :return: Buffered IO containing the compressed image.
    """
    try:
        image = Image.open(file.file)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        buffer = BytesIO()
        image.save(
            buffer,
            "JPEG",
            quality=(70 if file.size > MAX_FILE_SIZE else "keep"),
            optimize=True,
        )
        buffer.seek(0)
        return buffer
    finally:
        if "image" in locals():
            image.close()


def get_file_name(photo_id: str) -> str:
    """
    Generates a file name based on the provided photo_id

    :param photo_id: A unique identifier of a photo.
    :return: The generated file name with a ".jpg" extension.
    """
    return photo_id[:PHOTO_NAME_LEN] + JPEG_EXTENSION


def upload_to_s3(file: UploadFile, photo_name: str) -> str:
    """
    Uploads a file to S3, compressing and converting to JPEG if needed based on size and format.

    :param file: The photo to be uploaded, encapsulated in an UploadFile object.
    :param photo_name: The desired name (usually hash-based) for the photo in the S3 bucket.
    """
    try:
        upload_stream = file.file
        if file.size > MAX_FILE_SIZE or file.content_type != JPEG_MIME_TYPE:
            upload_stream = optimize_image(file)

        with handle_s3_exceptions():
            S3_RESOURCE.Bucket(settings.S3_BUCKET_NAME).upload_fileobj(
                upload_stream, photo_name
            )
        return f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{photo_name}"
    finally:
        if file.file is not upload_stream:
            upload_stream.close()
        file.file.close()


def delete_from_s3(photo_name: str) -> None:
    """
    Deletes a specific photo object from an S3 bucket based on its name.

    :param photo_name: The name of the photo object to be deleted from the S3 bucket.
    """
    with handle_s3_exceptions():
        S3_RESOURCE.Object(settings.S3_BUCKET_NAME, photo_name).delete()
