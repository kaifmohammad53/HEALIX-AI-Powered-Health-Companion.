from pathlib import Path
import tempfile

# pyright: reportMissingImports=false
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File  # type: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware  # type: ignore[reportMissingImports]
from pydantic import BaseModel, Field
from dotenv import load_dotenv

app = FastAPI(
    title="HEALIX API",
    description="AI-powered healthcare decision-support prototype",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

MODEL_DIR = BASE_DIR / "MODELS" / "SYMPTOMS"

model = joblib.load(MODEL_DIR / "xgboost_symptom_model.joblib")
label_encoder = joblib.load(MODEL_DIR / "symptom_label_encoder.joblib")
symptom_columns = joblib.load(MODEL_DIR / "symptom_columns.joblib")

# Relative import keeps the existing `uvicorn BACKEND.main:app` command working.
from .medical_report.service import process_pdf_report

MAX_REPORT_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB


class SymptomRequest(BaseModel):
    symptoms: list[str] = Field(min_length=1)


@app.get("/")
def home():
    return {"message": "HEALIX API is running"}


@app.get("/symptoms")
def get_symptoms():
    return {"symptoms": symptom_columns}


@app.post("/predict")
def predict(request: SymptomRequest):
    selected = request.symptoms

    unknown = [
        symptom for symptom in selected
        if symptom not in symptom_columns
    ]

    if unknown:
        raise HTTPException(
            status_code=400,
            detail={"unknown_symptoms": unknown}
        )

    if len(set(selected)) != len(selected):
        raise HTTPException(
            status_code=400,
            detail="Duplicate symptoms are not allowed."
        )

    input_data = np.zeros(
        (1, len(symptom_columns)),
        dtype=np.uint8
    )

    symptom_index = {
        symptom: index
        for index, symptom in enumerate(symptom_columns)
    }

    for symptom in selected:
        input_data[0, symptom_index[symptom]] = 1

    probabilities = model.predict_proba(input_data)[0]
    top_indices = np.argsort(probabilities)[-3:][::-1]

    predictions = []

    for index in top_indices:
        encoded_label = model.classes_[index]
        condition = label_encoder.inverse_transform(
            [int(encoded_label)]
        )[0]

        predictions.append({
            "condition": str(condition),
            "model_score_percent": round(
                float(probabilities[index]) * 100, 2
            )
        })

    return {
        "predictions": predictions,
        "disclaimer": (
            "Experimental model output only. "
            "Not a diagnosis or a substitute for medical care."
        )
    }


@app.post("/api/process-report")
def process_medical_report(file: UploadFile = File(...)):
    """Accept a PDF report and return extracted data plus AI/fallback summary."""
    filename = file.filename or ""
    if Path(filename).suffix.lower() != ".pdf":
        raise HTTPException(status_code=415, detail="Please upload a PDF file.")

    content = file.file.read(MAX_REPORT_UPLOAD_BYTES + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")
    if len(content) > MAX_REPORT_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail="PDF is too large. Maximum upload size is 15 MB."
        )
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF.")

    temp_path: Path | None = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_file:
            temp_file.write(content)
            temp_path = Path(temp_file.name)

        return process_pdf_report(temp_path)

    except (ValueError, FileNotFoundError, RuntimeError) as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        print(f"Medical report processing failed ({type(error).__name__}): {error}")
        raise HTTPException(
            status_code=500,
            detail="Medical report processing failed. Check the backend logs."
        ) from error
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
