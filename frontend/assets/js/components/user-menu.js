/**
 * Navbar Authentication Integration
 * Este script actualiza el navbar con funcionalidad de autenticación
 */

(function () {
    'use strict';

    // Esperar a que el DOM esté listo
    document.addEventListener('DOMContentLoaded', function () {
        initializeAuthNavbar();
    });

    function initializeAuthNavbar() {
        // Buscar el botón de usuario en el navbar
        const userButtons = document.querySelectorAll('button');
        let userButton = null;

        // Encontrar el botón que contiene el icono de usuario
        for (let button of userButtons) {
            const icon = button.querySelector('i[data-lucide="user"]');
            if (icon && !button.onclick) {
                userButton = button;
                break;
            }
        }

        if (!userButton) {
            // Check if it was already replaced
            if (document.querySelector('[data-auth-button]')) {
                updateAuthUI();
                return;
            }
            console.warn('No se encontró el botón de usuario en el navbar');
            return;
        }

        // Reemplazar el botón con un contenedor que pueda actualizarse
        const container = document.createElement('div');
        container.setAttribute('data-auth-button', '');
        userButton.parentNode.replaceChild(container, userButton);

        // Actualizar la UI de autenticación
        updateAuthUI();
    }

    function updateAuthUI() {
        // Use AuthService if available, otherwise fallback to safe storage check
        let user = null;
        if (window.AuthService && typeof window.AuthService.getCurrentUser === 'function') {
            user = window.AuthService.getCurrentUser();
        } else if (window.StorageUtils) {
            const session = window.StorageUtils.getUser();
            // Handle session logic if AuthService isn't loaded yet
            if (session && session.user) user = session.user;
            else if (session && session.id) user = session;
        }

        const authButton = document.querySelector('[data-auth-button]');

        if (!authButton) return;

        if (user) {
            // Usuario autenticado - mostrar menú de usuario
            authButton.innerHTML = `
                <div class="relative group">
                    <button class="flex items-center gap-2 hover:text-primary transition-colors">
                        <i data-lucide="user" class="w-6 h-6"></i>
                        <span class="hidden lg:inline font-medium">${escapeHtml(user.nombre.split(' ')[0])}</span>
                        <i data-lucide="chevron-down" class="w-4 h-4 hidden lg:inline"></i>
                    </button>
                    
                    <!-- Dropdown Menu -->
                    <div class="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="text-sm font-semibold text-gray-900">${escapeHtml(user.nombre)}</p>
                            <p class="text-xs text-gray-500">${escapeHtml(user.email)}</p>
                        </div>
                        <a href="/pages/perfil.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i data-lucide="user" class="w-4 h-4 inline mr-2"></i>
                            Mi Perfil
                        </a>
                        <a href="/pages/pedidos.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i data-lucide="package" class="w-4 h-4 inline mr-2"></i>
                            Mis Pedidos
                        </a>
                        <hr class="my-2 border-gray-100">
                        <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <i data-lucide="log-out" class="w-4 h-4 inline mr-2"></i>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;

            // Add Event Listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.AuthService && window.AuthService.logout) {
                        window.AuthService.logout();
                    } else if (window.handleLogout) {
                        window.handleLogout();
                    } else {
                        window.location.href = '/pages/login.html';
                    }
                });
            }

        } else {
            // Usuario no autenticado - mostrar botón de login
            authButton.innerHTML = `
                <a href="/pages/login.html" class="hover:text-primary transition-colors" title="Iniciar Sesión">
                    <i data-lucide="user" class="w-6 h-6"></i>
                </a>
            `;
        }

        // Reinicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Exponer función globalmente para que pueda ser llamada desde auth.js
    window.updateAuthUI = updateAuthUI;
})();

