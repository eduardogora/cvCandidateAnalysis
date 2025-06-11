#!/bin/bash
cd "$(dirname "$0")"
uvicorn predict_applications:app --reload --host 0.0.0.0 --port 8000 