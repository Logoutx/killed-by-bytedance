#!/usr/bin/env python3
"""Tiny static server that sends no-cache headers, so a reload always shows the
latest files (plain `python -m http.server` lets browsers cache index.html and
strand you on stale CSS/JS). Usage: python3 tools/serve.py [PORT] [DIR]"""
import sys, os, http.server, socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8755
DIRECTORY = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=DIRECTORY, **k)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
    print("serving %s on http://127.0.0.1:%d  (no-cache)" % (DIRECTORY, PORT))
    httpd.serve_forever()
