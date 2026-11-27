from __future__ import annotations

import os
import shutil
from io import BytesIO
from pathlib import Path

import pymupdf
import pytesseract
from PIL import Image, ImageOps


def _configure_tesseract() -> None:
    """Configure Tesseract from env, PATH, or common Windows installation paths."""
    configured_path = os.getenv("TESSERACT_CMD")
    candidates = [
        configured_path,
        shutil.which("tesseract"),
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]

    executable = next(
        (str(Path(candidate)) for candidate in candidates
         if candidate and Path(candidate).is_file()),
        None,
    )

    if executable is None:
        raise RuntimeError(
            "Tesseract was not found. Install Tesseract OCR or set "
            "TESSERACT_CMD to the full path of tesseract.exe."
        )

    pytesseract.pytesseract.tesseract_cmd = executable


def extract_pdf_text(
    pdf_path: str | Path,
    dpi: int = 350,
    min_text_chars: int = 30,
) -> dict:
    """Extract embedded PDF text, falling back to OCR page by page."""
    path = Path(pdf_path)
    if not path.is_file():
        raise FileNotFoundError(f"PDF not found: {path}")

    pages_text: list[str] = []
    methods: list[str] = []
    tesseract_configured = False

    try:
        with pymupdf.open(path) as document:
            if len(document) == 0:
                raise ValueError("The uploaded PDF contains no pages.")

            for page in document:
                text = page.get_text("text").strip()

                if len(text) >= min_text_chars:
                    method = "PDF_TEXT"
                else:
                    if not tesseract_configured:
                        _configure_tesseract()
                        tesseract_configured = True

                    pixmap = page.get_pixmap(dpi=dpi, alpha=False)
                    image = Image.open(
                        BytesIO(pixmap.tobytes("png"))
                    ).convert("L")
                    image = ImageOps.autocontrast(image)

                    text = pytesseract.image_to_string(
                        image,
                        lang="eng",
                        config="--oem 3 --psm 6",
                    ).strip()
                    method = "OCR"

                pages_text.append(text)
                methods.append(method)

    except (pymupdf.FileDataError, RuntimeError) as exc:
        if isinstance(exc, RuntimeError) and "Tesseract" in str(exc):
            raise
        raise ValueError("The uploaded file could not be read as a valid PDF.") from exc

    combined_text = "\n\n".join(pages_text).strip()
    if not combined_text:
        raise ValueError("No readable text could be extracted from this PDF.")

    return {
        "text": combined_text,
        "total_pages": len(pages_text),
        "total_characters": len(combined_text),
        "methods": methods,
    }
