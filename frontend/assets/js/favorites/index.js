import { FavoritosAPI } from '../api/favoritos.api.js';

// Global Favorites State
let favoriteIds = new Set();

/**
 * Initialize Favorites System
 * - Fetches IDs from backend
 * - Updates UI to reflect status
 */
window.initFavorites = async () => {
    // Check local token existence first to avoid flash of logged-out state
    const token = localStorage.getItem('ceveco_auth_token'); // Hardcoded key check or use API

    if (!token && (typeof window.isUserAuthenticated === 'function' && !window.isUserAuthenticated())) {
        favoriteIds.clear();
        updateFavoritesUI();
        return;
    }

    try {
        const ids = await FavoritosAPI.getIds();
        favoriteIds = new Set(ids);
        updateFavoritesUI();
    } catch (error) {
        console.error('Failed to init favorites', error);
    }
};

/**
 * Update all heart icons on the page based on current state
 */
export function updateFavoritesUI() {
    // Select all favorite buttons
    const buttons = document.querySelectorAll('.btn-favorite');

    // Debug log
    // console.log('Actualizando UI de favoritos', favoriteIds, buttons.length);

    buttons.forEach(btn => {
        const id = parseInt(btn.dataset.id);

        // Lucide replaces <i data-lucide="heart"> with <svg>, so we need to find the SVG
        let icon = btn.querySelector('[data-lucide="heart"]');
        if (!icon) {
            // After Lucide renders, find the SVG element
            icon = btn.querySelector('svg');
        }

        // Handle detail button text if it exists
        const textSpan = btn.querySelector('#fav-text');

        if (favoriteIds.has(id)) {
            btn.classList.add('active');
            // Check if we are in detail page (has text span)
            if (textSpan) textSpan.textContent = 'Eliminar de Favoritos';

            if (icon) {
                icon.classList.add('text-red-500', 'fill-current');
                icon.classList.remove('text-gray-400');
            }
        } else {
            btn.classList.remove('active');
            if (textSpan) textSpan.textContent = 'Agregar a Favoritos';

            if (icon) {
                icon.classList.remove('text-red-500', 'fill-current');
                icon.classList.add('text-gray-400');
            }
        }
    });

    // Refresh icons if needed (usually class change is enough, but lucide re-render might be needed if structure changed)
    // Here we just changed classes.
}

// Expose globally for dynamic rendering interaction
window.updateFavoritesUI = updateFavoritesUI;

/**
 * Handle Toggle Action
 * @param {HTMLElement} btn - The button element
 * @param {string|number} productId 
 */
window.handleToggleFavorite = async (btn, productId, event) => {
    console.log('Toggle Favorite Clicked', productId); // Debug log
    // Prevent bubbling if inside a link (Crucial for Card)
    // We now explicitly pass event from HTML
    const e = event || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
        // e.stopImmediatePropagation(); // Optional, depending on need
    }

    if (typeof window.isUserAuthenticated === 'function' && !window.isUserAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!productId) {
        console.error('CRITICAL: No productId provided to handleToggleFavorite');
        return;
    }

    const id = parseInt(productId);
    if (isNaN(id)) {
        console.error('CRITICAL: Invalid productId:', productId);
        return;
    }
    // Optimistic UI update
    // Optimistic UI update
    const isFav = favoriteIds.has(id);

    // Toggle state
    if (isFav) {
        favoriteIds.delete(id);
    } else {
        favoriteIds.add(id);
    }

    // Update ALL buttons for this product (card + detail page)
    const allButtons = document.querySelectorAll(`.btn-favorite[data-id="${id}"]`);

    // Also try to find by ID check if button doesn't have data-id (e.g. detail page button sometimes)
    // Actually detail page button relies on `currentProduct.id_producto` in onclick. 
    // Best practice is to run the global UI updater to keep everything in sync visually

    updateFavoritesUI();

    // Animate
    btn.classList.add('scale-125');
    setTimeout(() => btn.classList.remove('scale-125'), 200);

    try {
        await FavoritosAPI.toggle(id);
        // Sync just in case (optional, maybe overkill)
    } catch (error) {
        console.error('Error toggling favorite', error);
        // Revert on error
        if (isFav) favoriteIds.add(id); else favoriteIds.delete(id);
        updateFavoritesUI(); // Re-render correct state
        alert('No se pudo actualizar favoritos. Intenta de nuevo.');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.initFavorites, 500); // Small delay to ensure auth is ready

    // Verify function is globally accessible
    console.log('handleToggleFavorite available:', typeof window.handleToggleFavorite);
});

// Listen for custom event 'productsRendered' if we add it later
document.addEventListener('productsRendered', window.initFavorites);

// Event delegation for favorite buttons (backup if onclick fails)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-favorite');
    if (btn && btn.dataset.id) {
        const productId = btn.dataset.id;
        if (window.handleToggleFavorite) {
            window.handleToggleFavorite(btn, productId, e);
        } else {
            console.error('handleToggleFavorite not found on window');
        }
    }
});
