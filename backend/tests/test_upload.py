from fastapi.testclient import TestClient

from app.main import MAX_PDF_SIZE_BYTES, app

client = TestClient(app)


def test_upload_cv_returns_pdf_information() -> None:
    pdf_content = b"%PDF-1.4\n%%EOF"

    response = client.post(
        "/upload/cv",
        files={"file": ("cv.pdf", pdf_content, "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json() == {
        "filename": "cv.pdf",
        "content_type": "application/pdf",
        "size_bytes": len(pdf_content),
    }


def test_upload_cv_rejects_non_pdf_file() -> None:
    response = client.post(
        "/upload/cv",
        files={"file": ("cv.txt", b"not a pdf", "text/plain")},
    )

    assert response.status_code == 415
    assert response.json() == {"detail": "Yalnızca PDF dosyaları kabul edilir."}


def test_upload_cv_rejects_file_larger_than_five_mb() -> None:
    oversized_pdf = b"%PDF-" + b"0" * MAX_PDF_SIZE_BYTES

    response = client.post(
        "/upload/cv",
        files={"file": ("large-cv.pdf", oversized_pdf, "application/pdf")},
    )

    assert response.status_code == 413
    assert response.json() == {
        "detail": "PDF dosyası 5 MB veya daha küçük olmalıdır."
    }
