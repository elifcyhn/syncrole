import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.pdf_service import MAX_PDF_SIZE_BYTES

client = TestClient(app)
UPLOAD_ENDPOINTS = ["/upload/cv", "/upload/job-description"]


@pytest.mark.parametrize("endpoint", UPLOAD_ENDPOINTS)
def test_upload_returns_pdf_information(endpoint: str) -> None:
    pdf_content = b"%PDF-1.4\n%%EOF"

    response = client.post(
        endpoint,
        files={"file": ("document.pdf", pdf_content, "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json() == {
        "filename": "document.pdf",
        "content_type": "application/pdf",
        "size_bytes": len(pdf_content),
    }


@pytest.mark.parametrize("endpoint", UPLOAD_ENDPOINTS)
def test_upload_rejects_non_pdf_file(endpoint: str) -> None:
    response = client.post(
        endpoint,
        files={"file": ("document.txt", b"not a pdf", "text/plain")},
    )

    assert response.status_code == 415
    assert response.json() == {"detail": "Yalnızca PDF dosyaları kabul edilir."}


@pytest.mark.parametrize("endpoint", UPLOAD_ENDPOINTS)
def test_upload_rejects_invalid_pdf_signature(endpoint: str) -> None:
    response = client.post(
        endpoint,
        files={"file": ("fake.pdf", b"not a pdf", "application/pdf")},
    )

    assert response.status_code == 415
    assert response.json() == {
        "detail": "Yüklenen dosya geçerli bir PDF olmalıdır."
    }


@pytest.mark.parametrize("endpoint", UPLOAD_ENDPOINTS)
def test_upload_rejects_file_larger_than_five_mb(endpoint: str) -> None:
    oversized_pdf = b"%PDF-" + b"0" * MAX_PDF_SIZE_BYTES

    response = client.post(
        endpoint,
        files={"file": ("large-document.pdf", oversized_pdf, "application/pdf")},
    )

    assert response.status_code == 413
    assert response.json() == {
        "detail": "PDF dosyası 5 MB veya daha küçük olmalıdır."
    }
