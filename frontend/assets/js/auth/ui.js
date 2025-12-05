
// Cache para templates de menú
const UserMenuTemplates = {
    guest: null,
    auth: null
};

// Cargar templates
async function loadUserMenuTemplates() {
    if (UserMenuTemplates.guest && UserMenuTemplates.auth) return;
    try {
        const [guest, auth] = await Promise.all([
            fetch('../components/user-menu-guest.html').then(r => r.ok ? r.text() : null),
            fetch('../components/user-menu-auth.html').then(r => r.ok ? r.text() : null)
        ]);
        UserMenuTemplates.guest = guest;
        UserMenuTemplates.auth = auth;
    } catch (error) {
        console.error('Error loading user menu templates:', error);
    }
}

/**
 * Actualizar UI basado en el usuario actual
 * @param {Object|null} user - El objeto usuario o null si no hay sesión
 */
export async function updateAuthUI(user) {
    const userMenuContainer = document.getElementById('user-menu-container');
    const userButton = document.querySelector('[data-auth-button]');

    // Buscar el contenedor correcto
    const container = userMenuContainer || userButton;
    if (!container) return;

    // Asegurar templates cargados
    await loadUserMenuTemplates();

    if (user) {
        // Usuario autenticado
        if (UserMenuTemplates.auth) {
            const avatarHtml = user.avatar_url
                ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-8 h-8 rounded-full object-cover">`
                : `<i data-lucide="user" class="w-6 h-6"></i>`;

            const userName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';

            container.innerHTML = UserMenuTemplates.auth
                .replace('{{avatar_html}}', avatarHtml)
                .replace('{{user_name}}', userName);
        } else {
            // Fallback
            container.innerHTML = `<button onclick="toggleUserMenu()" class="flex items-center gap-2"><span>${user.nombre}</span></button>`;
        }
    } else {
        // Usuario no autenticado
        if (UserMenuTemplates.guest) {
            container.innerHTML = UserMenuTemplates.guest;
        } else {
            // Fallback
            container.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
        }
    }

    // Gestionar visibilidad de Favoritos
    const favLink = document.getElementById('favorites-link');
    if (favLink) {
        if (user) {
            favLink.classList.remove('hidden');
        } else {
            favLink.classList.add('hidden');
        }
    }

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

export function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Global click listener for closing menu
export function initGlobalListeners() {
    document.addEventListener('click', (e) => {
        const container = document.getElementById('user-dropdown-container');
        const dropdown = document.getElementById('user-dropdown');

        if (container && dropdown && !container.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}
