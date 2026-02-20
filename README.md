# Notifyy v2.0 - Deadline Tracking & Company Watchlist

A Progressive Web App for tracking job application deadlines with automatic notifications and company watchlist management.

> **📦 This repository contains everything you need - just download and run `Notifyy.exe`!**

## ✨ Features

✅ **Standalone Desktop Application** - Runs independently with built-in web server  
✅ **Company Watchlist** - Track and monitor companies you're interested in  
✅ **Date-Only Deadlines** - Simple date selection (no time required)  
✅ **Optional Links** - Add application links only when needed  
✅ **Auto-Launch at Login** - Automatically starts when you log in to Windows  
✅ **Keep Window Open** - Prevent accidental closure of control panel  
✅ **Smart Notifications** - Intelligent notification scheduling based on urgency  
✅ **Dark Mode** - Beautiful dark theme optimized for long sessions  
✅ **Offline Support** - Service worker caching for offline access  
✅ **Local Storage** - All data stored locally in your browser  

## 🚀 Quick Start

### For End Users (Executable)

1. **Download this repository** (or just download `Notifyy.exe`)
2. **Run `Notifyy.exe`** - Double-click to launch
3. **Enable Notifications** - Click the button when prompted
4. **Start Tracking** - Add opportunities and companies

That's it! No installation, no Python required. The entire app is self-contained.

### For Developers (Python Source)

**Requirements:**
- Windows 10 or later
- Python 3.8+

**Run from source:**
```powershell
python notifyy.py
```

**Build executable:**
```powershell
.\build.ps1
```

The app will:
- Start a local web server on port 8000 (or next available)
- Open in your default browser automatically
- Show a control panel for settings

## 📖 Usage Guide

### Adding Opportunities

1. **Fill in the form:**
   - **Company Name** - Required
   - **Role/Title** - Required
   - **Application Link** - Optional (leave blank if not needed)
   - **Deadline** - Date only (defaults to end of selected day)

2. **Click "Track Opportunity"**

The deadline will automatically be set to 11:59 PM on the selected date.

### Company Watchlist

Track companies you frequently apply to:

1. **Add a Company:**
   - Enter company name in the "Tracked Companies" section
   - Click "Add Company"

2. **View Opportunities:**
   - Click "Show" next to a company to filter opportunities
   - See how many opportunities you have per company

3. **Remove Companies:**
   - Click "Remove" to delete from watchlist

### Managing Opportunities

**Dashboard Columns:**
- **Active Deadlines** - Pending applications sorted by urgency
- **Applied / Pending** - Applications you've already submitted
- **Expired / Ignored** - Old or declined opportunities

**Actions:**
- **Applied** - Move to "Applied" column
- **Ignore** - Move to "Expired" column
- **Delete** - Remove permanently (only for applied/expired items)

### Urgency Indicators

Opportunities are color-coded by remaining time:
- 🟢 **Green** - More than 7 days remaining
- 🟠 **Orange** - 3-7 days remaining
- 🔴 **Red** - Less than 3 days remaining

### Notification Schedule

Notifications are intelligently timed based on deadline urgency:
- **15+ days**: Every 3 days
- **7-15 days**: Daily
- **3-7 days**: Every 12 hours
- **1-3 days**: Every 4 hours
- **Less than 1 day**: Every hour

## ⚙️ Control Panel Settings

The control panel provides:

### Auto-Startup
- ✅ **Enabled** - App starts automatically at Windows login
- ❌ **Disabled** - Manual launch required

### Keep Window Open
- ✅ **Enabled** - Prevents closing of control panel (app remains always running)
- ❌ **Disabled** - Allows normal window closing

### Actions
- **Open Notifyy** - Opens the app in your browser
- **Exit** - Closes the application

## 📂 Repository Structure

```
notify/ (this repository)
├── Notifyy.exe              # ⭐ Standalone executable (ready to run!)
├── notifyy.py               # Python source code
├── build.ps1                # Automated build script
├── README.md                # Complete documentation (this file)
├── QUICKSTART.md            # Quick start guide
├── VERIFICATION.md          # Technical verification report
├── BUILD_COMPLETE.md        # Build & implementation details
├── .gitignore               # Git ignore rules
└── web/                     # Web application files (bundled in exe)
    ├── index.html           # UI with companies section
    ├── app.js               # Logic with v2.0 features
    ├── styles.css           # Enhanced dark theme
    ├── service-worker.js    # Offline support
    ├── manifest.json        # PWA manifest
    └── icons/               # App icons (192px, 512px)
```

**Everything you need is in this repository!**

## 💾 Data Storage

**Local Storage:**
- All opportunities stored in browser localStorage
- Company watchlist stored in browser localStorage
- No cloud sync - everything stays on your computer
- No account required - works completely offline

**Backup Your Data:**
1. Open browser Developer Tools (Press F12)
2. Go to Console tab
3. Export opportunities:
   ```javascript
   copy(JSON.stringify(JSON.parse(localStorage.opportunities), null, 2))
   ```
4. Export companies:
   ```javascript
   copy(JSON.stringify(JSON.parse(localStorage.companies), null, 2))
   ```
5. Paste into text files for safekeeping

**Restore Data:**
1. Open Developer Tools Console
2. Run:
   ```javascript
   localStorage.setItem('opportunities', 'YOUR_BACKUP_JSON')
   localStorage.setItem('companies', 'YOUR_COMPANIES_JSON')
   ```
3. Refresh the page

## 🔧 Troubleshooting

### Executable Won't Start
- **Check Windows SmartScreen**: Click "More info" → "Run anyway"
- **Verify web folder**: Ensure `web` folder is next to `Notifyy.exe`
- **Port conflict**: Close apps using port 8000 or let Notifyy find next available port

### Notifications Not Working
1. Click "Enable Notifications" button in the app
2. Check Windows notification settings (Settings → System → Notifications)
3. Ensure browser has notification permissions

### Control Panel Won't Close
- If "Keep Window Open" is enabled, disable it first
- Then click Exit button or close the window

### Data Lost After Browser Clear
- Browser data clearing will remove all opportunities
- Always backup data before clearing browser cache/storage
- Consider using separate browser profile for Notifyy

### App Not in Startup
1. Open Control Panel
2. Check "Start automatically at login"
3. If still not working, check Windows Task Manager → Startup tab

## 🎨 UI Enhancements

**New in This Version:**
- Gradient header with animated text
- Enhanced company cards with hover effects
- Scrollable lists with custom scrollbars
- Smooth button hover animations
- Box shadows for depth
- Responsive layout for mobile devices

## 🔐 Privacy & Security

- ✅ No internet connection required (except for initial browser launch)
- ✅ No data collection or tracking
- ✅ No external API calls
- ✅ All data stored locally
- ✅ No registration or login required

## 📋 System Requirements

- **OS**: Windows 10 or later
- **RAM**: 256 MB minimum
- **Disk**: 50 MB for portable installation
- **Browser**: Any modern browser (Chrome, Edge, Firefox, etc.)
- **Python**: Not required for executable; 3.8+ for source

## 🚢 Distribution & Transfer

This repository is fully portable:

1. **Clone or download this repository** to:
   - Your computer
   - USB drive
   - Network share
   - Another computer

2. **Run `Notifyy.exe` on any Windows 10+ machine** - No installation needed

3. **Data portability**: Each computer has separate browser data (localStorage). Use backup/restore to sync data between machines.

**To share with others:**
- Share the repository link: https://github.com/S2Sofficial/notify
- Or send just the `Notifyy.exe` and `web` folder

## 🛠️ Building from Source

If you want to rebuild the executable:

1. **Install dependencies:**
   ```powershell
   pip install pyinstaller pillow
   ```

2. **Build executable:**
   ```powershell
   pyinstaller --noconfirm --onefile --windowed --add-data "web;web" --icon="web/icons/icon-192.png" --name="Notifyy" notifyy.py
   ```

3. **Output:** `dist/Notifyy.exe`

## 📝 Changelog

### Version 2.0 (February 2026)
- ✨ Added company watchlist feature
- ✨ Date-only deadlines (no time selection)
- ✨ Optional application links
- ✨ Keep window open setting
- 🎨 Enhanced UI with gradients and animations
- 🎨 Custom scrollbars and hover effects
- 🐛 Fixed deadline parsing for end-of-day
- 🐛 Improved control panel close behavior

### Version 1.0
- Initial release with basic deadline tracking

## 📄 License

MIT License - Free to use, modify, and distribute

## 🆘 Support

For issues or questions:
1. Check this README
2. Review the control panel settings
3. Check browser console for errors (F12 → Console)

---

**Version**: 2.0  
**Last Updated**: February 20, 2026  
**Built with**: Python, JavaScript, HTML5, CSS3
