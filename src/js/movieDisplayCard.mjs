import { isWatched, isInWishlist } from "./movieModel.mjs";

const movieContainer = document.getElementById("movie-container");

// Display stars for rating
function handleRatingDisplay(rating) {
    const totalStars = 5;
    let starsHTML = '';
    for (let i = 0; i < totalStars; i++) {
        if (i < Math.floor(rating)) {
            starsHTML += '<span class="full-star">★</span>';
        } else if (i < Math.ceil(rating)) {
            starsHTML += '<span class="half-star">★</span>';
        } else {
            starsHTML += '<span class="empty-star">★</span>';
        }
    }
    return starsHTML;
}

// Display movie card
export function handleCardDisplay(movie) {
    const starsHTML = handleRatingDisplay(movie.stars);
    const watchedClass = isWatched(movie.id) ? " watched" : "";
    const wishlistClass = isInWishlist(movie.id) ? " in-wishlist" : "";

    const card = document.createElement('div');
    card.className = `movie-card${watchedClass}`;
    card.id = movie.id;
    let description = movie.description;
    if (movie.description.length > 100) {
        const sliced = movie.description.slice(0, 80);
        const lastSpace = sliced.lastIndexOf(" ");
        if (lastSpace > 0) {
            description = sliced.slice(0, lastSpace) + " <span class='more-dots'>...</span>";
        }
    }
    card.innerHTML = `
        <div class="card-badges">
            ${isWatched(movie.id) ? '<span class="badge badge-watched">Watched</span>' : ''}
            ${isInWishlist(movie.id) ? '<span class="badge badge-wishlist">♥ Wishlist</span>' : ''}
        </div>
        <img src="${movie.image_url}" alt="${movie.title}">
        <h2 class="movie-title">${movie.title}</h2>
        <p class="movie-year">${movie.year}</p>
        <p class="movie-genre">${movie.genre}</p>
        <div class="movie-rating">${starsHTML}</div>
        <p class="movie-description">${description}</p>
    `;

    movieContainer.appendChild(card);

    card.addEventListener("click", () => handleCardClick(movie));
}

function handleCardClick(movie) {
    window.location.href = `/movie/?id=${movie.id}`;
}
