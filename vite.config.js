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
            const match = urlObj.pathname.match(/^\/api\/movies\/([a-zA-Z0-9_]+)$/);

            if (match) {
              const category = match[1];
              try {
                const url = `https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`;
                const token = env.TMDB_ACCESS_TOKEN;

                const response = await fetch(url, {
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
          movie: resolve(__dirname, "src/movies/index.html"),
          wishlist: resolve(__dirname, "src/wishlist/index.html"),
        },
      },
    },
  };
});