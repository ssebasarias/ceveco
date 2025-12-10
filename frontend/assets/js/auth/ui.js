
// Cache para templates de menú
const UserMenuTemplates = {
    guest: null,
    auth: null
};

// Cargar templates
// Cargar templates
async function loadUserMenuTemplates() {
    if (UserMenuTemplates.guest && UserMenuTemplates.auth) return;

    console.log('UI.js: Loading User Menu Templates...');

    // Helper to try multiple paths
    const fetchTemplate = async (filename) => {
        const pathsToTry = [
            // Relative (Context dependent)
            `./components/${filename}`,
            `../components/${filename}`,
            // Absolute (Server root)
            `/components/${filename}`,
            // Explicit Project Structure
            `/frontend/components/${filename}`,
            `../frontend/components/${filename}`
        ];

        for (const path of pathsToTry) {
            try {
                // Determine if we need to adjust relative paths based on location
                // But simplified: just try them.
                // Note: Fetch relative paths are resolved against current page URL.
                let res = await fetch(path);
                if (res.ok) {
                    console.log(`UI.js: Successfully loaded ${filename} from ${path}`);
                    return await res.text();
                }
            } catch (e) {
                // Ignore error, continue to next path
            }
        }
        console.error(`UI.js: Failed to load ${filename} after trying all paths`);
        return null;
    };

    try {
        const [guest, auth] = await Promise.all([
            fetchTemplate('user-menu-guest.html'),
            fetchTemplate('user-menu-auth.html')
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
    if (!container) {
        console.warn('User menu container not found');
        return;
    }

    // Asegurar templates cargados
    await loadUserMenuTemplates();

    if (user) {
        renderAuthMenu(container, user);
    } else {
        renderGuestMenu(container);
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

    // Update Mobile Menu
    updateMobileAuthUI(user);
}

function updateMobileAuthUI(user) {
    const mobileContainer = document.getElementById('mobile-user-section');
    if (!mobileContainer) return;

    if (user) {
        // Authenticated Mobile View
        const avatarHtml = user.avatar_url
            ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-full h-full object-cover">`
            : `<i data-lucide="user" class="w-6 h-6"></i>`;

        const userName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';
        const userEmail = user.email || '';

        mobileContainer.innerHTML = `
            <div class="flex flex-col gap-3 mb-6 pb-6 border-b border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                        ${avatarHtml}
                    </div>
                    <div>
                        <p class="font-bold text-gray-900">Hola, ${userName}</p>
                        <p class="text-xs text-gray-500 truncate max-w-[180px]">${userEmail}</p>
                    </div>
                </div>
                <button id="mobile-logout-btn" class="w-full py-2.5 px-4 border border-gray-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 group">
                    <i data-lucide="log-out" class="w-4 h-4 group-hover:text-red-700"></i> Cerrar Sesión
                </button>
            </div>
        `;

        // Attach Logout Listener
        const btn = mobileContainer.querySelector('#mobile-logout-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.handleLogout) window.handleLogout();
                else if (window.authManager) window.authManager.logout();
            });
        }
    } else {
        // Guest Mobile View (Restore)
        mobileContainer.innerHTML = `
            <div class="flex flex-col gap-3 mb-6 pb-6 border-b border-gray-100">
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                        <i data-lucide="user" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-900">Bienvenido</p>
                        <p class="text-xs text-gray-500">Ingresa para ver tus compras</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <a href="login.html" class="py-2.5 px-4 bg-primary text-white text-sm font-semibold rounded-lg text-center hover:bg-primary-dark transition-colors">Iniciar sesión</a>
                    <a href="registro.html" class="py-2.5 px-4 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg text-center hover:bg-gray-200 transition-colors">Registrarse</a>
                </div>
            </div>
        `;
    }
    // Re-init icons for mobile section
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderAuthMenu(container, user) {
    // Usuario autenticado
    if (UserMenuTemplates.auth) {
        const avatarHtml = user.avatar_url
            ? `<img src="${user.avatar_url}" alt="${user.nombre}" class="w-6 h-6 rounded-full object-cover">`
            : `<i data-lucide="user" class="w-6 h-6"></i>`;

        const userName = user.nombre ? user.nombre.split(' ')[0] : 'Usuario';

        container.innerHTML = UserMenuTemplates.auth
            .replace('{{avatar_html}}', avatarHtml)
            .replace('{{user_name}}', userName);

        // Attach event listeners

        // 1. Toggle Button
        const toggleBtn = container.querySelector('#user-menu-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleUserMenu();
            });
        }

        // 2. Logout Button
        // Use setTimeout to ensure DOM is ready if there's any weird timing, though innerHTML is sync.
        // Just for safety in case of render queuing. But sync is better.
        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
            console.log('Logout button found, attaching listener');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Stop menu from potentially closing or other handlers interference
                console.log('Logout button clicked');

                if (typeof window.handleLogout === 'function') {
                    window.handleLogout();
                } else if (window.authManager) {
                    console.log('Using fallback authManager.logout');
                    window.authManager.logout();
                } else {
                    console.error('CRITICAL: No logout handler available');
                    window.location.href = 'login.html';
                }
            });
        } else {
            console.error('CRITICAL: Logout button NOT found in template injection');
        }

    } else {
        // Fallback
        container.innerHTML = `<button id="user-menu-fallback" class="flex items-center gap-2"><span>${user.nombre}</span></button>`;
        document.getElementById('user-menu-fallback')?.addEventListener('click', toggleUserMenu);
    }
}

export function renderGuestMenu(container) {
    // Usuario no autenticado
    if (UserMenuTemplates.guest) {
        container.innerHTML = UserMenuTemplates.guest;

        // Attach event listeners
        document.getElementById('user-menu-toggle')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleUserMenu();
        });
        document.getElementById('google-login-btn')?.addEventListener('click', (e) => {
            if (window.loginWithGoogle) window.loginWithGoogle();
        });
    } else {
        // Fallback
        container.innerHTML = `<a href="login.html">Iniciar Sesión</a>`;
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

        // Check if click was inside the toggle button itself (to avoid closing immediately after opening)
        // Note: The toggle button usually has onclick="toggleUserMenu()", which runs before this listener.
        // We need to ensure we don't double-toggle or close it immediately.
        // Actually, preventing immediate close usually requires checking if target is the button.

        // But here the button calls toggleUserMenu.
        // If we want to close when clicking OUTSIDE:
        if (container && dropdown && !container.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });
}
