# 📋 Notifyy - Application Deadline Tracker

A **standalone desktop application** for tracking job application deadlines with automated notifications. Runs independently without external services, with automatic Windows login startup capability.

## 🎯 Features

✅ **Self-Contained Application**  
- No need for external HTTP servers
- Built-in web server runs in the background
- Single executable after build

✅ **Smart Notifications**  
- Escalating notification schedule based on deadline urgency
- Desktop alerts with sound
- Browser notifications with vibration

✅ **Auto-Startup at Login** *(Optional)*  
- Toggle notification auto-launch via control panel
- Persistent configuration saved locally
- Can be disabled anytime

✅ **Progressive Web App**  
- Offline-first with service worker caching
- Beautiful dark mode UI
- Responsive design for all devices

✅ **Local Data Storage**  
- All data stored in browser's localStorage
- No cloud dependency
- Complete privacy

## 📦 Installation

### Quick Start (Testing)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/S2Sofficial/notify.git
   cd notify
   ```

2. **Run immediately** (requires Python 3.8+)
   ```bash
   run.bat
   ```
   Browser will auto-open to `http://localhost:8000`

### Full Setup (Build Executable)

#### Option A: PowerShell (Recommended)
```powershell
# Right-click setup.ps1 → Run with PowerShell
# Or run in PowerShell:
.\setup.ps1
```

#### Option B: Command Prompt
```batch
# Double-click setup.bat or:
setup.bat
```

#### Option C: Manual Build
```bash
# Install PyInstaller
pip install pyinstaller pywin32

# Build executable
pyinstaller --onefile --windowed --name "Notifyy" ^
    --add-data "web;web" notifyy.py

# Copy to Program Files
copy dist\Notifyy.exe "C:\Program Files\Notifyy\"
copy web "C:\Program Files\Notifyy\web" /E /I /Y
```

## 🚀 Usage

### Starting the App

**After Installation:**
- Launch from Start Menu → Notifyy
- Or run: `Notifyy.exe` from installation directory

**During Development:**
- Double-click `run.bat`
- App opens at `http://localhost:8000`

### First Run

1. **Enable Notifications** (if desired)
   - Click "Enable Notifications" button
   - Grant browser permission when prompted

2. **Add Your First Opportunity**
   - Fill in Company Name
   - Enter Role/Job Title
   - Paste Application URL (must be HTTPS)
   - Set deadline date and time
   - Click "Track Opportunity"

3. **Manage Auto-Startup** (Control Panel)
   - Check "Start automatically at login" to auto-launch
   - Uncheck to require manual startup
   - Setting persists across restarts

### Dashboard Sections

| Section | Content |
|---------|---------|
| **Active Deadlines** | Pending applications sorted by urgency |
| **Applied / Pending** | Submissions you've already made |
| **Expired / Ignored** | Past deadlines or rejected opportunities |

### Urgency Colors

- 🟢 **Green** - More than 7 days remaining
- 🟠 **Orange** - 3-7 days remaining  
- 🔴 **Red** - Less than 3 days remaining

### Notification Schedule

Notifications are intelligently timed based on days remaining:

| Days Remaining | Frequency |
|---|---|
| 15+ days | Every 3 days |
| 7-15 days | Daily |
| 3-7 days | Every 12 hours |
| 1-3 days | Every 4 hours |
| < 1 day | Every hour |

## 🏗️ Project Structure

```
notify/
├── notifyy.py              # Main Python application
├── setup.ps1               # PowerShell installer
├── setup.bat               # Batch installer
├── run.bat                 # Quick start launcher
├── README.md               # This file
├── QUICKSTART.md           # Quick setup guide
└── web/                    # Web application files
    ├── index.html          # UI structure
    ├── app.js              # Logic & notifications
    ├── styles.css          # Styling
    ├── manifest.json       # PWA manifest
    ├── service-worker.js   # Offline support
    └── icons/              # App icons
        ├── icon-192.png
        └── icon-512.png
```

## 🔧 How It Works

### Python Application (`notifyy.py`)
- HTTP server (port 8000)
- Control panel window (Tkinter GUI)
- Windows registry management for auto-startup
- Configuration file: `notifyy_config.json`

### Web Application (`web/`)
- **Progressive Web App** (PWA)
- **Service Worker** for offline support
- **localStorage** for data persistence
- Real-time countdown timers
- Foreground notifications with audio

### Auto-Startup Mechanism

Registry entry added to:
```
HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run
Name: Notifyy
Value: Path to Notifyy.exe
```

## 📋 System Requirements

| Requirement | Specification |
|---|---|
| **OS** | Windows 10 or later |
| **Python** | 3.8+ (for running from source) |
| **RAM** | 512 MB minimum |
| **Disk Space** | 150 MB (includes dependencies) |
| **Browser** | Any modern browser (Edge, Chrome, Firefox) |

## 🔐 Data & Privacy

- ✅ **100% Local Storage** - All data on your computer
- ✅ **No Cloud Services** - No internet required after installation
- ✅ **No Tracking** - No analytics or telemetry
- ✅ **Open Source** - Code is publicly available

### Backup Your Data

Export opportunities as JSON:

```javascript
// In browser console (F12):
copy(JSON.stringify(JSON.parse(localStorage.opportunities), null, 2))
```

Paste into a text file for safekeeping.

## ⚙️ Configuration

### Control Panel Options

**Auto-Startup Toggle**
- Enables/disables application launch at Windows login
- Setting saved to `notifyy_config.json`

**Notification Settings**
- Enable/disable desktop notifications
- No additional popup configuration needed (uses smart escalation)

### Configuration File

`notifyy_config.json` (created after first run):
```json
{
  "startup_enabled": true,
  "minimized": false
}
```

## 🐛 Troubleshooting

### App won't start
```
Error: "Port 8000 already in use"
Solution: Close other applications using port 8000, or the app will auto-retry on port 8001
```

### Notifications not appearing
1. Check Windows notification settings
2. Click "Enable Notifications" in app
3. Verify browser notification permissions
4. Grant permission when prompted

### Auto-startup not working
1. Run setup as Administrator
2. Ensure Windows Startup folder allows registry entries
3. Check Settings → Apps → Startup (toggle Notifyy)

### Can't disable auto-startup
1. Launch app as Administrator
2. Uncheck "Start automatically at login"
3. Or manually remove from Windows Run registry

## 👨‍💻 Development

### Running from Source

```bash
# Install dependencies
pip install pyinstaller pywin32

# Run application
python notifyy.py
```

### Building Executable

```bash
pip install pyinstaller

pyinstaller --onefile --windowed --name "Notifyy" \
    --add-data "web;web" notifyy.py
```

Output: `dist/Notifyy.exe`

### Modifying the Web UI

1. Edit files in `web/` folder
2. Re-run `python notifyy.py` to test changes
3. Rebuild executable when satisfied

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Free to use, modify, and distribute

## 🆘 Support

### Common Questions

**Q: Does it work offline?**  
A: Yes! Service worker caches all files. Internet not required after first launch.

**Q: Can I export my data?**  
A: Yes, use the browser console method above to export as JSON.

**Q: What happens if I uncheck auto-startup?**  
A: App won't launch at login. You'll need to run Notifyy.exe manually. Can re-enable anytime.

**Q: Is my data safe?**  
A: Completely safe. All stored locally in browser, no cloud sync or tracking.

### Getting Help

1. Check **QUICKSTART.md** for quick setup
2. Review troubleshooting section above
3. Check application console (F12) for errors
4. Open an issue on GitHub

## 🗺️ Roadmap

- [ ] Multi-user support
- [ ] Custom notification sounds
- [ ] Reminder customization
- [ ] Application statistics
- [ ] Email notifications option
- [ ] Calendar integration

## 📍 Version History

**v1.0** (Feb 2026)
- Initial release
- Basic deadline tracking
- Smart notifications
- Auto-startup support

---

**Made with ❤️ for job seekers everywhere**

For updates and issues, visit: [GitHub Repository](https://github.com/S2Sofficial/notify)
