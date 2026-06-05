import { getLocalStorage, setLocalStorage } from "../controllers/utils.mjs";

const MOVIE_API_URL = "https://devsapihub.com/api-movies";

export async function fetchMovies() {
    const cached = getLocalStorage("movies");

    if (cached.length > 0) {
        return cached;
    }

    const response = await fetch(MOVIE_API_URL);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const movies = await response.json();
    setLocalStorage("movies", movies);
    return movies;
}
