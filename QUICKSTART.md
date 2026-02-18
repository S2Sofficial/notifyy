# QUICK START GUIDE

## Immediate Testing (No Build Required)

1. **Double-click `run.bat`** to start the application immediately
   - The control panel window will appear
   - Your browser will automatically open to http://localhost:8000
   - The HTTP server runs in the background automatically

## To Build a Standalone Executable

1. **Double-click `setup.ps1`** (PowerShell - Recommended)
   - OR double-click `setup.bat` (Command Prompt)
   
2. **Follow the prompts:**
   - The script will install PyInstaller
   - Build the executable
   - Install to `C:\Program Files\Notifyy\`
   - Ask if you want auto-startup enabled

3. **After installation:**
   - The app will automatically start
   - Shortcut will be in Start Menu
   - Will auto-launch at login (if enabled)

## How It Works

### Python Application (`notifyy.py`)
- Serves web files from the `web/` directory
- Provides a control panel with auto-startup toggle
- Automatically opens your browser to http://localhost:8000
- Runs in memory - no external HTTP server needed

### Web Application (in `web/` folder)
- Progressive Web App (PWA) interface
- Tracks job deadlines
- Manages notifications
- Stores data in browser localStorage

### Auto-Startup Registry Entry
- Registers app in Windows Run key
- Automatically launches when you log in
- Can be toggled on/off from the control panel
- Configuration saved to `notifyy_config.json`

## Key Features

✅ **Self-Contained** - No separate HTTP server needed  
✅ **Auto-Launch at Login** - Starts automatically (optional)  
✅ **Toggle Auto-Startup** - Control panel to enable/disable  
✅ **Persistent Data** - All stored locally in browser  
✅ **Offline Ready** - Works without internet connection  
✅ **Dark Mode** - Easy on the eyes  

## After First Run

1. Click "Enable Notifications" to allow desktop alerts
2. Add your first job opportunity
3. Set the deadline and click "Track Opportunity"
4. Notifications will trigger based on deadline urgency

## Disabling Auto-Startup (Permanently)

The control panel lets you toggle auto-startup, but if you want to permanently disable it:

1. Open the control panel (via the running app)
2. Uncheck "Start automatically at login"
3. Click OK

Or manually remove it from startup:
1. Press Win + R
2. Type: `shell:startup`
3. Delete the Notifyy shortcut if present

## File Structure

```
Notifyy/
├── run.bat              ← Quick test launcher
├── setup.ps1            ← Full installation (PowerShell)
├── setup.bat            ← Full installation (Batch)
├── notifyy.py           ← Main Python app
├── README.md            ← Complete documentation
├── QUICKSTART.md        ← This file
└── web/
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── service-worker.js
    ├── manifest.json
    └── icons/
```

## Troubleshooting

### Nothing happens when I click run.bat
- Make sure Python is installed: Open Command Prompt and type `python --version`
- Check if port 8000 is available

### Control panel won't open
- Right-click `run.bat` → Run as Administrator
- Check Windows Event Viewer for errors

### Auto-startup not working
- Run setup as Administrator
- Go to Settings → Startup → Verify Notifyy is enabled

## Next Steps

- Read **README.md** for complete documentation
- Start adding job opportunities
- Enable notifications for deadline alerts
- Set preferences from the control panel

---

**Need help?** Check README.md for detailed documentation and troubleshooting guide.
