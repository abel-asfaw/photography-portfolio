import hashlib
import boto3

from PIL import Image
from io import BytesIO
from decouple import config


MAX_FILE_SIZE = 2000000
JPEG_MIME_TYPE = "image/jpeg"
JPEG_EXTENSION = ".jpg"

DB_NAME = config("DB_NAME")
DB_USER = config("DB_USER")
DB_PASS = config("DB_PASS")
DB_HOST = config("DB_HOST")

S3_BUCKET_NAME = config("S3_BUCKET_NAME")
AWS_ACCESS = config("AWS_ACCESS_KEY_ID")
AWS_SECRET = config("AWS_SECRET_ACCESS_KEY")
AWS_REGION = config("AWS_REGION")


def create_file_hash(file):
    """
    Generates a unique identifier based on the SHA-256 hash of the file's content.

    :param file: A file-like object containing the content to be hashed.
    :return: The SHA-256 hash of the file's content.
    """
    hasher = hashlib.sha256()
    file_content = file.read()
    hasher.update(file_content)
    file.seek(0)
    return hasher.hexdigest()


def optimize_image(file):
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


def upload_to_s3(file, photo_name):
    """
    Uploads a file to S3, compressing and converting to JPEG if needed based on size and format.

    :param file: The photo to be uploaded, encapsulated in an UploadFile object.
    :param photo_name: The desired name (usually hash-based) for the photo in the S3 bucket.
    """
    try:
        upload_stream = file.file
        if file.size > MAX_FILE_SIZE or file.content_type != JPEG_MIME_TYPE:
            upload_stream = optimize_image(file)

        s3 = boto3.resource(
            "s3",
            aws_access_key_id=AWS_ACCESS,
            aws_secret_access_key=AWS_SECRET,
            region_name=AWS_REGION,
        )
        bucket = s3.Bucket(S3_BUCKET_NAME)
        bucket.upload_fileobj(upload_stream, photo_name)

    finally:
        if file.file is not upload_stream:
            upload_stream.close()
        file.file.close()


def delete_from_s3(photo_name):
    """
    Deletes a specific photo object from an S3 bucket based on its name.

    :param photo_name: The name of the photo object to be deleted from the S3 bucket.
    """
    s3 = boto3.resource(
        "s3",
        aws_access_key_id=AWS_ACCESS,
        aws_secret_access_key=AWS_SECRET,
        region_name=AWS_REGION,
    )
    s3.Object(S3_BUCKET_NAME, photo_name).delete()