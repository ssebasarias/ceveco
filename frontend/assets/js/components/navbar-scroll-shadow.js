/**
 * Navbar Shadow on Scroll
 * Self-injecting: attaches to header element without modifying any HTML.
 * Adds/removes the "navbar-scrolled" CSS class after THRESHOLD px of scroll.
 */
(function () {
    const THRESHOLD = 60;
    let header = null;
    let isShadowed = false;

    function findHeader() {
        return (
            document.getElementById('main-header') ||
            document.querySelector('header[role="banner"]') ||
            document.querySelector('header')
        );
    }

    function update() {
        if (!header) header = findHeader();
        if (!header) return;
        const shouldShadow = window.scrollY > THRESHOLD;
        if (shouldShadow !== isShadowed) {
            isShadowed = shouldShadow;
            header.classList.toggle('navbar-scrolled', shouldShadow);
        }
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            update();
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // Re-query header after dynamic components (navbar.html) load
    document.addEventListener('components:loaded', () => {
        header = findHeader();
        update();
    });

    if (document.readyState !== 'loading') {
        update();
    } else {
        document.addEventListener('DOMContentLoaded', update);
    }
})();
