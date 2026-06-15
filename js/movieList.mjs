import { fetchMovies } from "./movieModel.mjs";
import { handleCardDisplay } from "./movieDisplayCard.mjs";

export async function loadMovies(category = "popular") {
    const movieContainer = document.getElementById("movie-container");
    if (!movieContainer) return;

    try {
        const movies = await fetchMovies(category);
        movieContainer.innerHTML = '';
        movies.forEach(movie => handleCardDisplay(movie));
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
            // Map UI text to TMDB category value
            const text = categoryEl.textContent.trim().toLowerCase();
            const categoryMap = {
                "popular": "popular",
                "now playing": "now_playing",
                "top rated": "top_rated",
                "upcoming": "upcoming"
            };
            const category = categoryMap[text] || "popular";

            // Remove active class from all categories
            categories.forEach(el => el.classList.remove("active"));
            
            // Add active class to clicked category
            categoryEl.classList.add("active");

            // Load and display movies for this category
            await loadMovies(category);
        });
    });
}

// Initialize the list page by setting up filters and loading initial popular list
export function initMovieListPage() {
    initCategoryFilter();
    
    // Set popular as initially active if none is active
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
