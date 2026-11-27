
@echo off
title HEALIX - Start All Services

cd /d "C:\Users\Mr. kaif\OneDrive\Desktop\Healix-AI"

echo ======================================
echo       STARTING HEALIX AI SYSTEM
echo ======================================

echo Starting Python AI Model...
start "Healix AI Model - Python" cmd /k ".\venv\Scripts\python.exe -m uvicorn main:app --reload --app-dir Backend --host 127.0.0.1 --port 8000"

echo Starting Java Spring Boot Backend...
start "Healix Backend - Java" "C:\Program Files\Git\bin\bash.exe" -lc "cd ~/OneDrive/Desktop/Healix-AI/Backend; ./mvnw spring-boot:run; echo; read -p 'Java backend stopped. Press Enter to close...'"

echo Starting React Frontend...
start "Healix Frontend - React" cmd /k "npm run dev"

echo.
echo All startup commands have been launched.
echo.
echo Python AI Model: http://127.0.0.1:8000/docs
echo Java Backend:    http://localhost:8081
echo React Frontend:  http://localhost:5173
echo.
pause
