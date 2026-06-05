import { loadMovies } from "./movieDisplay.mjs";
import '../css/main.css';
/*
 * Client-side route definitions.
 * Maps URL pathnames to their page initialization functions.
 */
const routes = {
    "/": { handler: loadMovies, title: "Home" },
    "/index.html": { handler: loadMovies, title: "Home" },
    "/movie/": { handler: loadMovies, title: "Movie Details" },
    "/wishlist/": { handler: null, title: "Wishlist" }
};

/*
 * Initializes the correct page handler based on the current URL path.
 */
export function initRoute() {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];

    document.title = `${route.title} | Movie App`;

    document.querySelectorAll('nav a.nav-link').forEach(link => {
        if (link.getAttribute('href') === path ||
            (path === '/index.html' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    if (route.handler) {
        route.handler();
    }
}

initRoute();
