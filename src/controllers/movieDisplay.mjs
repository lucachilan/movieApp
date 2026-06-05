import { fetchMovies } from "../models/movieModel.mjs";

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

    const card = document.createElement('div');
    card.className = "movie-card";
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
                    <img src="${movie.image_url}" alt="${movie.title}">
                    <h2 class="movie-title">${movie.title}</h2>
                    <p class="movie-year">${movie.year}</p>
                    <p class="movie-genre">${movie.genre}</p>
                    <div class="movie-rating">${starsHTML}</div>
                    <p class="movie-description">${description}</p>
                `;

    movieContainer.appendChild(card);
}

function renderMovies(movies) {
    movieContainer.innerHTML = '';
    movies.forEach(movie => handleCardDisplay(movie));
}

//  Load and display movies
export async function loadMovies() {
    try {
        const movies = await fetchMovies();
        renderMovies(movies);
    } catch (error) {
        console.error("Failed to load movies:", error);
        movieContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load movies. Please try again later.</p>
            </div>
        `;
    }
}

//  Display movie page
export function handlePageDisplay() {

}