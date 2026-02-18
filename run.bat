@echo off
REM Quick Start - Run Notifyy without building an executable
REM This is for testing only. Use setup.bat for full installation.

cd /d "%~dp0"

echo Starting Notifyy...
python notifyy.py

if errorlevel 1 (
    echo.
    echo Error: Failed to start Notifyy
    echo Make sure Python is installed and all dependencies are available.
    pause
    exit /b 1
)
