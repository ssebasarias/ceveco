/**
 * Christmas Theme Loader
 * Injects Christmas decorations (Santa, Snow, Garland, Separator)
 * Usage: <script src="../theme/christmas/loader.js"></script>
 */

(function () {
    // 📱 Mobile Optimization: Skip theme on mobile/tablet (< 1024px)
    if (window.innerWidth < 1024) return;

    console.log('🎄 Loading Christmas Theme...');

    // 1. Helper to find path to theme assets
    // We assume this script is loaded as "../theme/christmas/loader.js" from a page in "/pages/"
    // or "/theme/christmas/loader.js" from root.
    // For simplicity in this project structure, we'll use "../theme/christmas/" as base for pages.
    const THEME_PATH = '../theme/christmas';

    // 2. Inject CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${THEME_PATH}/theme.css`;
    document.head.appendChild(link);

    // 3. Inject Global Snow
    const snowContainer = document.createElement('div');
    snowContainer.className = 'global-snow-container';
    // Generate 50 snowflakes
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        const symbols = ['❄', '❅', '❆'];
        flake.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        snowContainer.appendChild(flake);
    }
    document.body.appendChild(snowContainer);

    // 4. Inject Santa
    const santaImg = document.createElement('img');
    santaImg.src = `${THEME_PATH}/santa-hanging.png`;
    santaImg.className = 'santa-climber';
    santaImg.alt = 'Santa Hanging';
    document.body.appendChild(santaImg);

    // 5. Inject Navbar Garland (Wait for Navbar)
    // We need to inject this into or near the navbar. 
    // The CSS .navbar-garland uses fixed position, so appending to body is fine, 
    // but typically it might sit better if coordinated. 
    // The CSS says: top: 120px; fixed; width: 100%.
    const garland = document.createElement('div');
    garland.className = 'navbar-garland';
    document.body.appendChild(garland);

    // 6. Inject Footer Separator (Home Page Only usually, or above footer)
    // In index.html, it was before the footer-root.
    // We'll try to find #footer-root and insert before it.
    const footerRoot = document.getElementById('footer-root');
    if (footerRoot) {
        const separator = document.createElement('div');
        separator.className = 'christmas-separator';
        footerRoot.parentNode.insertBefore(separator, footerRoot);
    } else {
        // Fallback: append to main or body if footer search fails (though footer-root is standard here)
        const main = document.querySelector('main');
        if (main) {
            const separator = document.createElement('div');
            separator.className = 'christmas-separator';
            main.parentNode.insertBefore(separator, main.nextSibling);
        }
    }

    console.log('🎅 Christmas Theme Loaded Successfully');
})();
