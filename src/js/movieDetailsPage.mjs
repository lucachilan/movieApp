import {
    fetchMovieDetail,
    fetchMovieVideos,
    fetchMovieProviders,
    isWatched, toggleWatched,
    isInWishlist, toggleWishlist,
    getUserRating, rateMovie,
    getPreferences, toggleGenrePreference
} from "./movieModel.mjs";

export async function initMovieDetailPage() {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { document.getElementById("movie-info").innerHTML = "<p>No movie selected.</p>"; return; }

    try {
        const [detail, videos, providers] = await Promise.all([
            fetchMovieDetail(id),
            fetchMovieVideos(id),
            fetchMovieProviders(id)
        ]);

        const poster = document.querySelector("#movie-info figure img");
        poster.src = detail.poster_path
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
            : "";
        poster.alt = detail.title;

        document.querySelector(".movie-title").textContent = detail.title;
        document.querySelector(".movie-year").textContent = detail.release_date?.slice(0, 4) || "";
        document.querySelector(".movie-genre").textContent =
            detail.genres?.map(g => g.name).join(", ") || "";
        document.querySelector(".movie-rating").textContent =
            `★${detail.vote_average?.toFixed(1)} / 10`;
        document.querySelector(".movie-description").textContent = detail.overview || "";

        document.title = `${detail.title} | Movie App`;

        const watchedBtn = document.getElementById("watched-btn");
        const movie = {
            id: detail.id, title: detail.title,
            image_url: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
            year: detail.release_date?.slice(0, 4) || "",
            genre: detail.genres?.map(g => g.name).join(", ") || "",
            stars: Math.round((detail.vote_average / 2) * 10) / 10
        };
        const updateWatchedBtn = () => {
            watchedBtn.textContent = isWatched(detail.id) ? "✓ Watched" : "Mark as Watched";
            watchedBtn.classList.toggle("active-btn", isWatched(detail.id));
        };
        updateWatchedBtn();
        watchedBtn.addEventListener("click", () => { toggleWatched(movie); updateWatchedBtn(); });

        const wishlistBtn = document.querySelector(".add-to-watchlist");
        const updateWishlistBtn = () => {
            wishlistBtn.textContent = isInWishlist(detail.id) ? "♥ In Wishlist" : "Add to Wishlist";
            wishlistBtn.classList.toggle("active-btn", isInWishlist(detail.id));
        };
        updateWishlistBtn();
        wishlistBtn.addEventListener("click", () => { toggleWishlist(movie); updateWishlistBtn(); });


        const trailerBtn = document.querySelector(".play-trailer");
        const trailerContainer = document.getElementById("trailer-container");
        const trailer = videos.results?.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer && trailerContainer) {
            trailerBtn.addEventListener("click", () => {
                trailerContainer.innerHTML = `
                    <iframe id="trailer-frame"
                        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1"
                        allow="autoplay; encrypted-media" allowfullscreen></iframe>
                `;
                trailerContainer.style.display = "block";
            });
        } else if (trailerBtn) {
            trailerBtn.disabled = true;
            trailerBtn.textContent = "No Trailer Available";
        }

        const providerContainer = document.getElementById("provider-container");
        if (providerContainer) {
            const flatrate = providers?.flatrate || [];
            const rent = providers?.rent || [];
            const buy = providers?.buy || [];
            const all = [...new Map([...flatrate, ...rent, ...buy].map(p => [p.provider_id, p])).values()];

            if (all.length === 0) {
                providerContainer.innerHTML = "<p class='no-providers'>Not currently streaming in your region.</p>";
            } else {
                providerContainer.innerHTML = all.map(p => `
                    <div class="provider-badge" title="${p.provider_name}">
                        <img src="https://image.tmdb.org/t/p/w92${p.logo_path}"
                             alt="${p.provider_name}">
                        <span>${p.provider_name}</span>
                    </div>
                `).join("");
            }
        }

    } catch (e) {
        console.error("Failed to load movie detail:", e);
        document.getElementById("movie-info").innerHTML =
            "<p class='error-message'>Could not load movie details.</p>";
    }
}