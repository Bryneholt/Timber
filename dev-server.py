#!/usr/bin/env python3
"""
Simple development server for the Timber Calculator application.
This script provides a local HTTP server for development purposes.
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    
    # Change to the project directory
    os.chdir(script_dir)
    
    # Configuration
    PORT = 8000
    HOST = "localhost"
    
    # Create server
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
            print(f"🚀 Development server started!")
            print(f"📁 Serving files from: {script_dir}")
            print(f"🌐 Open your browser and go to: http://{HOST}:{PORT}")
            print(f"📱 The application will be available at: http://{HOST}:{PORT}/index.html")
            print(f"⏹️  Press Ctrl+C to stop the server")
            print("-" * 50)
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Please try a different port or stop the existing server.")
            print(f"💡 You can also run: lsof -ti:{PORT} | xargs kill -9")
        else:
            print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
