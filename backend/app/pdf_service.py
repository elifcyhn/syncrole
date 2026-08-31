from fastapi import HTTPException, UploadFile

MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024
READ_CHUNK_SIZE_BYTES = 1024 * 1024


async def validate_pdf_upload(file: UploadFile) -> dict[str, str | int]:
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
        while chunk := await file.read(READ_CHUNK_SIZE_BYTES):
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
