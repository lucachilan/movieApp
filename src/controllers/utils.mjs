// retrieve data from localStorage
export function getLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// save data to localStorage
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// makes header darker when scrolling
addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 150) {
        header.classList.add('lower')
    }
    else {
        header.classList.remove('lower')
    }
})