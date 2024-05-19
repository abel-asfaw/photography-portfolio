from contextlib import contextmanager
from botocore.exceptions import ClientError, BotoCoreError
from fastapi import HTTPException, status
from loguru import logger


@contextmanager
def s3_exception_handler():
    """
    Context manager to handle S3 exceptions.
    """
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
