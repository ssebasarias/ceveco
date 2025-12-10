
// Already loaded via global services
async function loadFavorites() {
    const container = document.getElementById('favorites-grid');
    const loading = document.getElementById('loading-state');
    const empty = document.getElementById('empty-state');
    const counter = document.getElementById('fav-count');

    try {
        // Verificar auth (Compatibilidad con sistema nuevo y viejo)
        const isAuth = window.AuthService?.isAuthenticated() ||
            (typeof window.isUserAuthenticated === 'function' && window.isUserAuthenticated());

        if (!isAuth) {
            window.location.href = 'login.html';
            return;
        }

        // Usar nuevo servicio
        const data = await window.FavoritesService.getAll();
        // Nota: getAll devuelve array data directamente según mi Service implementation? No, getAll retorna response.
        // Revisemos FavoritesService implementation en paso 156.
        // "if (response.success) { return response.data; } return [];"
        // Así que retorna el ARRAY directamente.

        // Adaptar lógica que espera { success: true, data: [] }
        // O ajustar FavoritesService.
        // Ajustaré aquí asuminedo data es el array.
        const favorites = data;

        if (favorites && favorites.length > 0) {
            container.classList.remove('hidden');
            empty.classList.add('hidden');

            // Update counter
            counter.textContent = `${favorites.length} producto${favorites.length !== 1 ? 's' : ''}`;

            // Render cards
            const cardsHtml = (await Promise.all(favorites.map(async (p) => {
                return await renderProductCard(p);
            }))).join('');

            container.innerHTML = cardsHtml;
            lucide.createIcons();
        } else {
            container.classList.add('hidden');
            empty.classList.remove('hidden');
            counter.textContent = '0 productos';
        }

    } catch (error) {
        console.error('Error al cargar favoritos:', error);
        // Mostrar error genérico o empty
        empty.classList.remove('hidden');
    } finally {
        if (loading) {
            loading.classList.remove('flex');
            loading.classList.add('hidden');
        }
    }
}


document.addEventListener('DOMContentLoaded', async () => {
    await loadFavorites();
    // Import and init logic to ensure global state matches
    import('../favorites/index.js').then(module => {
        setTimeout(() => {
            if (window.updateFavoritesUI) window.updateFavoritesUI();
        }, 100);
    });
});

// Solución para navegar Atrás/Adelante y recargar datos (BFCache)
window.addEventListener('pageshow', async (event) => {
    // Si la página se restaura desde la caché (bfcache)
    if (event.persisted) {
        console.log('Restaurado desde caché, recargando favoritos...');
        await loadFavorites();

        // Recargar el estado global de favoritos (IDs) para mantener sincronía
        if (window.initFavorites) await window.initFavorites();

        // Actualizar UI global si es necesario
        if (window.updateFavoritesUI) window.updateFavoritesUI();
    }
});
