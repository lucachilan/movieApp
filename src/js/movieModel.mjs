import { getLocalStorage, setLocalStorage } from "./utils.mjs";

const GENRE_MAP = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};

function mapTmdbMovie(tmdbMovie) {
    const genres = (tmdbMovie.genre_ids || [])
        .map(id => GENRE_MAP[id])
        .filter(Boolean)
        .join(", ");

    const stars = tmdbMovie.vote_average ? Math.round((tmdbMovie.vote_average / 2) * 10) / 10 : 0;
    return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        description: tmdbMovie.overview || "",
        year: tmdbMovie.release_date ? tmdbMovie.release_date.split("-")[0] : "",
        image_url: tmdbMovie.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : "",
        genre: genres || "Drama",
        stars: stars
    };
}

export async function fetchMovies(category = "popular") {
    if (localStorage.getItem("movies")) {
        localStorage.removeItem("movies");
    }

    const cacheKey = `movies_${category}`;
    const cached = getLocalStorage(cacheKey);

    if (cached.length > 0) {
        return cached;
    }

    const response = await fetch(`/api/movies/${category}`);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const movies = (data.results || []).map(mapTmdbMovie);

    setLocalStorage(cacheKey, movies);
    return movies;
}

export async function fetchMovieDetail(id) {
    const response = await fetch(`/api/movie/${id}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return response.json();
}

export async function fetchMovieVideos(id) {
    const response = await fetch(`/api/movie/${id}/videos`);
    if (!response.ok) return { results: [] };
    return response.json();
}

export async function fetchMovieProviders(id) {
    const response = await fetch(`/api/movie/${id}/providers`);
    if (!response.ok) return {};
    const data = await response.json();
    return data.results?.AR || data.results?.US || Object.values(data.results || {})[0] || null;
}

export function getWatched() { return getLocalStorage("watched"); }
export function isWatched(id) { return getWatched().some(m => m.id === id); }
export function toggleWatched(movie) {
    const list = getWatched();
    const idx = list.findIndex(m => m.id === movie.id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(movie);
    setLocalStorage("watched", list);
    return idx < 0;
}

export function getWishlist() { return getLocalStorage("wishlist"); }
export function isInWishlist(id) { return getWishlist().some(m => m.id === id); }
export function toggleWishlist(movie) {
    const list = getWishlist();
    const idx = list.findIndex(m => m.id === movie.id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(movie);
    setLocalStorage("wishlist", list);
    return idx < 0;
}

export function getPreferences() {
    return JSON.parse(localStorage.getItem("preferences")) || { genres: [], userRatings: {} };
}
export function savePreferences(prefs) {
    localStorage.setItem("preferences", JSON.stringify(prefs));
}
export function rateMovie(movieId, rating) {
    const prefs = getPreferences();
    prefs.userRatings[movieId] = rating;
    savePreferences(prefs);
}
export function getUserRating(movieId) {
    return getPreferences().userRatings[movieId] || 0;
}
export function toggleGenrePreference(genre) {
    const prefs = getPreferences();
    const idx = prefs.genres.indexOf(genre);
    if (idx >= 0) prefs.genres.splice(idx, 1);
    else prefs.genres.push(genre);
    savePreferences(prefs);
    return prefs.genres;
}

export async function searchDiscoverMovies(query) {
    const response = await fetch(`/api/discover?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return (data.results || []).map(mapTmdbMovie);
}
