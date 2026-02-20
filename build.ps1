# Build Notifyy Executable v2.0
# Run this script from the repository root to rebuild the executable

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
    --add-data "web;web" `
    --icon="web\icons\icon-192.png" `
    --name="Notifyy" `
    notifyy.py

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
    
    # Move executable to repository root
    Write-Host "Moving executable to repository root..." -ForegroundColor Yellow
    Copy-Item -Path "dist\Notifyy.exe" -Destination "." -Force
    
    Write-Host "✓ Notifyy.exe updated in repository root" -ForegroundColor Green
    Write-Host ""
    
    # Offer to run
    $run = Read-Host "Run Notifyy.exe now? (y/n)"
    if ($run -eq "y" -or $run -eq "Y") {
        Write-Host "Launching Notifyy..." -ForegroundColor Cyan
        Start-Process ".\Notifyy.exe"
    }
    
    Write-Host ""
    Write-Host "✓ Build complete!" -ForegroundColor Green
    Write-Host "Repository is ready to commit and push." -ForegroundColor Gray
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
