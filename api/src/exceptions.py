from contextlib import contextmanager
from botocore.exceptions import ClientError, BotoCoreError
from fastapi import HTTPException, status
from jwt.exceptions import ExpiredSignatureError, InvalidKeyError, InvalidAlgorithmError
from loguru import logger
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError


@contextmanager
def handle_db_exceptions():
    try:
        yield

    except IntegrityError as e:
        logger.error(f"Integrity error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Integrity error, possibly a duplicate record",
        ) from e

    except OperationalError as e:
        logger.error(f"Operational error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database operation failed, possibly a connection error",
        ) from e

    except SQLAlchemyError as e:
        logger.error(f"Database error occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred",
        ) from e

    except Exception as e:
        logger.error(f"Unexpected error occurred during database operation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred",
        ) from e


@contextmanager
def handle_s3_exceptions():
    try:
        yield

    except ClientError as e:
        logger.error(f"S3 ClientError occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred in S3 service",
        ) from e

    except BotoCoreError as e:
        logger.error(f"S3 BotoCoreError occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Low-level error occurred in S3 service",
        ) from e

    except Exception as e:
        logger.error(f"Unexpected error occurred in S3 service: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error occurred",
        ) from e


@contextmanager
def handle_token_exceptions():
    detail = "Invalid token"
    try:
        yield

    except ExpiredSignatureError as e:
        logger.error(f"Token is expired: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        ) from e

    except (InvalidKeyError, InvalidAlgorithmError) as e:
        logger.error(f"Token has invalid key or algorithm: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=detail
        ) from e

    except Exception as e:
        # General catch-all for any other exception
        logger.error(f"Unexpected error occured while handling token: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail
        ) from e
