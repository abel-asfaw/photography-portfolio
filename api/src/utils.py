from dataclasses import dataclass
from fastapi import Depends, UploadFile, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt.exceptions import (
    ExpiredSignatureError,
    PyJWKClientConnectionError,
    PyJWTError,
)
from loguru import logger
import boto3
import jwt

from src.config import settings
from src.exceptions import s3_exception_handler

S3_RESOURCE = boto3.resource(
    "s3",
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION,
)


@dataclass
class VerifyToken:
    """
    Verifies a Supabase Auth JWT and checks that it belongs to the admin user.
    """

    issuer = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
    audience = "authenticated"
    algorithms = ["ES256"]
    jwks_client = jwt.PyJWKClient(f"{issuer}/.well-known/jwks.json")

    def verify(
        self, token: HTTPAuthorizationCredentials = Depends(HTTPBearer())
    ) -> None:
        error_detail = "Invalid token"
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(
                token.credentials
            ).key
            claims = jwt.decode(
                token.credentials,
                signing_key,
                algorithms=self.algorithms,
                audience=self.audience,
                issuer=self.issuer,
                options={"require": ["exp", "sub"]},
            )
        except ExpiredSignatureError as e:
            logger.error(f"Token is expired: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail=error_detail
            ) from e
        except PyJWKClientConnectionError as e:
            logger.error(f"Could not fetch JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Unable to verify token",
            ) from e
        except PyJWTError as e:
            logger.error(f"Token is invalid: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail=error_detail
            ) from e
        except Exception as e:
            logger.error(f"Unexpected error occured while handling token: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected token handling error",
            ) from e

        if claims["sub"] != settings.ADMIN_USER_ID:
            logger.warning(f"Rejected token for non-admin user {claims['sub']}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized"
            )


def upload_to_s3(file: UploadFile, photo_name: str) -> str:
    """
    Uploads a photo to to S3, compressing and converting to JPEG if needed
    based on size and format.

    :param file: A file to be uploaded to S3.
    :param photo_name: The name for the photo.
    """
    try:
        with s3_exception_handler():
            S3_RESOURCE.Bucket(settings.S3_BUCKET_NAME).upload_fileobj(
                file.file, photo_name
            )
            return f"https://{settings.S3_BUCKET_NAME}.s3.amazonaws.com/{photo_name}"
    finally:
        file.file.close()


def delete_from_s3(photo_name: str) -> None:
    """
    Deletes a specific photo object from an S3 bucket based on its name.

    :param photo_name: The name of the photo to be deleted from the S3 bucket.
    """
    with s3_exception_handler():
        S3_RESOURCE.Object(settings.S3_BUCKET_NAME, photo_name).delete()
