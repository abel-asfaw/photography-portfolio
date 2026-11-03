from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.config import settings
from src.database import DbSession
from src.exceptions import register_exception_handlers
from src.routers import photos

# The /api prefix Nginx strips is set with uvicorn's --root-path (see the
# Dockerfile), so docs and OpenAPI links include it.
app = FastAPI(title="Photography Portfolio API", debug=settings.DEBUG)
register_exception_handlers(app)

# The client authenticates with a bearer token, not cookies, so credentialed
# CORS requests aren't needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(photos.router)


@app.get("/healthz", include_in_schema=False)
def healthcheck(db: DbSession):
    # A database failure surfaces as a 503 through the exception handlers.
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
