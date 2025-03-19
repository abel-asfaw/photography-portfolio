from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routers import photos


app = FastAPI(root_path="/api", debug=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://photography.abelasfaw.com",
        "https://photography-portfolio-o88f.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(photos.router)


@app.get("/healthcheck", include_in_schema=False)
def healthcheck():
    return {"status": "ok"}
