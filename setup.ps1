# Notifyy Setup Script (PowerShell)
# This script builds the executable and sets it up for auto-launch

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Notifyy - Setup & Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    python --version | Out-Null
} catch {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://www.python.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[1/4] Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet | Out-Null

Write-Host "[2/4] Installing PyInstaller..." -ForegroundColor Yellow
pip install pyinstaller --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to install PyInstaller" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[3/4] Building executable..." -ForegroundColor Yellow
$currentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $currentDir

pyinstaller --onefile --windowed --name "Notifyy" `
    --icon="web/icons/icon-192.png" `
    --add-data "web;web" `
    notifyy.py 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to build executable" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[4/4] Setting up installation..." -ForegroundColor Yellow

# Install to Program Files
$installDir = "C:\Program Files\Notifyy"
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

Copy-Item "dist/Notifyy.exe" "$installDir/" -Force | Out-Null
Copy-Item "notifyy.py" "$installDir/" -Force | Out-Null
Copy-Item "web" "$installDir/web" -Recurse -Force | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Executable location: $installDir\Notifyy.exe" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Enable auto-startup at login? (Y/n)"

if ($response.ToLower() -eq "n") {
    Write-Host "Startup disabled. You can enable it later from the app." -ForegroundColor Yellow
} else {
    # Add to registry
    $regPath = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"
    New-ItemProperty -Path $regPath -Name "Notifyy" -Value "$installDir\Notifyy.exe" -PropertyType String -Force | Out-Null
    Write-Host "Auto-startup enabled. Notifyy will start automatically at login." -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting Notifyy..." -ForegroundColor Cyan
Start-Process "$installDir\Notifyy.exe"

Write-Host ""
Read-Host "Press Enter to exit"
