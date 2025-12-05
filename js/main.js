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
    const currentPage = document.location.pathname.split("/").pop(); // имя файла

    const menuLinks = document.querySelectorAll("nav a");

    menuLinks.forEach(link => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });
})();
