from __future__ import annotations

from pathlib import Path

from .extractor import extract_pdf_text
from .parser import parse_report_data
from .summarizer import process_report_data


def process_pdf_report(pdf_path: str | Path) -> dict:
    """Run PDF text extraction/OCR, parsing, and AI-or-fallback summarization."""
    extraction = extract_pdf_text(pdf_path)
    extracted_text = extraction["text"]

    if not extracted_text.strip():
        raise ValueError("No readable text found in the PDF.")

    report_data = parse_report_data(extracted_text)
    report_data["raw_text"] = extracted_text

    result = process_report_data(report_data)
    result["extraction_metadata"] = {
        "total_pages": extraction["total_pages"],
        "total_characters": extraction["total_characters"],
        "methods": extraction["methods"],
    }
    return result
