import { loadMovies, initMovieListPage, renderMovieOfTheDay, initSearchFilter, initSearchPage } from "../js/movieList.mjs";
import { initMovieDetailPage } from "../js/movieDetailsPage.mjs";
import { initWishlistPage } from "../js/wishlist.mjs";
import "../css/main.css";


const routes = {
    "/": { handler: initHomePage, title: "Home" },
    "/index.html": { handler: initHomePage, title: "Home" },
    "/movies/": { handler: initMovieListPage, title: "Movies" },
    "/movies/index.html": { handler: initMovieListPage, title: "Movies" },
    "/wishlist/": { handler: initWishlistPage, title: "Wishlist" },
    "/wishlist/index.html": { handler: initWishlistPage, title: "Wishlist" },
    "/movie/": { handler: initMovieDetailPage, title: "Movie" },
    "/movie/index.html": { handler: initMovieDetailPage, title: "Movie" },
    "/search/": { handler: initSearchPage, title: "Search Results" },
    "/search/index.html": { handler: initSearchPage, title: "Search Results" },
};

function initHomePage() {
    loadMovies("popular");
    renderMovieOfTheDay();
}


export function initRoute() {
    const path = window.location.pathname;

    let route = routes[path];
    if (!route) {
        const matchedKey = Object.keys(routes).find(k => path.startsWith(k) && k !== "/");
        route = routes[matchedKey] || routes["/"] || { handler: null, title: "Movie App" };
    }

    document.title = `${route.title} | Movie App`;

    document.querySelectorAll('nav a.nav-link').forEach(link => {
        if (link.getAttribute('href') === path ||
            (path === '/index.html' && link.getAttribute('href') === '/') ||
            (path.startsWith('/movie/') && link.getAttribute('href') === '/movies/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    if (route.handler) {
        route.handler();
    }

    initSearchFilter();
}

initRoute();
