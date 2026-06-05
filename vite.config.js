import { resolve } from "path";
import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";

export default defineConfig({
  root: "src",
  plugins: [injectHTML()],
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
        movie: resolve(__dirname, "src/movie/index.html"),
        wishlist: resolve(__dirname, "src/wishlist/index.html"),
      },
    },
  },
});