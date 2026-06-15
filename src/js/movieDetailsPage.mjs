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

    card.addEventListener("click", () => {
        handleCardClick(movie);
    })
}