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
        const user = getCurrentUser();
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
                        <a href="perfil.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i data-lucide="user" class="w-4 h-4 inline mr-2"></i>
                            Mi Perfil
                        </a>
                        <a href="pedidos.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                            <i data-lucide="package" class="w-4 h-4 inline mr-2"></i>
                            Mis Pedidos
                        </a>
                        <hr class="my-2 border-gray-100">
                        <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <i data-lucide="log-out" class="w-4 h-4 inline mr-2"></i>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Usuario no autenticado - mostrar botón de login
            authButton.innerHTML = `
                <a href="login.html" class="hover:text-primary transition-colors" title="Iniciar Sesión">
                    <i data-lucide="user" class="w-6 h-6"></i>
                </a>
            `;
        }

        // Reinicializar iconos de Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function getCurrentUser() {
        try {
            const sessionData = localStorage.getItem('ceveco_user_session');
            if (!sessionData) return null;

            const session = JSON.parse(sessionData);

            // Verificar si la sesión ha expirado
            if (new Date(session.expiresAt) < new Date()) {
                return null;
            }

            return session.user;
        } catch (error) {
            console.error('Error cargando sesión:', error);
            return null;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Exponer función globalmente para que pueda ser llamada desde auth.js
    window.updateAuthUI = updateAuthUI;
})();
