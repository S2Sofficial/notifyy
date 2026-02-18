@echo off
REM Notifyy Setup Script
REM This script builds the executable and sets it up for auto-launch

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ========================================
echo Notifyy - Setup & Build
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

echo [1/3] Installing PyInstaller...
pip install pyinstaller --quiet
if errorlevel 1 (
    echo Error: Failed to install PyInstaller
    pause
    exit /b 1
)

echo [2/3] Building executable...
REM Build the executable
pyinstaller --onefile --windowed --name "Notifyy" ^
    --icon=web\icons\icon-192.png ^
    --add-data "web;web" ^
    notifyy.py

if errorlevel 1 (
    echo Error: Failed to build executable
    pause
    exit /b 1
)

echo [3/3] Setting up auto-startup...
REM Copy executable to a persistent location
set "INSTALL_DIR=%PROGRAMFILES%\Notifyy"
if not exist "!INSTALL_DIR!" (
    mkdir "!INSTALL_DIR!"
)

copy "dist\Notifyy.exe" "!INSTALL_DIR!\" /Y >nul
copy "notifyy.py" "!INSTALL_DIR!\" /Y >nul
xcopy "web" "!INSTALL_DIR!\web" /E /I /Y >nul 2>&1

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Executable location: !INSTALL_DIR!\Notifyy.exe
echo.
echo Do you want to enable auto-startup at login?
echo.
set /p response="Enable auto-startup? (Y/n): "

if /i "!response!"=="n" (
    echo Startup disabled. You can enable it later from the app.
) else (
    REM Add to registry for auto-startup
    reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run" /v "Notifyy" /t REG_SZ /d "!INSTALL_DIR!\Notifyy.exe" /f >nul
    echo Auto-startup enabled. Notifyy will start automatically at login.
)

echo.
echo Starting Notifyy...
start "" "!INSTALL_DIR!\Notifyy.exe"

echo.
pause
