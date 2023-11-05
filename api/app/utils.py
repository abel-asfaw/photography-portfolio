import hashlib
import jwt
import psycopg2
import boto3

from contextlib import contextmanager
from io import BytesIO
from PIL import Image
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


class VerifyToken:
    """Does all the token verification using PyJWT"""
    
    def __init__(self, token):
        self.token = token
        self.config = self.set_up()
        jwks_url = f'https://{self.config["DOMAIN"]}/.well-known/jwks.json'
        self.jwks_client = jwt.PyJWKClient(jwks_url)

    @staticmethod
    def set_up():
        return {
            "DOMAIN": config("DOMAIN"),
            "API_AUDIENCE": config("API_AUDIENCE"),
            "ISSUER": config("ISSUER"),
            "ALGORITHMS": config("ALGORITHMS"),
        }

    def verify(self):
        try:
            self.signing_key = self.jwks_client.get_signing_key_from_jwt(self.token).key
            payload = jwt.decode(
                self.token,
                self.signing_key,
                algorithms=self.config["ALGORITHMS"],
                audience=self.config["API_AUDIENCE"],
                issuer=self.config["ISSUER"],
            )
            return payload

        except Exception as e:
            return {"error": {"message": str(e)}}


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


@contextmanager
def get_cursor():
    """
    Context manager for acquiring a psycopg2 database cursor.

    :yield: A psycopg2 cursor object.
    """
    with psycopg2.connect(
        database=DB_NAME, user=DB_USER, password=DB_PASS, host=DB_HOST
    ) as conn:
        with conn.cursor() as cur:
            yield cur
        conn.commit()


def get_file_extension(photo_id):
    return photo_id[:10] + JPEG_EXTENSION


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

        photo_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{photo_name}"
        return photo_url

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
