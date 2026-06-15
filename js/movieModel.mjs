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
