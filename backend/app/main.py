from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024

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
    try:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=415,
                detail="Yalnızca PDF dosyaları kabul edilir.",
            )

        pdf_header = await file.read(5)
        if pdf_header != b"%PDF-":
            raise HTTPException(
                status_code=415,
                detail="Yüklenen dosya geçerli bir PDF olmalıdır.",
            )

        file_size = len(pdf_header)
        while chunk := await file.read(1024 * 1024):
            file_size += len(chunk)
            if file_size > MAX_PDF_SIZE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail="PDF dosyası 5 MB veya daha küçük olmalıdır.",
                )

        return {
            "filename": file.filename or "unnamed.pdf",
            "content_type": file.content_type,
            "size_bytes": file_size,
        }
    finally:
        await file.close()
