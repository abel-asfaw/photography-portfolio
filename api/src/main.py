from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.exceptions import register_exception_handlers
from src.routers import photos

app = FastAPI(
    title="Photography Portfolio API",
    root_path=settings.ROOT_PATH,
    debug=settings.DEBUG,
)
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
def healthcheck():
    return {"status": "ok"}
