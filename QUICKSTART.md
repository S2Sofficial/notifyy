# Notifyy - Quick Start Guide

## 🚀 Getting Started in 30 Seconds

### Step 1: Launch
Double-click `Notifyy.exe`

### Step 2: Enable Notifications
Click the "Enable Notifications" button when the browser opens

### Step 3: Start Tracking
Fill in the form and add your first opportunity!

---

## 📝 Adding Your First Opportunity

1. **Company Name**: e.g., "Google"
2. **Role/Title**: e.g., "Software Engineer"
3. **Application Link**: (Optional) Paste the job posting URL
4. **Deadline**: Click the calendar and select a date
5. Click **"Track Opportunity"**

The deadline will automatically be set to 11:59 PM on your selected date.

---

## 👥 Managing Your Company Watchlist

### Add a Company to Track
1. Scroll to "Tracked Companies" section
2. Enter company name (e.g., "Microsoft")
3. Click "Add Company"

### View All Opportunities for a Company
Click the "Show" button next to any company

### Remove a Company
Click the "Remove" button (this doesn't delete your opportunities)

---

## ⚙️ Control Panel Settings

When you launch Notifyy.exe, a control panel appears with these options:

### ✅ Start automatically at login
- **Checked**: Notifyy launches when Windows starts
- **Unchecked**: You must manually start Notifyy

### ✅ Keep control window open (prevent closing)
- **Checked**: Control panel cannot be closed accidentally
- **Unchecked**: Normal window behavior

### Buttons
- **Open Notifyy**: Opens the app in your browser
- **Exit**: Closes the entire application

---

## 🎨 Understanding the Dashboard

### Three Columns

1. **Active Deadlines** (Left)
   - Shows opportunities you haven't applied to yet
   - Sorted by deadline (most urgent first)
   - Color-coded by urgency

2. **Applied / Pending** (Middle)
   - Applications you've submitted
   - Waiting to hear back

3. **Expired / Ignored** (Right)
   - Past deadlines
   - Opportunities you declined

### Color Coding
- 🟢 **Green border**: 7+ days remaining
- 🟠 **Orange border**: 3-7 days remaining
- 🔴 **Red border**: Less than 3 days remaining
- 🟣 **Purple border**: Already applied
- ⚫ **Gray border**: Expired or ignored

### Actions on Each Card
- **Applied**: Move to "Applied" column
- **Ignore**: Move to "Expired" column
- **Delete**: Permanently remove (only for applied/expired)

---

## 🔔 Notification Behavior

Notifyy sends smart notifications based on your deadline:

| Time Remaining | Notification Frequency |
|----------------|------------------------|
| 15+ days       | Every 3 days          |
| 7-15 days      | Daily                 |
| 3-7 days       | Every 12 hours        |
| 1-3 days       | Every 4 hours         |
| < 1 day        | Every hour            |

**Note**: You must have the app running to receive notifications. Use "Keep control window open" to ensure it stays active.

---

## 💡 Pro Tips

### Make Links Optional
Don't have an application link yet? No problem! Leave the "Application Link" field empty.

### Track Companies Without Deadlines
Use the company watchlist to keep tabs on companies you want to apply to, even if you don't have specific opportunities yet.

### Filter by Company
Click "Show" next to any company in your watchlist to see only opportunities from that company.

### Backup Your Data
Press `F12` in the browser → Console tab → paste:
```javascript
copy(JSON.stringify({
  opportunities: JSON.parse(localStorage.opportunities || '[]'),
  companies: JSON.parse(localStorage.companies || '[]')
}, null, 2))
```
Then paste into a text file and save.

### Always Running
Enable both:
- "Start automatically at login"
- "Keep control window open"

This ensures Notifyy is always running and you never miss a notification.

---

## 🆘 Common Issues

### "Cannot close the window"
→ Uncheck "Keep control window open" first, then click Exit

### "No notifications appearing"
→ Click "Enable Notifications" button and allow browser permissions

### "App won't start"
→ Check if `web` folder is in the same directory as `Notifyy.exe`

### "Forgot my deadline"
→ Check the timer countdown on each opportunity card

### "Accidentally deleted an opportunity"
→ Restore from your backup (see backup tip above)

---

## 📦 Portable Installation

**Want to use Notifyy on multiple computers?**

1. Copy the entire `src` folder to:
   - USB drive
   - Network share
   - Another PC

2. Run `Notifyy.exe` from the new location

**Note**: Your data (opportunities/companies) is stored in the browser, so it won't transfer automatically. Use the backup feature to move data between computers.

---

## 🔒 Privacy

- ✅ No internet required (besides opening browser)
- ✅ No account needed
- ✅ No data sent anywhere
- ✅ Everything stored on your computer
- ✅ No tracking or analytics

---

## Need More Help?

See the full [README.md](README.md) for detailed documentation.

---

**Version**: 2.0  
**Last Updated**: February 20, 2026
