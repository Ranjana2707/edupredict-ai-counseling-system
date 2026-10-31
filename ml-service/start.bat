@echo off
REM EduPredict ML Service Startup Script
REM Run this before starting the Node/Express backend.
REM
REM Usage: double-click this file or run from the ml-service folder:
REM   cd ml-service
REM   start.bat

echo ============================================
echo  EduPredict ML Inference Service
echo  Random Forest Dropout Prediction Model
echo ============================================
echo.

cd /d "%~dp0"

IF EXIST "venv\Scripts\python.exe" (
    echo [Info] Using dedicated Python virtual environment (scikit-learn 1.6.1)...
    echo [1/2] Verifying dependencies...
    venv\Scripts\pip install -r requirements.txt --quiet
    echo [2/2] Starting FastAPI server on http://127.0.0.1:5001 ...
    echo       Press Ctrl+C to stop.
    echo.
    venv\Scripts\python -m uvicorn app:app --host 127.0.0.1 --port 5001 --reload
) ELSE (
    echo [Info] Using system Python...
    echo [1/2] Installing Python dependencies...
    pip install -r requirements.txt --quiet
    echo [2/2] Starting FastAPI server on http://127.0.0.1:5001 ...
    echo       Press Ctrl+C to stop.
    echo.
    python -m uvicorn app:app --host 127.0.0.1 --port 5001 --reload
)

pause
