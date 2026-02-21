import os
import sys
import json
import threading
import webbrowser
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import tkinter as tk
from tkinter import messagebox
import winreg

try:
    import pystray
    from PIL import Image, ImageDraw
except ImportError:
    pystray = None
    Image = None
    ImageDraw = None

# Get the directory where the app is running from
if getattr(sys, 'frozen', False):
    APP_DIR = os.path.dirname(sys.executable)
else:
    APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Web files directory
WEB_DIR = os.path.join(APP_DIR, 'web')
ICON_DIR = os.path.join(WEB_DIR, 'icons')
APP_ICON_ICO = os.path.join(ICON_DIR, 'favicon.ico')
APP_ICON_PNG = os.path.join(ICON_DIR, 'web-app-manifest-192x192.png')

# Config file for startup preference
CONFIG_FILE = os.path.join(APP_DIR, 'notifyy_config.json')

# Startup registry path
STARTUP_REG_PATH = r'Software\Microsoft\Windows\CurrentVersion\Run'
STARTUP_KEY_NAME = 'Notifyy'

class WebFileHandler(SimpleHTTPRequestHandler):
    """Custom handler to serve web files"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_DIR, **kwargs)
    
    def log_message(self, format, *args):
        """Suppress server logs"""
        pass

def is_auto_startup_enabled():
    """Check if auto-startup is enabled in registry"""
    try:
        reg_key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, STARTUP_REG_PATH)
        value, _ = winreg.QueryValueEx(reg_key, STARTUP_KEY_NAME)
        winreg.CloseKey(reg_key)
        return True
    except FileNotFoundError:
        return False

def enable_auto_startup():
    """Add app to Windows startup"""
    try:
        # Get the path to this script or executable
        if getattr(sys, 'frozen', False):
            script_path = sys.executable
        else:
            script_path = os.path.abspath(__file__)
            script_path = f'python "{script_path}"'
        
        reg_key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, STARTUP_REG_PATH, 0, winreg.KEY_WRITE)
        winreg.SetValueEx(reg_key, STARTUP_KEY_NAME, 0, winreg.REG_SZ, script_path)
        winreg.CloseKey(reg_key)
        return True
    except Exception as e:
        print(f"Error enabling auto-startup: {e}")
        return False

def disable_auto_startup():
    """Remove app from Windows startup"""
    try:
        reg_key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, STARTUP_REG_PATH, 0, winreg.KEY_WRITE)
        winreg.DeleteValue(reg_key, STARTUP_KEY_NAME)
        winreg.CloseKey(reg_key)
        return True
    except FileNotFoundError:
        return True  # Already disabled
    except Exception as e:
        print(f"Error disabling auto-startup: {e}")
        return False

def load_config():
    """Load configuration"""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except:
            pass
    return {'startup_enabled': True}

def save_config(config):
    """Save configuration"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except:
        pass

def create_tray_image():
    """Create tray image using app icon from icons folder"""
    if os.path.exists(APP_ICON_ICO):
        return Image.open(APP_ICON_ICO)
    if os.path.exists(APP_ICON_PNG):
        return Image.open(APP_ICON_PNG)

    image = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    orange = (240, 90, 40, 255)
    draw.rectangle((6, 6, 28, 28), fill=(240, 90, 40, 120), outline=orange, width=2)
    draw.rectangle((36, 6, 58, 28), fill=(240, 90, 40, 160), outline=orange, width=2)
    draw.rectangle((6, 36, 28, 58), fill=(240, 90, 40, 220), outline=orange, width=2)
    draw.rectangle((36, 36, 58, 58), outline=orange, width=3)
    return image

def start_server(port=8000):
    """Start HTTP server in a background thread"""
    try:
        server = HTTPServer(('127.0.0.1', port), WebFileHandler)
        server_thread = threading.Thread(target=server.serve_forever, daemon=True)
        server_thread.start()
        return True, port
    except OSError as e:
        if "Address already in use" in str(e):
            # Try next port
            return start_server(port + 1)
        return False, None

def create_control_window(port, exit_callback):
    """Create system tray or control window"""
    root = tk.Tk()
    root.title("Notifyy Control Panel")
    root.geometry("430x190")
    root.resizable(False, False)
    if os.path.exists(APP_ICON_ICO):
        try:
            root.iconbitmap(APP_ICON_ICO)
        except Exception:
            pass
    
    # Center window
    root.update_idletasks()
    width = root.winfo_width()
    height = root.winfo_height()
    x = (root.winfo_screenwidth() // 2) - (width // 2)
    y = (root.winfo_screenheight() // 2) - (height // 2)
    root.geometry(f'{width}x{height}+{x}+{y}')
    
    # Load config
    config = load_config()
    startup_var = tk.BooleanVar(value=config.get('startup_enabled', True))
    
    # Title
    title_label = tk.Label(root, text="Notifyy", font=("Arial", 16, "bold"))
    title_label.pack(pady=10)
    
    # Status
    status_label = tk.Label(root, text=f"Server is running on http://localhost:{port}", 
                           font=("Arial", 10), fg="green")
    status_label.pack(pady=5)
    
    # Auto-startup checkbox
    def toggle_startup():
        if startup_var.get():
            if enable_auto_startup():
                config['startup_enabled'] = True
                save_config(config)
                messagebox.showinfo("Success", "Notifyy will now start automatically at login")
            else:
                startup_var.set(False)
                messagebox.showerror("Error", "Failed to enable auto-startup")
        else:
            if disable_auto_startup():
                config['startup_enabled'] = False
                save_config(config)
                messagebox.showinfo("Success", "Notifyy will not start automatically at login")
            else:
                startup_var.set(True)
                messagebox.showerror("Error", "Failed to disable auto-startup")
    
    startup_check = tk.Checkbutton(root, text="Start automatically at login", 
                                   variable=startup_var, command=toggle_startup,
                                   font=("Arial", 10))
    startup_check.pack(pady=15)
    
    # Buttons
    button_frame = tk.Frame(root)
    button_frame.pack(pady=10)
    
    def open_app():
        webbrowser.open(f'http://localhost:{port}')
    
    open_btn = tk.Button(button_frame, text="Open Notifyy", command=open_app, 
                         width=15, bg="#bb86fc", fg="black", font=("Arial", 10, "bold"))
    open_btn.pack(side=tk.LEFT, padx=5)
    
    exit_btn = tk.Button(button_frame, text="Exit", command=exit_callback, 
                         width=15, bg="#333", fg="white", font=("Arial", 10, "bold"))
    exit_btn.pack(side=tk.LEFT, padx=5)
    
    # Info label
    info_label = tk.Label(root, text="This panel stays hidden in system tray until opened manually", 
                         font=("Arial", 8), fg="gray")
    info_label.pack(pady=10)

    # Close always hides to tray
    def on_close():
        root.withdraw()

    root.protocol('WM_DELETE_WINDOW', on_close)
    
    return root

def create_tray_icon(root, port, exit_callback):
    """Create and run tray icon with menu actions"""
    if pystray is None or Image is None:
        return None

    def show_panel(icon, item):
        def _show():
            root.deiconify()
            root.lift()
            root.focus_force()
        root.after(0, _show)

    def open_notifyy(icon, item):
        webbrowser.open(f'http://localhost:{port}')

    def quit_notifyy(icon, item):
        root.after(0, exit_callback)

    tray_menu = pystray.Menu(
        pystray.MenuItem('Open Notifyy', open_notifyy),
        pystray.MenuItem('Open Control Panel', show_panel),
        pystray.MenuItem('Exit', quit_notifyy)
    )

    tray_icon = pystray.Icon('Notifyy', create_tray_image(), 'Notifyy', tray_menu)
    try:
        tray_icon.run_detached()
    except Exception:
        threading.Thread(target=tray_icon.run, daemon=True).start()
    return tray_icon

def main():
    """Main entry point"""
    # Ensure web directory exists
    if not os.path.exists(WEB_DIR):
        print(f"Error: Web directory not found at {WEB_DIR}")
        sys.exit(1)
    
    # Start server
    success, port = start_server(8000)
    if not success:
        messagebox.showerror("Error", "Failed to start server. Port may be in use.")
        sys.exit(1)
    
    tray_ref = {'icon': None}

    root = None

    def exit_app():
        if tray_ref['icon'] is not None:
            tray_ref['icon'].stop()
            tray_ref['icon'] = None
        if root is not None and root.winfo_exists():
            root.destroy()

    root = create_control_window(port, exit_app)

    tray_ref['icon'] = create_tray_icon(root, port, exit_app)
    if tray_ref['icon'] is None:
        messagebox.showwarning(
            "Tray Unavailable",
            "System tray support is unavailable. Control panel will stay visible."
        )
    else:
        root.withdraw()

    webbrowser.open(f'http://localhost:{port}')

    root.mainloop()

if __name__ == '__main__':
    main()
