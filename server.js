import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load local .env if TMDB_ACCESS_TOKEN is not in process.env
if (!process.env.TMDB_ACCESS_TOKEN) {
    try {
        const envPath = path.join(__dirname, "src", ".env");
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, "utf-8");
            envConfig.split("\n").forEach(line => {
                const parts = line.split("=");
                if (parts.length >= 2) {
                    const key = parts[0].trim();
                    const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
                    process.env[key] = value;
                }
            });
        }
    } catch (e) {
        console.warn("Failed to load local .env file:", e);
    }
}

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

const server = http.createServer(async (req, res) => {
    let urlPath = req.url.split("?")[0]; // strip query strings

    // Intercept dynamic API proxy requests
    if (urlPath.startsWith("/api/")) {
        const TMDB_TOKEN = process.env.TMDB_ACCESS_TOKEN;

        if (!TMDB_TOKEN) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'TMDB_ACCESS_TOKEN environment variable is not configured on the server.' }));
            return;
        }

        let TMDB_URL = "";

        const matchCategory = urlPath.match(/^\/api\/movies\/([a-zA-Z0-9_]+)$/);
        const matchVideos = urlPath.match(/^\/api\/movie\/([0-9]+)\/videos$/);
        const matchProviders = urlPath.match(/^\/api\/movie\/([0-9]+)\/providers$/);
        const matchDetail = urlPath.match(/^\/api\/movie\/([0-9]+)$/);
        const matchDiscover = urlPath.match(/^\/api\/discover$/);

        if (matchCategory) {
            TMDB_URL = `https://api.themoviedb.org/3/movie/${matchCategory[1]}?language=en-US&page=1`;
        } else if (matchVideos) {
            TMDB_URL = `https://api.themoviedb.org/3/movie/${matchVideos[1]}/videos?language=en-US`;
        } else if (matchProviders) {
            TMDB_URL = `https://api.themoviedb.org/3/movie/${matchProviders[1]}/watch/providers`;
        } else if (matchDetail) {
            TMDB_URL = `https://api.themoviedb.org/3/movie/${matchDetail[1]}?language=en-US`;
        } else if (matchDiscover) {
            const parsedUrl = new URL(req.url, "http://localhost");
            const queryVal = parsedUrl.searchParams.get("query");
            const GENRE_MAP = {
                "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
                "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
                "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749,
                "science fiction": 878, "tv movie": 10770, "thriller": 53, "war": 10752, "western": 37
            };

            if (queryVal) {
                const cleanQuery = queryVal.trim().toLowerCase();
                const genreId = GENRE_MAP[cleanQuery];
                if (genreId) {
                    TMDB_URL = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US&page=1`;
                } else {
                    // Fetch keyword ID
                    const kwUrl = `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(cleanQuery)}&page=1`;
                    try {
                        const kwRes = await fetch(kwUrl, {
                            headers: {
                                accept: 'application/json',
                                Authorization: `Bearer ${TMDB_TOKEN}`
                            }
                        });
                        if (kwRes.ok) {
                            const kwData = await kwRes.json();
                            if (kwData.results && kwData.results.length > 0) {
                                const kwId = kwData.results[0].id;
                                TMDB_URL = `https://api.themoviedb.org/3/discover/movie?with_keywords=${kwId}&language=en-US&page=1`;
                            }
                        }
                    } catch (e) {
                        // Fallback to text search on error
                    }
                    if (!TMDB_URL) {
                        TMDB_URL = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanQuery)}&language=en-US&page=1`;
                    }
                }
            } else {
                TMDB_URL = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=1`;
            }
        }

        if (TMDB_URL) {
            fetch(TMDB_URL, {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${TMDB_TOKEN}`
                }
            })
                .then(apiRes => {
                    if (!apiRes.ok) {
                        res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
                        return apiRes.json().then(errData => res.end(JSON.stringify(errData)));
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return apiRes.json().then(data => res.end(JSON.stringify(data)));
                })
                .catch(err => {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: err.message || 'Failed to fetch from TMDB' }));
                });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Endpoint not found' }));
        }
        return;
    }

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
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
});
