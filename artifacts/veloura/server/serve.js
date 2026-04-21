/**
 * Static web server for the Veloura Expo web build.
 *
 * Serves files from ./static-build/ with SPA fallback to index.html for
 * client-side routes. Zero external dependencies.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const STATIC_ROOT = path.resolve(__dirname, "..", "static-build");
const INDEX_HTML = path.join(STATIC_ROOT, "index.html");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const isHashed = /\.[a-f0-9]{8,}\./i.test(path.basename(filePath));
  const cacheControl = isHashed
    ? "public, max-age=31536000, immutable"
    : "public, max-age=0, must-revalidate";
  const content = fs.readFileSync(filePath);
  send(res, 200, { "content-type": contentType, "cache-control": cacheControl }, content);
}

function serveIndex(res) {
  if (!fs.existsSync(INDEX_HTML)) {
    send(res, 500, { "content-type": "text/plain" }, "Build missing: run `pnpm --filter @workspace/veloura run build` first.");
    return;
  }
  const html = fs.readFileSync(INDEX_HTML);
  send(res, 200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-cache" }, html);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/" || pathname === "") {
    return serveIndex(res);
  }

  // Block path traversal.
  const safe = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, "");
  const filePath = path.join(STATIC_ROOT, safe);
  if (!filePath.startsWith(STATIC_ROOT)) {
    return send(res, 403, { "content-type": "text/plain" }, "Forbidden");
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return serveFile(filePath, res);
  }

  // SPA fallback: anything that isn't an asset file falls through to index.html
  // so expo-router can hydrate the client-side route.
  if (!path.extname(pathname)) {
    return serveIndex(res);
  }

  send(res, 404, { "content-type": "text/plain" }, "Not Found");
});

const port = parseInt(process.env.PORT || "3000", 10);
server.listen(port, "0.0.0.0", () => {
  console.log(`Veloura web build serving on port ${port}`);
});
