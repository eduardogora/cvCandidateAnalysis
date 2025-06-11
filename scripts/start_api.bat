@echo off
cd /d "%~dp0"
uvicorn predict_applications:app --reload --host 0.0.0.0 --port 8000 