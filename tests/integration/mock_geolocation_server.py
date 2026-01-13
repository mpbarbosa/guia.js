"""
Simple HTTP server that returns mock geolocation data for Firefox.
This server provides a Mozilla Location Service (MLS) compatible API response.
"""
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class MockGeolocationHandler(BaseHTTPRequestHandler):
    # Test coordinates: Milho Verde, Serro, MG
    MOCK_LAT = -18.4696091
    MOCK_LON = -43.4953982
    
    def do_GET(self):
        """Handle GET requests for geolocation data."""
        self.send_geolocation_response()
    
    def do_POST(self):
        """Handle POST requests for geolocation data."""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length > 0:
            body = self.rfile.read(content_length)
            print(f"[MOCK SERVER] Received POST request: {body.decode('utf-8', errors='ignore')}")
        
        self.send_geolocation_response()
    
    def send_geolocation_response(self):
        """Send MLS-compatible geolocation response."""
        # Return MLS-compatible response
        response = {
            "location": {
                "lat": self.MOCK_LAT,
                "lng": self.MOCK_LON
            },
            "accuracy": 10.0
        }
        
        print(f"[MOCK SERVER] Sending response: {response}")
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())
    
    def log_message(self, format, *args):
        """Log all requests for debugging."""
        print(f"[MOCK SERVER] {format % args}")

if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 9876), MockGeolocationHandler)
    print(f"Mock geolocation server running on http://127.0.0.1:9876")
    print(f"Serving coordinates: lat={MockGeolocationHandler.MOCK_LAT}, lng={MockGeolocationHandler.MOCK_LON}")
    server.serve_forever()
