import api from './APIClient.js';

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtns = document.querySelectorAll('.logout-nav');

    api.getCurrentUser().then(user => {
    }).catch(error => {
        const unauthorizedPages = ['/', '/login', '/register', '/search'];
        if (!unauthorizedPages.includes(window.location.pathname) && !window.location.pathname.startsWith('/albums/')
        && !window.location.pathname.startsWith('/offline')) {
            window.location.href = '/';
        }
    });

    logoutBtns.forEach(logoutBtn =>
        logoutBtn.addEventListener('click', () => {
            api.logOut().then(() => document.location = '/');
        })
    );
});
