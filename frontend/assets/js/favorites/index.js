import { FavoritosAPI } from '../api/favoritos.api.js';

// Global Favorites State
let favoriteIds = new Set();

/**
 * Initialize Favorites System
 * - Fetches IDs from backend
 * - Updates UI to reflect status
 */
window.initFavorites = async () => {
    const token = localStorage.getItem('ceveco_auth_token');

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
    const buttons = document.querySelectorAll('.btn-favorite');

    buttons.forEach(btn => {
        const id = parseInt(btn.dataset.id);
        let icon = btn.querySelector('[data-lucide="heart"]');
        if (!icon) icon = btn.querySelector('svg');

        const textSpan = btn.querySelector('#fav-text');

        if (favoriteIds.has(id)) {
            btn.classList.add('active');
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
}

window.updateFavoritesUI = updateFavoritesUI;

/**
 * Handle Toggle Action
 */
window.handleToggleFavorite = async (btn, productId, event) => {
    const e = event || window.event;
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (typeof window.isUserAuthenticated === 'function' && !window.isUserAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    if (!productId) {
        console.error('CRITICAL: No productId provided');
        return;
    }

    const id = parseInt(productId);
    if (isNaN(id)) {
        console.error('CRITICAL: Invalid productId:', productId);
        return;
    }

    const isFav = favoriteIds.has(id);

    if (isFav) {
        favoriteIds.delete(id);
    } else {
        favoriteIds.add(id);
    }

    updateFavoritesUI();

    btn.classList.add('scale-125');
    setTimeout(() => btn.classList.remove('scale-125'), 200);

    try {
        await FavoritosAPI.toggle(id);

        if (isFav) {
            document.dispatchEvent(new CustomEvent('favoriteRemoved', {
                detail: { productId: id }
            }));
        }
    } catch (error) {
        console.error('Error toggling favorite', error);
        if (isFav) favoriteIds.add(id); else favoriteIds.delete(id);
        updateFavoritesUI();
        alert('No se pudo actualizar favoritos. Intenta de nuevo.');
    }
};

/**
 * Auto-detect page and setup behaviors
 */
function setupPageSpecificBehaviors() {
    const isOnFavoritesPage = window.location.pathname.includes('favoritos.html');

    if (isOnFavoritesPage) {
        document.addEventListener('favoriteRemoved', (e) => {
            const removedId = e.detail.productId;
            const card = document.querySelector(`.btn-favorite[data-id="${removedId}"]`)?.closest('div.relative');
            if (card) {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';

                setTimeout(() => {
                    card.remove();
                    const container = document.getElementById('favorites-grid');
                    const remaining = container?.querySelectorAll('.btn-favorite').length || 0;
                    const counter = document.getElementById('fav-count');
                    const empty = document.getElementById('empty-state');

                    if (counter) counter.textContent = `${remaining} producto${remaining !== 1 ? 's' : ''}`;
                    if (remaining === 0 && container && empty) {
                        container.classList.add('hidden');
                        empty.classList.remove('hidden');
                    }
                }, 300);
            }
        });
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(window.initFavorites, 500);
    setupPageSpecificBehaviors();
    console.log('✓ Favorites module loaded');
});

// Listen for custom events
document.addEventListener('productsRendered', window.initFavorites);

// Event delegation
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-favorite');
    if (btn && btn.dataset.id && window.handleToggleFavorite) {
        window.handleToggleFavorite(btn, btn.dataset.id, e);
    }
});
