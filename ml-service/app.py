"""
EduPredict ML Inference Service
================================
A lightweight FastAPI service that loads the trained Random Forest dropout
prediction model once at startup and exposes a single POST /predict endpoint.

Architecture:
  React Frontend
      ↓
  Node/Express  (server.ts)
      ↓
  This FastAPI service  (ml-service/app.py)  ← you are here
      ↓
  dropout_prediction_model.pkl  (Random Forest + preprocessing pipeline)

Usage:
  cd ml-service
  uvicorn app:app --host 127.0.0.1 --port 5001 --reload

Or use the helper script:
  ml-service/start.bat
"""

from pathlib import Path
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

# ─────────────────────────────────────────────
# App Initialisation
# ─────────────────────────────────────────────
app = FastAPI(
    title="EduPredict ML Inference API",
    description="Dropout prediction using a trained Random Forest Classifier.",
    version="1.0.0"
)

# Allow calls from the Express backend running on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Model Loading  (once at startup)
# ─────────────────────────────────────────────
MODEL_PATH = Path(__file__).resolve().parent / "dropout_prediction_model.pkl"

print(f"[EduPredict ML] Loading model from: {MODEL_PATH}")
try:
    model = joblib.load(MODEL_PATH)
    print("[EduPredict ML] [OK] Random Forest model loaded successfully.")
except FileNotFoundError:
    print(f"[EduPredict ML] [ERROR] Model file not found at: {MODEL_PATH}")
    model = None
except Exception as e:
    print(f"[EduPredict ML] [ERROR] Failed to load model: {e}")
    model = None

# Valid branch categories (must match ML training dataset exactly)
VALID_BRANCHES = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
]

# ─────────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────────
class PredictionRequest(BaseModel):
    """
    The six features the Random Forest model was trained on.
    Field names must match the DataFrame column headers used during training.
    """
    Branch: str = Field(..., description="Engineering branch (e.g. 'Computer Science & Engineering')")
    Semester: int = Field(..., ge=1, le=8, description="Semester number (1–8)")
    Attendance: float = Field(..., alias="Attendance (%)", ge=0.0, le=100.0, description="Attendance percentage")
    Assignments: float = Field(..., alias="Assignments Written (%)", ge=0.0, le=100.0, description="Assignments written percentage")
    CGPA: float = Field(..., ge=0.0, le=10.0, description="Cumulative Grade Point Average")
    Backlogs: int = Field(..., ge=0, description="Number of active backlogs")

    class Config:
        populate_by_name = True  # allow both alias and field name


class PredictionResponse(BaseModel):
    prediction: int                    # 0 = No Dropout, 1 = Dropout
    dropout_probability: float         # e.g. 0.6832
    dropout_probability_percent: float # e.g. 68.32
    risk_level: str                    # "High" | "Medium" | "Low"


# ─────────────────────────────────────────────
# Health Check
# ─────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "ok" if model is not None else "model_not_loaded",
        "model": "Random Forest Classifier",
        "version": "1.0.0"
    }


# ─────────────────────────────────────────────
# Prediction Endpoint
# ─────────────────────────────────────────────
@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    """
    Accepts the six ML model features and returns:
      - prediction (0 or 1)
      - dropout_probability (0.0 – 1.0)
      - dropout_probability_percent (0.0 – 100.0)
      - risk_level ("High", "Medium", or "Low")

    Risk thresholds (project-defined):
      High   → probability ≥ 60%
      Medium → probability ≥ 40% and < 60%
      Low    → probability < 40%
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded. Ensure dropout_prediction_model.pkl is present in ml-service/."
        )

    # Validate branch
    if data.Branch not in VALID_BRANCHES:
        raise HTTPException(
            status_code=422,
            detail=f"Invalid branch '{data.Branch}'. Valid values: {VALID_BRANCHES}"
        )

    # Build a DataFrame with the EXACT column names the model pipeline expects
    input_df = pd.DataFrame([{
        "Branch": data.Branch,
        "Semester": data.Semester,
        "Attendance (%)": data.Attendance,
        "Assignments Written (%)": data.Assignments,
        "CGPA": data.CGPA,
        "Backlogs": data.Backlogs,
    }])

    # Run inference
    try:
        prediction = int(model.predict(input_df)[0])
        probability = float(model.predict_proba(input_df)[0][1])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

    # Classify risk level using project-defined thresholds
    if probability >= 0.60:
        risk_level = "High"
    elif probability >= 0.40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return PredictionResponse(
        prediction=prediction,
        dropout_probability=round(probability, 4),
        dropout_probability_percent=round(probability * 100, 2),
        risk_level=risk_level,
    )


# ─────────────────────────────────────────────
# Entry point (for direct `python app.py` run)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5001, reload=False)
