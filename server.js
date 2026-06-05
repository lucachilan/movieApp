import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5173;
const DIST_DIR = path.join(__dirname, "dist");

const MIME_TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split("?")[0]; // strip query strings

    // Default to index.html for root
    if (urlPath === "/") urlPath = "/index.html";

    let filePath = path.join(DIST_DIR, urlPath);

    // Security: prevent path traversal
    if (!filePath.startsWith(DIST_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    const serveFile = (p) => {
        fs.readFile(p, (readErr, data) => {
            if (readErr) {
                // Fall back to root index.html if the sub-directory index.html doesn't exist
                const rootIndex = path.join(DIST_DIR, "index.html");
                if (p !== rootIndex) {
                    serveFile(rootIndex);
                } else {
                    res.writeHead(404);
                    res.end("404 Not Found");
                }
                return;
            }

            const ext = path.extname(p).toLowerCase();
            const contentType = MIME_TYPES[ext] || "application/octet-stream";

            res.writeHead(200, { "Content-Type": contentType });
            res.end(data);
        });
    };

    fs.stat(filePath, (err, stats) => {
        if (err) {
            serveFile(path.join(DIST_DIR, "index.html"));
            return;
        }

        if (stats.isDirectory()) {
            filePath = path.join(filePath, "index.html");
        }

        serveFile(filePath);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
