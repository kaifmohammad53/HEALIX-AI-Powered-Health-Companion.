from __future__ import annotations

import json
import os


DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b"


def build_report_prompt(report_data: dict) -> str:
    """Build a privacy-conscious prompt using report fields, not identifiers."""
    allowed_fields = [
        "report_title",
        "report_date",
        "oral_health_condition",
        "gum_and_tooth_assessment",
        "dental_work_recommended",
        "hygiene_advice",
        "test_results",
        "lab_results",
    ]
    safe_report = {
        key: report_data[key]
        for key in allowed_fields
        if key in report_data
    }

    return f"""You are HEALIX, a medical report explanation assistant.

Use only the information present in the supplied report data.
Do not diagnose, invent medical facts, or add recommendations absent from the report.
Preserve all findings, numerical values, units, and tooth numbers accurately.
Treat each extracted statement independently. Do not associate a condition with a
particular tooth or body part unless the report explicitly makes that association.
Do not silently correct OCR mistakes. Flag unclear wording for verification.
Do not introduce unusual characters or decorative punctuation.

Return these sections:
1. Plain-language summary
2. Findings mentioned in the report
3. Recommendations written in the report
4. Text requiring verification

Report data:
{json.dumps(safe_report, indent=2, ensure_ascii=False)}
"""


def generate_report_summary(report_data: dict) -> str | None:
    """Try Groq; return None when unavailable so the local fallback can be used."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None

    try:
        from groq import Groq

        client = Groq(api_key=api_key)
        model = os.getenv("GROQ_MODEL", DEFAULT_GROQ_MODEL)
        response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are HEALIX, a careful medical-report explanation "
                        "assistant. Explain report content without diagnosing."
                    ),
                },
                {"role": "user", "content": build_report_prompt(report_data)},
            ],
            temperature=0.2,
            max_completion_tokens=1200,
        )
        summary = response.choices[0].message.content
        return summary.strip() if summary else None

    except Exception as error:
        # Do not log report contents or API credentials.
        print(f"Groq summary unavailable ({type(error).__name__}): {error}")
        return None


def format_report_fallback(report_data: dict) -> str:
    """Format extracted text locally without presenting it as a diagnosis."""
    sections = [
        ("Oral Health Condition", "oral_health_condition"),
        ("Gum and Tooth Assessment", "gum_and_tooth_assessment"),
        ("Dental Work Recommended", "dental_work_recommended"),
        ("Hygiene Advice", "hygiene_advice"),
    ]
    lines = [
        f"Report: {report_data.get('report_title') or 'Medical Report'}",
        f"Patient: {report_data.get('patient_name') or 'Not provided'}",
        f"Date: {report_data.get('report_date') or 'Not provided'}",
        f"Dentist/Doctor: {report_data.get('dentist') or 'Not provided'}",
    ]

    for heading, key in sections:
        values = report_data.get(key, [])
        if values:
            lines.append(f"\n{heading}:")
            lines.extend(f"- {item}" for item in values)

    raw_text = str(report_data.get("raw_text", "")).lower()
    if "diy" in raw_text or "djly" in raw_text:
        lines.append(
            "\nVerification required: OCR extracted an unclear word in the "
            "brushing advice. Check the original report; it has not been corrected."
        )

    lines.append(
        "\nNote: This is a formatted extraction of report text, not a medical diagnosis."
    )
    return "\n".join(lines)


def process_report_data(report_data: dict) -> dict:
    """Always try Groq first; return the local fallback if it is unavailable."""
    fallback_summary = format_report_fallback(report_data)
    ai_summary = generate_report_summary(report_data)

    if ai_summary:
        summary_status = "success"
        final_summary = ai_summary
        message = "AI summary generated successfully."
    else:
        summary_status = "fallback"
        final_summary = fallback_summary
        message = "AI unavailable. Local report summary provided."

    return {
        "status": "success",
        "report_data": report_data,
        "ai_summary": ai_summary,
        "summary_status": summary_status,
        "fallback_summary": fallback_summary,
        "final_summary": final_summary,
        "message": message,
    }
