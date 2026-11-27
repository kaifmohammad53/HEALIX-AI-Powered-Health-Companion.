from __future__ import annotations

import re


def parse_report_data(text: str) -> dict:
    """Parse the current dental-report layout into the notebook's data shape.

    This parser is currently tailored to the dental report format tested in
    medical_report_processing.ipynb. Other report layouts will need additional
    section rules before being treated as supported.
    """
    def get_section(start: str, end: str) -> list[str]:
        pattern = (
            re.escape(start)
            + r"(.*?)"
            + r"(?=" + re.escape(end) + r"|$)"
        )
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if not match:
            return []

        items: list[str] = []
        for line in match.group(1).splitlines():
            line = line.strip()
            if not line:
                continue
            # Remove OCR bullet artifacts such as "e Plaque" without
            # rewriting the actual medical wording.
            line = re.sub(r"^(?:[•●▪◦]|e)\s*", "", line, flags=re.IGNORECASE)
            if line:
                items.append(line)
        return items

    patient_match = re.search(
        r"Patient\s*Name\s*:\s*(.*?)\s+Date\s*:\s*"
        r"(\d{1,2}/\d{1,2}/\d{4})",
        text,
        re.IGNORECASE,
    )
    dentist_match = re.search(r"Dentist\s*:\s*(.+)", text, re.IGNORECASE)
    title_match = re.search(
        r"(?im)^\s*(DENTAL REPORT|MEDICAL REPORT)\s*$", text
    )

    return {
        "report_title": title_match.group(1).strip() if title_match else None,
        "patient_name": patient_match.group(1).strip() if patient_match else None,
        "report_date": patient_match.group(2) if patient_match else None,
        "oral_health_condition": get_section(
            "Oral Health Condition", "Gum & Tooth Assessment"
        ),
        "gum_and_tooth_assessment": get_section(
            "Gum & Tooth Assessment", "Dental Work Done or Recommended"
        ),
        "dental_work_recommended": get_section(
            "Dental Work Done or Recommended", "Hygiene Advice"
        ),
        "hygiene_advice": get_section("Hygiene Advice", "Dentist:"),
        "dentist": dentist_match.group(1).strip() if dentist_match else None,
    }
