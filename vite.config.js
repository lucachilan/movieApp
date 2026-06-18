import { resolve } from "path";
import { defineConfig, loadEnv } from "vite";
import injectHTML from "vite-plugin-html-inject";

export default defineConfig(({ mode }) => {
  // Load env file from the 'src' directory
  const env = loadEnv(mode, resolve(__dirname, "src"), "");

  return {
    root: "src",
    plugins: [
      injectHTML(),
      {
        name: "api-proxy",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const urlObj = new URL(req.url, "http://localhost");
            const pathname = urlObj.pathname;

            // 1. Category endpoint: /api/movies/:category
            const matchCategory = pathname.match(/^\/api\/movies\/([a-zA-Z0-9_]+)$/);
            // 2. Videos endpoint: /api/movie/:id/videos
            const matchVideos = pathname.match(/^\/api\/movie\/([0-9]+)\/videos$/);
            // 3. Providers endpoint: /api/movie/:id/providers
            const matchProviders = pathname.match(/^\/api\/movie\/([0-9]+)\/providers$/);
            // 4. Detail endpoint: /api/movie/:id
            const matchDetail = pathname.match(/^\/api\/movie\/([0-9]+)$/);
            // 5. Discover endpoint: /api/discover
            const matchDiscover = pathname.match(/^\/api\/discover$/);

            let tmdbUrl = "";

            const GENRE_MAP = {
              "action": 28, "adventure": 12, "animation": 16, "comedy": 35, "crime": 80,
              "documentary": 99, "drama": 18, "family": 10751, "fantasy": 14, "history": 36,
              "horror": 27, "music": 10402, "mystery": 9648, "romance": 10749,
              "science fiction": 878, "tv movie": 10770, "thriller": 53, "war": 10752, "western": 37
            };

            if (matchCategory) {
              const category = matchCategory[1];
              tmdbUrl = `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`;
            } else if (matchVideos) {
              const id = matchVideos[1];
              tmdbUrl = `https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`;
            } else if (matchProviders) {
              const id = matchProviders[1];
              tmdbUrl = `https://api.themoviedb.org/3/movie/${id}/watch/providers`;
            } else if (matchDetail) {
              const id = matchDetail[1];
              tmdbUrl = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
            } else if (matchDiscover) {
              const queryVal = urlObj.searchParams.get("query");
              const token = env.TMDB_ACCESS_TOKEN;
              if (queryVal) {
                const cleanQuery = queryVal.trim().toLowerCase();
                const genreId = GENRE_MAP[cleanQuery];
                if (genreId) {
                  tmdbUrl = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}&language=en-US&page=1`;
                } else {
                  // Fetch keyword ID
                  const kwUrl = `https://api.themoviedb.org/3/search/keyword?query=${encodeURIComponent(cleanQuery)}&page=1`;
                  try {
                    const kwRes = await fetch(kwUrl, {
                      headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${token}`
                      }
                    });
                    if (kwRes.ok) {
                      const kwData = await kwRes.json();
                      if (kwData.results && kwData.results.length > 0) {
                        const kwId = kwData.results[0].id;
                        tmdbUrl = `https://api.themoviedb.org/3/discover/movie?with_keywords=${kwId}&language=en-US&page=1`;
                      }
                    }
                  } catch (e) {
                    // Fallback to text search on error
                  }
                  if (!tmdbUrl) {
                    tmdbUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(cleanQuery)}&language=en-US&page=1`;
                  }
                }
              } else {
                tmdbUrl = `https://api.themoviedb.org/3/discover/movie?language=en-US&page=1`;
              }
            }

            if (tmdbUrl) {
              try {
                const token = env.TMDB_ACCESS_TOKEN;
                const response = await fetch(tmdbUrl, {
                  method: "GET",
                  headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`
                  }
                });

                if (!response.ok) {
                  res.statusCode = response.status;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: `API error: ${response.statusText}` }));
                  return;
                }

                const data = await response.json();
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      watch: {
        usePolling: true,
      },
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, "src/index.html"),
          movies: resolve(__dirname, "src/movies/index.html"),
          movie: resolve(__dirname, "src/movie/index.html"),
          wishlist: resolve(__dirname, "src/wishlist/index.html"),
          search: resolve(__dirname, "src/search/index.html"),
        },
      },
    },
  };
});