(function () {
    function init() {
        // 1. Inject HTML if root exists
        const root = document.getElementById('whatsapp-root');
        if (root) {

            // Should try to detect if we are in pages/ or root to find the component
            // But actually, fetch requests are relative to the URL of the page displayed.
            // If page is /index.html, fetch('components/...') works.
            // If page is /pages/index.html (likely just index.html accessed via server root), it depends.
            // The file structure shows frontend/pages/index.html.
            // But usually the browser serves from frontend/ as root?
            // Let's assume the previous code `fetch('../components/whatsapp-button.html')` worked for index.html.
            // We'll keep that as primary, but add a fallback for robustness.

            const fetchComponent = (url) => {
                return fetch(url).then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.text();
                });
            };

            // Try relative path from pages/ first (since index.html is there)
            fetchComponent('../components/whatsapp-button.html')
                .catch(() => fetchComponent('components/whatsapp-button.html')) // Fallback for root
                .catch(() => fetchComponent('/frontend/components/whatsapp-button.html')) // Fallback for absolute
                .then(html => {
                    root.innerHTML = html;
                    initWhatsAppLogic();
                })
                .catch(err => console.error('❌ Error loading WhatsApp button:', err));
        }

        // Logic Config
        let waSedesLoaded = false;

        function initWhatsAppLogic() {
            const toggleBtn = document.getElementById('wa-toggle-btn');
            const closeBtn = document.getElementById('wa-header-close-btn');

            if (toggleBtn) toggleBtn.addEventListener('click', toggleWaModal);
            if (closeBtn) closeBtn.addEventListener('click', toggleWaModal);

            console.log('✅ WhatsApp Component Logic Initialized');
        }

        // Toggle Function
        window.toggleWaModal = function () {
            const modal = document.getElementById('wa-modal');
            const pulse = document.getElementById('wa-pulse');
            const iconOpen = document.getElementById('wa-icon-open');
            const iconClose = document.getElementById('wa-icon-close');

            if (!modal) return;

            const isHidden = modal.classList.contains('hidden');

            if (isHidden) {
                // Open
                modal.classList.remove('hidden');
                if (pulse) pulse.classList.add('hidden');

                // Icon transition
                if (iconOpen) {
                    iconOpen.classList.add('opacity-0', 'rotate-90', 'scale-50');
                    iconOpen.classList.remove('rotate-0', 'scale-100');
                }
                if (iconClose) {
                    iconClose.classList.remove('scale-0', 'opacity-0', '-rotate-90');
                    iconClose.classList.add('scale-100', 'opacity-100', 'rotate-0');
                }

                // Modal Animation
                setTimeout(() => {
                    modal.classList.remove('opacity-0', 'scale-95', 'translate-y-2');
                    modal.classList.add('opacity-100', 'scale-100', 'translate-y-0');
                }, 10);

                // Load Data once
                if (!waSedesLoaded) loadWaSedes();

            } else {
                // Close
                modal.classList.remove('opacity-100', 'scale-100', 'translate-y-0');
                modal.classList.add('opacity-0', 'scale-95', 'translate-y-2');

                if (pulse) pulse.classList.remove('hidden');

                // Icon transition
                if (iconOpen) {
                    iconOpen.classList.remove('opacity-0', 'rotate-90', 'scale-50');
                    iconOpen.classList.add('rotate-0', 'scale-100');
                }
                if (iconClose) {
                    iconClose.classList.add('scale-0', 'opacity-0', '-rotate-90');
                    iconClose.classList.remove('scale-100', 'opacity-100', 'rotate-0');
                }

                setTimeout(() => modal.classList.add('hidden'), 300);
            }
        };

        // Load Sedes Function
        function loadWaSedes() {
            const list = document.getElementById('wa-sedes-list');
            if (!list) return;

            try {
                // Use HARDCODED Constants first if available
                let sedes = [];
                if (window.CONSTANTS && window.CONSTANTS.SEDES_CONTACT) {
                    sedes = window.CONSTANTS.SEDES_CONTACT;
                } else {
                    console.warn('CONSTANTS.SEDES_CONTACT not found, falling back to empty');
                }

                if (Array.isArray(sedes) && sedes.length > 0) {
                    list.innerHTML = sedes.map(sede => {
                        const phone = sede.whatsapp || (sede.telefono ? sede.telefono.replace(/\D/g, '') : '573000000000');
                        const msg = encodeURIComponent(`Hola, estoy interesado en contactar con la sede ${sede.nombre}`);
                        return `
                        <a href="https://wa.me/${phone}?text=${msg}" target="_blank" 
                           class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 hover:bg-green-50 transition-all group">
                            <div class="bg-green-100 text-green-600 p-2.5 rounded-full group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-bold text-gray-800 text-sm group-hover:text-green-800">${sede.nombre}</div>
                                <div class="text-xs text-gray-500 group-hover:text-green-700 flex items-center gap-1">
                                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                   ${sede.ciudad || 'Colombia'}
                                </div>
                            </div>
                            <div class="text-gray-300 group-hover:text-green-500">
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </a>
                        `;
                    }).join('');
                    waSedesLoaded = true;
                } else {
                    list.innerHTML = `
                     <div class="flex flex-col items-center justify-center py-6 text-center">
                        <i data-lucide="message-circle" class="w-8 h-8 text-gray-300 mb-2"></i>
                        <p class="text-sm text-gray-500 mb-2">No hay sedes disponibles</p>
                        <a href="https://wa.me/573001234567" target="_blank" class="text-xs font-semibold text-green-600 hover:underline">Contactar por defecto</a>
                     </div>`;
                    if (window.lucide) window.lucide.createIcons();
                }
            } catch (e) {
                console.error('Error loading sedes for WA:', e);
                list.innerHTML = `<div class="p-4 text-center text-red-400 text-sm">Error cargando contactos.</div>`;
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
