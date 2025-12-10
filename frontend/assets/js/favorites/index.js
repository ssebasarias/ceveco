// Global Favorites State
let favoriteIds = new Set();

/**
 * Initialize Favorites System
 * - Fetches IDs from backend
 * - Updates UI to reflect status
 */
window.initFavorites = async () => {
    // Check authentication using new Service or fallback
    const isAuth = window.AuthService?.isAuthenticated() ||
        (typeof window.isUserAuthenticated === 'function' && window.isUserAuthenticated());

    if (!isAuth) {
        favoriteIds.clear();
        updateFavoritesUI();
        return;
    }

    try {
        const ids = await window.FavoritesService.getIds();
        // Asegurar que guardamos enteros para comparación consistente
        favoriteIds = new Set(ids.map(id => parseInt(id)));
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

    if (btn.dataset.processing === 'true') return;
    btn.dataset.processing = 'true';

    const isAuth = window.AuthService?.isAuthenticated() ||
        (typeof window.isUserAuthenticated === 'function' && window.isUserAuthenticated());

    if (!isAuth) {
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
        showFavoriteNotification('Producto eliminado de favoritos', 'remove');
    } else {
        favoriteIds.add(id);
        showFavoriteNotification('Producto agregado a favoritos', 'add');
    }

    updateFavoritesUI();

    btn.classList.add('scale-125');
    setTimeout(() => btn.classList.remove('scale-125'), 200);

    try {
        await window.FavoritesService.toggle(id);

        if (isFav) {
            document.dispatchEvent(new CustomEvent('favoriteRemoved', {
                detail: { productId: id }
            }));
        }
    } catch (error) {
        console.error('Error toggling favorite', error);
        if (isFav) favoriteIds.add(id); else favoriteIds.delete(id);
        updateFavoritesUI();
        showFavoriteNotification('Error al actualizar favoritos', 'error');
    } finally {
        setTimeout(() => { btn.dataset.processing = 'false'; }, 500); // Pequeño delay extra de seguridad
    }
};

// Show notification
function showFavoriteNotification(message, type = 'add') {
    const notification = document.createElement('div');
    const bgClass = type === 'remove' ? 'bg-red-500' : 'bg-primary';
    const iconName = type === 'remove' ? 'trash-2' : 'heart';

    notification.className = `fixed top-32 right-4 ${bgClass} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in`;
    notification.innerHTML = `
        <i data-lucide="${iconName}" class="w-5 h-5 ${type === 'add' ? 'fill-current' : ''}"></i>
        <span class="font-medium">${message}</span>
    `;

    document.body.appendChild(notification);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        notification.style.transition = 'all 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

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
