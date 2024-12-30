import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import subprocess

class StreamlitReloader(FileSystemEventHandler):
    def __init__(self, app_file):
        super().__init__()
        self.app_file = app_file
        self.process = None
        self.start_streamlit()

    def start_streamlit(self):
        """Start the Streamlit app in a subprocess."""
        print("Starting Streamlit app...")
        self.process = subprocess.Popen(["streamlit", "run", self.app_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def restart_streamlit(self):
        """Restart the Streamlit app."""
        if self.process:
            print("Stopping Streamlit app...")
            self.process.terminate()
            self.process.wait()
        print("Restarting Streamlit app...")
        self.start_streamlit()

    def on_any_event(self, event):
        """Restart the app on any file change."""
        if event.is_directory:
            return
        print(f"Detected change in: {event.src_path}")
        self.restart_streamlit()

def auto_reload(app_file, watch_dir="."):
    """Start the auto-reloader for the Streamlit app."""
    event_handler = StreamlitReloader(app_file)
    observer = Observer()
    observer.schedule(event_handler, path=watch_dir, recursive=True)
    print(f"Watching for changes in: {os.path.abspath(watch_dir)}")
    try:
        observer.start()
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping auto-reloader...")
        observer.stop()
    observer.join()

if __name__ == "__main__":
    # Specify the Streamlit app file to watch
    app_file = "app.py"  # Replace with your Streamlit app filename if different
    auto_reload(app_file)
