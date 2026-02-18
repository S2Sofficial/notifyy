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

# Get the directory where the app is running from
if getattr(sys, 'frozen', False):
    APP_DIR = os.path.dirname(sys.executable)
else:
    APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Web files directory
WEB_DIR = os.path.join(APP_DIR, 'web')

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
    return {'startup_enabled': True, 'minimized': False}

def save_config(config):
    """Save configuration"""
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f, indent=2)
    except:
        pass

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

def create_control_window():
    """Create system tray or control window"""
    root = tk.Tk()
    root.title("Notifyy Control Panel")
    root.geometry("400x200")
    root.resizable(False, False)
    
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
    status_label = tk.Label(root, text="Server is running on http://localhost:PORT", 
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
    button_frame.pack(pady=15)
    
    def open_app():
        webbrowser.open('http://localhost:8000')
    
    open_btn = tk.Button(button_frame, text="Open Notifyy", command=open_app, 
                         width=15, bg="#bb86fc", fg="black", font=("Arial", 10, "bold"))
    open_btn.pack(side=tk.LEFT, padx=5)
    
    def exit_app():
        root.destroy()
    
    exit_btn = tk.Button(button_frame, text="Exit", command=exit_app, 
                         width=15, bg="#333", fg="white", font=("Arial", 10, "bold"))
    exit_btn.pack(side=tk.LEFT, padx=5)
    
    # Info label
    info_label = tk.Label(root, text="Close this window to minimize to system tray", 
                         font=("Arial", 8), fg="gray")
    info_label.pack(pady=10)
    
    return root

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
    
    # Load config and check if app should run minimized
    config = load_config()
    minimized = config.get('minimized', False)
    
    # Create window
    root = create_control_window()
    
    # Update status with actual port
    for child in root.winfo_children():
        if isinstance(child, tk.Label) and "Server is running" in child.cget("text"):
            child.config(text=f"Server is running on http://localhost:{port}")
    
    if not minimized:
        webbrowser.open(f'http://localhost:{port}')
    
    root.mainloop()

if __name__ == '__main__':
    main()
