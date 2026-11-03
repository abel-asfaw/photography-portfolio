from botocore.exceptions import BotoCoreError, ClientError
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from loguru import logger
from sqlalchemy.exc import IntegrityError, OperationalError, SQLAlchemyError

# Database and S3 failures mapped to the response the client sees. A handler
# matches the most specific class in the exception's MRO, so IntegrityError
# wins over its SQLAlchemyError base.
ERROR_RESPONSES: dict[type[Exception], tuple[int, str]] = {
    IntegrityError: (status.HTTP_409_CONFLICT, "Conflicts with an existing record"),
    OperationalError: (
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "Database is unavailable",
    ),
    SQLAlchemyError: (
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "Database error occurred",
    ),
    ClientError: (status.HTTP_502_BAD_GATEWAY, "Storage service rejected the request"),
    BotoCoreError: (status.HTTP_503_SERVICE_UNAVAILABLE, "Storage service is unavailable"),
}


async def handle_service_error(request: Request, exc: Exception) -> JSONResponse:
    status_code, detail = next(
        ERROR_RESPONSES[cls] for cls in type(exc).__mro__ if cls in ERROR_RESPONSES
    )
    logger.opt(exception=exc).error(f"{request.method} {request.url.path}: {detail}")
    return JSONResponse(status_code=status_code, content={"detail": detail})


def register_exception_handlers(app: FastAPI) -> None:
    """
    Turns database and S3 errors into JSON error responses. HTTPExceptions
    raised by the routes pass through untouched.
    """
    for exc_class in ERROR_RESPONSES:
        app.add_exception_handler(exc_class, handle_service_error)
