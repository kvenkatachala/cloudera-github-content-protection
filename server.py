from flask import Flask, render_template
from flask_socketio import SocketIO
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

app = Flask(__name__)
socketio = SocketIO(app)

# Directory to monitor for new screenshots
SCREENSHOT_DIR = os.path.expanduser("~/Desktop")

class ScreenshotHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            screenshot_name = os.path.basename(event.src_path)
            socketio.emit('screenshot_alert', {'message': f'Screenshot captured: {screenshot_name}'})
            print(f"Screenshot detected: {event.src_path}")

def monitor_screenshots():
    event_handler = ScreenshotHandler()
    observer = Observer()
    observer.schedule(event_handler, path=SCREENSHOT_DIR, recursive=False)
    observer.start()
    
    try:
        while True:
            socketio.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.start_background_task(target=monitor_screenshots)
    socketio.run(app, host='0.0.0.0', port=5000)
