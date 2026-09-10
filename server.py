#!/usr/bin/env python3
"""Sirve la galería y /lib/babylon-ads-player.js con CORS para el otro sitio."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 8765
LIB_JS = ROOT / "lib" / "babylon-ads-player.js"
LIB_MAP = ROOT / "lib" / "babylon-ads-player.js.map"
ALIASES = {
    "/lib/babylon-ads-player.js": LIB_JS,
    "/babylon-ads-player.js": LIB_JS,
    "/lib/babylon-ads-player.js.map": LIB_MAP,
    "/babylon-ads-player.js.map": LIB_MAP,
}


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def translate_path(self, path):
        clean = path.split("?", 1)[0]
        alias = ALIASES.get(clean)
        if alias and alias.is_file():
            return str(alias)
        return super().translate_path(path)


if __name__ == "__main__":
    httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"http://127.0.0.1:{PORT}/lib/babylon-ads-player.js")
    httpd.serve_forever()
