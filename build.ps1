# Build Notifyy Executable
# Run this script to rebuild the executable after making changes

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Notifyy Build Script v2.0" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\.venv\Scripts\Activate.ps1

# Install/upgrade dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
python -m pip install --upgrade pip pyinstaller pillow

# Sync web files from root to notify/web
Write-Host "Syncing web files..." -ForegroundColor Yellow
Copy-Item -Path "web\*" -Destination "notify\web\" -Recurse -Force

# Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "Notifyy.spec") { Remove-Item -Force "Notifyy.spec" }

# Build executable
Write-Host "Building executable..." -ForegroundColor Green
Write-Host "(This may take 1-2 minutes)..." -ForegroundColor Gray
Write-Host ""

python -m PyInstaller `
    --noconfirm `
    --onefile `
    --windowed `
    --add-data "notify\web;web" `
    --icon="notify\web\icons\icon-192.png" `
    --name="Notifyy" `
    notify\notifyy.py

# Check if build succeeded
if (Test-Path "dist\Notifyy.exe") {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Green
    Write-Host "  ✓ Build Successful!" -ForegroundColor Green
    Write-Host "==================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executable created at: dist\Notifyy.exe" -ForegroundColor Cyan
    Write-Host "Size: $((Get-Item 'dist\Notifyy.exe').Length / 1MB) MB" -ForegroundColor Gray
    Write-Host ""
    
    # Update src folder
    Write-Host "Updating src folder..." -ForegroundColor Yellow
    if (-not (Test-Path "src")) { New-Item -ItemType Directory -Force -Path "src" | Out-Null }
    if (-not (Test-Path "src\web")) { New-Item -ItemType Directory -Force -Path "src\web" | Out-Null }
    
    Copy-Item -Path "dist\Notifyy.exe" -Destination "src\" -Force
    Copy-Item -Path "web\*" -Destination "src\web\" -Recurse -Force
    Copy-Item -Path "notifyy.py" -Destination "src\" -Force
    
    Write-Host "✓ src folder updated with latest build" -ForegroundColor Green
    Write-Host ""
    
    # Offer to run
    $run = Read-Host "Run Notifyy.exe now? (y/n)"
    if ($run -eq "y" -or $run -eq "Y") {
        Write-Host "Launching Notifyy..." -ForegroundColor Cyan
        Start-Process "dist\Notifyy.exe"
    }
    
    Write-Host ""
    Write-Host "Distribution folder: .\src\" -ForegroundColor Cyan
    Write-Host "Share the 'src' folder with end users." -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "==================================" -ForegroundColor Red
    Write-Host "  ✗ Build Failed" -ForegroundColor Red
    Write-Host "==================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Gray
    Write-Host "- Missing dependencies (run: pip install pyinstaller pillow)" -ForegroundColor Gray
    Write-Host "- Python not in PATH" -ForegroundColor Gray
    Write-Host "- Permission issues (run as Administrator)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
