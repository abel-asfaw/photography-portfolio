from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import photos


app = FastAPI(root_path="/api", debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(photos.router, prefix="/photos", tags=["Photos"])


@app.get("/healthcheck", include_in_schema=False)
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
