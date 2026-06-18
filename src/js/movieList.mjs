import { handleCardDisplay } from "./movieDisplayCard.mjs";
import { fetchMovies, searchDiscoverMovies } from "./movieModel.mjs";

export async function loadMovies(category = "popular") {
    const movieContainer = document.getElementById("movie-container");
    if (!movieContainer) return;

    movieContainer.innerHTML = '<div class="loading-spinner">Loading...</div>';
    try {
        const movies = await fetchMovies(category);
        movieContainer.innerHTML = '';
        movies.forEach(movie => handleCardDisplay(movie));

        const searchInput = document.getElementById("search-input");
        if (searchInput && searchInput.value.trim()) {
            const query = searchInput.value.trim().toLowerCase();
            document.querySelectorAll(".movie-card").forEach(card => {
                const title = card.querySelector(".movie-title")?.textContent.toLowerCase() || "";
                const genre = card.querySelector(".movie-genre")?.textContent.toLowerCase() || "";
                card.style.display = (title.includes(query) || genre.includes(query)) ? "" : "none";
            });
        }
    } catch (error) {
        console.error("Failed to load movies:", error);
        movieContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load movies. Please try again later.</p>
            </div>
        `;
    }
}

export function initCategoryFilter() {
    const filterContainer = document.querySelector(".categories-filter");
    if (!filterContainer) return;

    const categories = filterContainer.querySelectorAll(".category");

    categories.forEach(categoryEl => {
        categoryEl.addEventListener("click", async () => {
            const text = categoryEl.textContent.trim().toLowerCase();
            const categoryMap = {
                "popular": "popular",
                "now playing": "now_playing",
                "top rated": "top_rated",
                "upcoming": "upcoming"
            };
            const category = categoryMap[text] || "popular";

            categories.forEach(el => el.classList.remove("active"));
            categoryEl.classList.add("active");
            await loadMovies(category);
        });
    });
}

export function initSearchFilter() {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");
    if (searchParam) {
        searchInput.value = searchParam;
    }

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const query = searchInput.value.trim();
            const path = window.location.pathname;
            if (!path.includes("/movies/") && !path.includes("/wishlist/") && path !== "/" && path !== "/index.html") {
                window.location.href = `/movies/?search=${encodeURIComponent(query)}`;
            }
        }
    });

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim().toLowerCase();
        document.querySelectorAll(".movie-card").forEach(card => {
            const title = card.querySelector(".movie-title")?.textContent.toLowerCase() || "";
            const genre = card.querySelector(".movie-genre")?.textContent.toLowerCase() || "";
            card.style.display = (title.includes(query) || genre.includes(query)) ? "" : "none";
        });
    });
}

export async function renderMovieOfTheDay() {
    const container = document.getElementById("motd-container");
    if (!container) return;

    try {
        const movies = await fetchMovies("popular");
        const seed = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const idx = parseInt(seed) % movies.length;
        const movie = movies[idx];

        container.innerHTML = `
            <div class="motd-card">
                <img src="${movie.image_url}" alt="${movie.title}" class="motd-poster">
                <div class="motd-info">
                    <p class="motd-label">🎬 Movie of the Day</p>
                    <h2>${movie.title}</h2>
                    <p class="motd-meta">${movie.year} · ${movie.genre}</p>
                    <p class="motd-desc">${movie.description.slice(0, 150)}…</p>
                    <a href="/movie/?id=${movie.id}" class="btn motd-btn">View Details</a>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = "";
    }
}

export function initMovieListPage() {
    initCategoryFilter();
    initSearchFilter();

    const activeEl = document.querySelector(".categories-filter .category.active");
    if (!activeEl) {
        const popularEl = Array.from(document.querySelectorAll(".categories-filter .category"))
            .find(el => el.textContent.trim().toLowerCase() === "popular");
        if (popularEl) popularEl.classList.add("active");
    }

    const currentActive = document.querySelector(".categories-filter .category.active");
    const categoryText = currentActive ? currentActive.textContent.trim().toLowerCase() : "popular";
    const categoryMap = {
        "popular": "popular",
        "now playing": "now_playing",
        "top rated": "top_rated",
        "upcoming": "upcoming"
    };
    loadMovies(categoryMap[categoryText] || "popular");
}

export async function initSearchPage() {
    const container = document.getElementById("movie-container");
    const queryTextSpan = document.getElementById("search-query-text");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query") || "";
    if (queryTextSpan) {
        queryTextSpan.textContent = query;
    }

    if (!query) {
        container.innerHTML = "<p class='error-message'>No search query provided.</p>";
        return;
    }

    container.innerHTML = '<div class="loading-spinner">Searching...</div>';
    try {
        const movies = await searchDiscoverMovies(query);
        container.innerHTML = "";
        if (movies.length === 0) {
            container.innerHTML = "<p class='no-providers'>No movies found matching your search.</p>";
        } else {
            movies.forEach(movie => handleCardDisplay(movie));
        }
    } catch (e) {
        container.innerHTML = "<p class='error-message'>Search failed. Please try again later.</p>";
    }
}
