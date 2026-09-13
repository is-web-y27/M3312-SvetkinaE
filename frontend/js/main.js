import { initParticles } from './particles.js';
import { initChat } from './chat.js';
import { initMuseumMap } from './museumMap.js';
import { initFeedback } from './feedback.js';

if (document.getElementById("feedbackForm")) {
    initFeedback();
}


if (document.getElementById('particles-js')) {
    initParticles();
}

initChat();

initMuseumMap();

(function () {
    const start = performance.now();

    window.addEventListener("load", function () {
        const end = performance.now();
        const loadTime = ((end - start) / 1000).toFixed(3); // секунды

        const footer = document.getElementById("footer-info");
        if (footer) {
            footer.textContent = `Время загрузки страницы: ${loadTime} сек.`;
        }
    });
})();

(function() {
    const currentPage = document.location.pathname.split("/").pop();

    const menuLinks = document.querySelectorAll("nav a");

    menuLinks.forEach(link => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
})();

