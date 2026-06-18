import { getWishlist } from "./movieModel.mjs";

export function initWishlistPage() {
    const container = document.getElementById("wishlist-container");
    if (!container) return;

    const wishlist = getWishlist();

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Your wishlist is empty.</p>
                <a href="/movies/" class="btn-outline">Browse Movies</a>
            </div>`;
        return;
    }

    container.innerHTML = wishlist.map(movie => `
        <div class="movie-card wishlist-card" data-id="${movie.id}">
            <img src="${movie.image_url}" alt="${movie.title}">
            <h2 class="movie-title">${movie.title}</h2>
            <p class="movie-year">${movie.year}</p>
            <p class="movie-genre">${movie.genre}</p>
            <div class="card-actions">
                <a href="/movie/?id=${movie.id}" class="btn-detail">View Details</a>
                <button class="btn-remove" data-id="${movie.id}">Remove</button>
            </div>
        </div>
    `).join("");

    // Remove from wishlist
    container.querySelectorAll(".btn-remove").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            const list = getWishlist().filter(m => m.id !== id);
            localStorage.setItem("wishlist", JSON.stringify(list));
            btn.closest(".movie-card").remove();
            if (!container.querySelector(".movie-card")) {
                initWishlistPage();
            }
        });
    });
}
