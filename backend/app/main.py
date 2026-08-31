from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.pdf_service import validate_pdf_upload

app = FastAPI(title="SyncRole API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/upload/cv")
async def upload_cv(file: UploadFile = File(...)) -> dict[str, str | int]:
    return await validate_pdf_upload(file)


@app.post("/upload/job-description")
async def upload_job_description(
    file: UploadFile = File(...),
) -> dict[str, str | int]:
    return await validate_pdf_upload(file)
