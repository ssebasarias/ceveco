/**
 * Lógica para la página de Favoritos
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Inicializar iconos
    if (window.lucide) window.lucide.createIcons();

    // Configurar Sidebar (Usuario)
    setupSidebar();

    // Cargar Favoritos
    await loadFavoritesPage();
});

/**
 * Carga información básica del usuario en el sidebar
 */
function setupSidebar() {
    const user = AuthService.getCurrentUser();

    // Si no hay usuario, redirigir al login
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    const nameEl = document.getElementById('sidebar-name');
    const emailEl = document.getElementById('sidebar-email');
    const avatarImg = document.getElementById('profile-avatar');
    const defaultAvatar = document.getElementById('default-avatar');

    if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido || ''}`;
    if (emailEl) emailEl.textContent = user.email;

    if (user.avatar_url && avatarImg && defaultAvatar) {
        avatarImg.src = user.avatar_url;
        avatarImg.classList.remove('hidden');
        defaultAvatar.classList.add('hidden');
    }
}

/**
 * Cargar y renderizar la lista de favoritos
 */
async function loadFavoritesPage() {
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const grid = document.getElementById('favorites-grid');
    const countBadge = document.getElementById('fav-count');

    try {
        // Obtener favoritos usando el servicio centralizado
        const favorites = await FavoritesService.getAll();

        // Limpiar animaciones de carga agresivamente
        if (loadingState) {
            loadingState.style.display = 'none';
            loadingState.classList.remove('flex'); // Remover flex para evitar conflictos
            loadingState.classList.add('hidden');
        }

        // Actualizar contador
        if (countBadge) countBadge.textContent = favorites.length;

        if (!favorites || favorites.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            if (grid) grid.classList.add('hidden');
            return;
        }

        // Renderizar Grid con Card Estándar
        if (grid && window.renderProductCard) {
            grid.classList.remove('hidden');

            // Generar HTML de todas las cards en paralelo
            const cardsHtmlPromises = favorites.map(product => window.renderProductCard(product));
            const cardsHtml = await Promise.all(cardsHtmlPromises);

            grid.innerHTML = cardsHtml.join('');

            // Re-ejecutar listeners globales
            if (window.lucide) window.lucide.createIcons();

            // Forzar estado activo en los corazones (ya que son favoritos)
            const favoriteBtns = grid.querySelectorAll('.btn-favorite');
            favoriteBtns.forEach(btn => {
                btn.classList.add('active');
                const icon = btn.querySelector('[data-lucide="heart"]') || btn.querySelector('svg');
                if (icon) {
                    icon.classList.add('text-red-500', 'fill-current');
                    icon.classList.remove('text-gray-400');
                }
            });

            // Notificar al sistema global que se renderizaron productos
            document.dispatchEvent(new CustomEvent('productsRendered'));
        }

    } catch (error) {
        console.error('Error cargando favoritos:', error);
        if (loadingState) {
            loadingState.style.display = 'none';
            loadingState.classList.remove('flex');
            loadingState.classList.add('hidden');
        }
        if (emptyState) emptyState.classList.remove('hidden');
    }
}
// La función renderFavoriteCard manual se elimina porque usamos window.renderProductCard

// Exponer funciones globales para los botones onclick
window.removeFavoritePage = async (productId) => {
    if (!confirm('¿Quitar este producto de tus favoritos?')) return;

    try {
        await FavoritesService.toggle(productId);
        // Recargar la lista
        loadFavoritesPage();

        // Actualizar header si es necesario
        document.dispatchEvent(new CustomEvent('favorites-updated'));

    } catch (e) {
        console.error('Error removing favorite:', e);
        alert('Error al quitar de favoritos');
    }
};

window.addToCartPage = async (productId) => {
    try {
        // Usar CartService si existe, o lógica manual
        // Asumo que existe Cart logic global en ceveco-core.js o similar
        // Si no, implemento básico:

        // Buscar producto completo (necesitamos info para carrito)
        const favorites = await FavoritesService.getAll();
        const product = favorites.find(p => p.id_producto == productId); // Loose equations just in case string/int

        if (product) {
            window.addToCart({
                id: product.id_producto,
                name: product.nombre,
                price: product.precio,
                image: product.imagen_url || product.imagen,
                quantity: 1
            });
        }
    } catch (e) {
        console.error('Error adding to cart:', e);
    }
};

// Función Logout (Reutilizada del sidebar)
window.handleLogout = () => {
    AuthService.logout();
};
