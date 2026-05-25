/**
 * Admin CRUD Functions
 * Funcionalidades CRUD para productos en las páginas públicas
 */

function escHtml(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const API_BASE = '/api/v1';

// Variable global para rastrear el estado de admin
let isAdminMode = false;
let adminCheckInterval = null;

// Verificar si es admin al cargar
document.addEventListener('DOMContentLoaded', () => {
    // Asegurar que los controles estén ocultos por defecto INMEDIATAMENTE
    hideAllAdminControls();

    // Variable para rastrear si hay modales abiertos
    let hasOpenModal = false;

    // Función para verificar si hay modales abiertos
    const checkOpenModals = () => {
        const productModal = document.getElementById('product-crud-modal');
        const importModal = document.getElementById('import-json-modal');
        const bannerModal = document.getElementById('banner-manager-modal');

        return (productModal && !productModal.classList.contains('hidden') && productModal.style.display !== 'none') ||
            (importModal && !importModal.classList.contains('hidden') && importModal.style.display !== 'none') ||
            (bannerModal && !bannerModal.classList.contains('hidden') && bannerModal.style.display !== 'none');
    };

    // Función robusta para verificar estado de admin
    const checkAdminStatus = () => {
        // No verificar si hay modales abiertos para evitar cerrarlos
        hasOpenModal = checkOpenModals();
        if (hasOpenModal) {
            return isAdminMode; // Mantener estado actual si hay modales abiertos
        }

        let isAdmin = false;

        try {
            // Verificar si AdminHelper está disponible
            if (window.AdminHelper && typeof window.AdminHelper.isAdmin === 'function') {
                isAdmin = window.AdminHelper.isAdmin();
            } else {
                // Si AdminHelper no está disponible, verificar directamente
                const user = window.AuthService?.getCurrentUser() ||
                    window.getCurrentUser?.() ||
                    window.StorageUtils?.getUser()?.user ||
                    window.StorageUtils?.getUser();

                isAdmin = user && user.rol === 'admin';
            }
        } catch (error) {
            console.error('Error verificando admin:', error);
            isAdmin = false;
        }

        // Actualizar estado global
        isAdminMode = isAdmin;

        // Mostrar u ocultar controles según el estado
        if (isAdmin) {
            showAdminControls();
            loadAdminModals();
        } else {
            hideAllAdminControls();
        }

        return isAdmin;
    };

    // Verificar inmediatamente
    checkAdminStatus();

    // Verificar después de delays para asegurar que los servicios estén cargados
    setTimeout(checkAdminStatus, 100);
    setTimeout(checkAdminStatus, 500);
    setTimeout(checkAdminStatus, 1000);
    setTimeout(checkAdminStatus, 2000);

    // Verificar periódicamente (cada 3 segundos) para detectar cambios en la sesión
    // Aumentado a 3 segundos para reducir interferencia con modales
    adminCheckInterval = setInterval(() => {
        // No verificar si hay modales abiertos
        if (checkOpenModals()) {
            return;
        }

        const wasAdmin = isAdminMode;
        const isAdmin = checkAdminStatus();

        // Si el estado cambió, forzar actualización
        if (wasAdmin !== isAdmin) {
            hideAllAdminControls();
            if (isAdmin) {
                showAdminControls();
            }
        }
    }, 3000);

    // Escuchar cambios en el estado de autenticación
    document.addEventListener('auth:stateChanged', () => {
        if (!checkOpenModals()) {
            checkAdminStatus();
        }
    });
    document.addEventListener('auth:login', () => {
        if (!checkOpenModals()) {
            checkAdminStatus();
        }
    });
    document.addEventListener('auth:logout', () => {
        isAdminMode = false;
        hideAllAdminControls();
    });

    // Escuchar cuando se actualiza el perfil
    document.addEventListener('profile:updated', () => {
        if (!checkOpenModals()) {
            checkAdminStatus();
        }
    });

    // Asegurar que los modales estén cerrados al cargar la página
    setTimeout(() => {
        const productModal = document.getElementById('product-crud-modal');
        const importModal = document.getElementById('import-json-modal');
        const bannerModal = document.getElementById('banner-manager-modal');

        if (productModal) {
            productModal.classList.add('hidden');
            productModal.style.display = 'none';
            productModal.style.visibility = 'hidden';
        }

        if (importModal) {
            importModal.classList.add('hidden');
            importModal.style.display = 'none';
            importModal.style.visibility = 'hidden';
        }

        if (bannerModal) {
            bannerModal.classList.add('hidden');
            bannerModal.style.display = 'none';
            bannerModal.style.visibility = 'hidden';
        }

        const bannerImagesModal = document.getElementById('banner-images-modal');
        if (bannerImagesModal) {
            bannerImagesModal.classList.add('hidden');
            bannerImagesModal.style.display = 'none';
            bannerImagesModal.style.visibility = 'hidden';
        }

        document.body.style.overflow = ''; // Asegurar que el body tenga scroll
    }, 200);

    // Configurar event listeners después de que se rendericen productos
    document.addEventListener('productsRendered', () => {
        // Siempre ocultar primero, luego mostrar solo si es admin
        document.querySelectorAll('.admin-product-controls').forEach(control => {
            control.classList.add('hidden');
            control.style.display = 'none';
        });

        if (isAdminMode) {
            setupCardButtons();
            // Mostrar controles solo si es admin
            document.querySelectorAll('.admin-product-controls').forEach(control => {
                control.classList.remove('hidden');
                control.style.display = 'flex';
            });
        }
    });
});

/**
 * Ocultar todos los controles admin
 */
function hideAllAdminControls() {
    // Ocultar controles en index
    const adminBannerControls = document.getElementById('admin-banner-controls');
    if (adminBannerControls) {
        adminBannerControls.classList.add('hidden');
        adminBannerControls.style.display = 'none';
    }

    // Ocultar botones en productos
    const addProductBtn = document.getElementById('admin-add-product-btn');
    const importJsonBtn = document.getElementById('admin-import-json-btn');
    if (addProductBtn) {
        addProductBtn.classList.add('hidden');
        addProductBtn.style.display = 'none';
        addProductBtn.style.visibility = 'hidden';
    }
    if (importJsonBtn) {
        importJsonBtn.classList.add('hidden');
        importJsonBtn.style.display = 'none';
        importJsonBtn.style.visibility = 'hidden';
    }

    // Ocultar controles en cards de productos - más agresivo
    document.querySelectorAll('.admin-product-controls').forEach(control => {
        control.classList.add('hidden');
        control.style.display = 'none';
        control.style.visibility = 'hidden';
        control.style.opacity = '0';
    });

    // También ocultar botones individuales dentro de los controles
    document.querySelectorAll('.js-edit-product, .js-delete-product').forEach(btn => {
        btn.style.display = 'none';
        btn.style.visibility = 'hidden';
    });
}

/**
 * Mostrar controles admin en la página
 */
function showAdminControls() {
    // Verificar nuevamente antes de mostrar (doble verificación)
    if (!isAdminMode) {
        hideAllAdminControls();
        return;
    }

    // Mostrar controles en index
    const adminBannerControls = document.getElementById('admin-banner-controls');
    if (adminBannerControls) {
        adminBannerControls.classList.remove('hidden');
        adminBannerControls.style.display = '';
    }

    // Mostrar botones en productos
    const addProductBtn = document.getElementById('admin-add-product-btn');
    const importJsonBtn = document.getElementById('admin-import-json-btn');
    if (addProductBtn) {
        addProductBtn.classList.remove('hidden');
        addProductBtn.style.display = '';
        addProductBtn.style.visibility = 'visible';
    }
    if (importJsonBtn) {
        importJsonBtn.classList.remove('hidden');
        importJsonBtn.style.display = '';
        importJsonBtn.style.visibility = 'visible';
    }

    // Configurar event listeners para botones
    setupAdminEventListeners();

    // Mostrar botones en cards de productos
    const showAdminControlsInCards = () => {
        // Verificar estado antes de mostrar - doble verificación
        if (!isAdminMode) {
            hideAllAdminControls();
            return;
        }

        const adminControls = document.querySelectorAll('.admin-product-controls');
        adminControls.forEach(control => {
            control.classList.remove('hidden');
            control.style.display = 'flex';
            control.style.visibility = 'visible';
            control.style.opacity = '1';
        });

        // Mostrar botones individuales
        document.querySelectorAll('.js-edit-product, .js-delete-product').forEach(btn => {
            btn.style.display = '';
            btn.style.visibility = 'visible';
        });

        // Re-configurar listeners para nuevos elementos
        setupCardButtons();
    };

    // Ejecutar inmediatamente y también después de un delay
    showAdminControlsInCards();
    setTimeout(showAdminControlsInCards, 500);
    setTimeout(showAdminControlsInCards, 1500);

    // Observar cambios en el DOM para mostrar controles en productos nuevos
    // Solo si ya existe un observer, no crear múltiples
    if (!window.adminControlsObserver) {
        window.adminControlsObserver = new MutationObserver(() => {
            // Solo mostrar si es admin (verificar estado global)
            if (isAdminMode) {
                showAdminControlsInCards();
            } else {
                // Ocultar si no es admin - más agresivo
                document.querySelectorAll('.admin-product-controls').forEach(control => {
                    control.classList.add('hidden');
                    control.style.display = 'none';
                    control.style.visibility = 'hidden';
                    control.style.opacity = '0';
                });
                document.querySelectorAll('.js-edit-product, .js-delete-product').forEach(btn => {
                    btn.style.display = 'none';
                    btn.style.visibility = 'hidden';
                });
            }
        });

        window.adminControlsObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

/**
 * Configurar event listeners para botones admin
 */
function setupAdminEventListeners() {
    // Botón agregar producto
    const addProductBtn = document.getElementById('admin-add-product-btn');
    if (addProductBtn && !addProductBtn.dataset.listenerAttached) {
        addProductBtn.addEventListener('click', () => openProductModal());
        addProductBtn.dataset.listenerAttached = 'true';
    }

    // Botón importar JSON
    const importJsonBtn = document.getElementById('admin-import-json-btn');
    if (importJsonBtn && !importJsonBtn.dataset.listenerAttached) {
        importJsonBtn.addEventListener('click', () => openImportJSONModal());
        importJsonBtn.dataset.listenerAttached = 'true';
    }

    // Botón panel admin
    const adminPanelBtn = document.getElementById('admin-panel-btn');
    if (adminPanelBtn && !adminPanelBtn.dataset.listenerAttached) {
        adminPanelBtn.addEventListener('click', () => {
            // Usar ruta absoluta para asegurar que funcione desde cualquier página
            const adminPath = window.location.pathname.includes('/pages/')
                ? '/pages/admin.html'
                : 'admin.html';
            window.location.href = adminPath;
        });
        adminPanelBtn.dataset.listenerAttached = 'true';
    }

    // Botón gestionar banners
    const manageBannersBtn = document.getElementById('manage-banners-btn');
    if (manageBannersBtn && !manageBannersBtn.dataset.listenerAttached) {
        manageBannersBtn.addEventListener('click', () => openBannerManager());
        manageBannersBtn.dataset.listenerAttached = 'true';
    }
}

/**
 * Configurar botones en cards de productos
 */
function setupCardButtons() {
    // Botones de editar
    document.querySelectorAll('.js-edit-product').forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                editProductFromCard(id);
            });
            btn.dataset.listenerAttached = 'true';
        }
    });

    // Botones de eliminar
    document.querySelectorAll('.js-delete-product').forEach(btn => {
        if (!btn.dataset.listenerAttached) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                const nombre = btn.dataset.name || 'este producto';
                deleteProductFromCard(id, nombre);
            });
            btn.dataset.listenerAttached = 'true';
        }
    });
}

/**
 * Cargar modales admin en el DOM
 */
function loadAdminModals() {
    const modalsHTML = `
        <!-- Product Modal -->
        <div id="product-crud-modal" class="hidden fixed inset-0 items-center justify-center p-4" style="display: none; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9999;">
            <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" id="product-modal-content" style="z-index: 10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index: 10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="product-modal-title">Nuevo Producto</h3>
                    <button id="close-product-modal-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="product-crud-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="product-crud-id">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Nombre -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto <span class="text-red-500">*</span></label>
                            <input type="text" id="product-crud-nombre" required
                                placeholder="Ej: Nevera LG 343L Negro Mate con Dispensador de Agua"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- SKU -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">SKU <span class="text-red-500">*</span></label>
                            <input type="text" id="product-crud-sku" required
                                placeholder="Ej: GB37SPV o SKU-001"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- Precio Actual -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Actual <span class="text-red-500">*</span></label>
                            <input type="number" id="product-crud-precio" step="0.01" required min="0"
                                placeholder="Ej: 1299000"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- Precio Anterior -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Precio Anterior</label>
                            <input type="number" id="product-crud-precio-anterior" step="0.01" min="0"
                                placeholder="Ej: 1499000 (opcional, para mostrar descuento)"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- Stock -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Stock <span class="text-red-500">*</span></label>
                            <input type="number" id="product-crud-stock" required min="0"
                                placeholder="Ej: 10"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- Categoría -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría <span class="text-red-500">*</span></label>
                            <select id="product-crud-categoria" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none bg-white">
                                <option value="">Seleccionar categoría...</option>
                            </select>
                        </div>

                        <!-- Marca -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Marca <span class="text-red-500">*</span></label>
                            <select id="product-crud-marca" required
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none bg-white">
                                <option value="">Seleccionar marca...</option>
                            </select>
                        </div>

                        <!-- Badge -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Badge</label>
                            <input type="text" id="product-crud-badge"
                                placeholder="Ej: Nuevo, Oferta, Destacado, -20%"
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                        </div>

                        <!-- Descripción Corta -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción Corta</label>
                            <textarea id="product-crud-descripcion-corta" rows="3"
                                placeholder="Ej: Nevera de 343 litros con congelador inferior, diseño negro mate y dispensador de agua externo. Ideal para familias medianas."
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"></textarea>
                        </div>

                        <!-- Descripción Larga -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción Larga</label>
                            <textarea id="product-crud-descripcion-larga" rows="5"
                                placeholder="Ej: Optimiza la frescura de tus alimentos con la nevera LG de 343 litros y congelador inferior. Gracias a Linear Door Cooling™ y Multi-Air Flow, la temperatura se mantiene constante en cada rincón. Su Compresor Smart Inverter ofrece 10 años de garantía..."
                                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"></textarea>
                        </div>

                        <!-- Imágenes -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
                            
                            <!-- Opción 1: Subir archivo -->
                            <div class="mb-4">
                                <label class="block text-xs font-medium text-gray-600 mb-2">Subir imagen desde tu computadora:</label>
                                <div class="flex items-center gap-3">
                                    <input type="file" id="product-crud-image-upload" accept="image/*" 
                                        class="hidden">
                                    <button type="button" id="select-image-btn" 
                                        class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium text-gray-700">
                                        <i data-lucide="upload" class="w-4 h-4 inline mr-2"></i>
                                        Seleccionar Imagen
                                    </button>
                                    <span id="image-upload-status" class="text-xs text-gray-500"></span>
                                </div>
                            </div>
                            
                            <!-- Opción 2: URLs -->
                            <div>
                                <label class="block text-xs font-medium text-gray-600 mb-2">O ingresa URLs de imágenes (separadas por comas):</label>
                                <textarea id="product-crud-imagenes" rows="3"
                                    placeholder="Ej: https://ejemplo.com/imagen1.jpg, https://ejemplo.com/imagen2.jpg&#10;Separa cada URL con una coma o salto de línea. La primera será la imagen principal."
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none font-mono text-sm"></textarea>
                                <p class="mt-2 text-xs text-gray-500">Puedes usar URLs de internet o subir imágenes. La primera será la imagen principal.</p>
                            </div>
                            
                            <!-- Vista previa de imágenes -->
                            <div id="image-preview-container" class="mt-4 grid grid-cols-4 gap-2 hidden">
                                <p class="col-span-4 text-xs font-medium text-gray-600 mb-2">Vista previa de imágenes:</p>
                            </div>
                        </div>

                        <!-- Checkboxes -->
                        <div class="md:col-span-2 flex gap-6 pt-2">
                            <label class="flex items-center cursor-pointer">
                                <input type="checkbox" id="product-crud-destacado" class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer">
                                <span class="ml-2 text-sm font-medium text-gray-700">Producto Destacado</span>
                            </label>
                            <label class="flex items-center cursor-pointer">
                                <input type="checkbox" id="product-crud-activo" checked class="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer">
                                <span class="ml-2 text-sm font-medium text-gray-700">Activo</span>
                            </label>
                        </div>
                    </div>

                    <div class="mt-8 flex gap-3 pt-6 border-t border-gray-200">
                        <button type="submit" class="flex-1 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-medium shadow-md hover:shadow-lg">
                            Guardar Producto
                        </button>
                        <button type="button" id="cancel-product-modal-btn" class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Import JSON Modal -->
        <div id="import-json-modal" class="hidden fixed inset-0 items-center justify-center p-4" style="display: none; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9999;">
            <div class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl" id="import-json-modal-content" style="z-index: 10000;">
                <div class="px-6 py-5 border-b border-gray-200 flex justify-between items-center" style="z-index: 10001;">
                    <h3 class="text-2xl font-bold text-gray-900">Importar Productos desde JSON</h3>
                    <button id="close-import-json-modal-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700" style="z-index: 10002;">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="p-6">
                    <p class="text-gray-600 mb-4 text-sm">Pega el JSON con los productos a importar. Puede ser un array de productos o un objeto con una propiedad "productos".</p>
                    <textarea id="json-input" rows="15"
                        placeholder='Ejemplo de formato:&#10;[&#10;  {&#10;    "nombre": "Nevera LG 343L",&#10;    "sku": "GB37SPV",&#10;    "precio_actual": 1299000,&#10;    "precio_anterior": 1499000,&#10;    "stock": 10,&#10;    "id_categoria": 1,&#10;    "id_marca": 1,&#10;    "descripcion_corta": "Nevera de 343 litros...",&#10;    "destacado": false,&#10;    "activo": true&#10;  }&#10;]'
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-mono text-sm resize-none"></textarea>
                    <div class="mt-6 flex gap-3">
                        <button id="import-json-btn" class="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg">
                            Importar Productos
                        </button>
                        <button id="cancel-import-json-btn" class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Banner Manager Modal -->
        <div id="banner-manager-modal" class="hidden fixed inset-0 items-center justify-center p-4" style="display: none; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9999;">
            <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl" id="banner-manager-modal-content" style="z-index: 10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index: 10001;">
                    <h3 class="text-2xl font-bold text-gray-900">Gestión de Banners</h3>
                    <button id="close-banner-manager-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700" style="z-index: 10002;">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <!-- Botón de subir imagen -->
                    <div class="mb-6">
                        <button id="upload-banner-image-btn" class="w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2">
                            <i data-lucide="upload" class="w-5 h-5"></i>
                            Subir Nueva Imagen
                        </button>
                    </div>
                    
                    <!-- Lista de imágenes de banner -->
                    <div class="mb-6">
                        <h4 class="font-semibold text-gray-800 mb-4">Imágenes de Banner Hero</h4>
                        <div id="banner-images-list-manager" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div class="text-center text-gray-500 py-8 col-span-full">Cargando imágenes...</div>
                        </div>
                    </div>
                    
                    <!-- Agregar nuevo banner -->
                    <div class="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h4 class="font-semibold text-gray-800 mb-3">Agregar Nuevo Banner</h4>
                        <div class="space-y-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Título del Banner</label>
                                <input type="text" id="new-banner-titulo" placeholder="Ej: Ofertas Especiales de Verano"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Subir Imagen</label>
                                <input type="file" id="new-banner-image" accept="image/*" 
                                    class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">URL de Enlace (opcional)</label>
                                <input type="url" id="new-banner-enlace" placeholder="Ej: https://ceveco.com.co/productos?categoria=ofertas"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary">
                            </div>
                            <div class="flex gap-3">
                                <select id="new-banner-posicion" class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary">
                                    <option value="hero">Hero (Principal)</option>
                                    <option value="sidebar">Sidebar</option>
                                    <option value="footer">Footer</option>
                                    <option value="popup">Popup</option>
                                </select>
                                <input type="number" id="new-banner-orden" value="0" placeholder="Orden" min="0"
                                    class="w-24 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary">
                            </div>
                            <button id="add-banner-btn" class="w-full bg-[#FE2418] text-white px-4 py-2 rounded-xl hover:bg-[#d91b10] transition-all font-medium">
                                Agregar Banner
                            </button>
                        </div>
                    </div>

                    <!-- Lista de banners existentes -->
                    <div>
                        <h4 class="font-semibold text-gray-800 mb-4">Banners Existentes</h4>
                        <div id="banners-list" class="space-y-3">
                            <div class="text-center text-gray-500 py-8">Cargando banners...</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Banner Images Modal -->
        <div id="banner-images-modal" class="hidden fixed inset-0 items-center justify-center p-4" style="display: none; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9999;">
            <div class="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl" id="banner-images-modal-content" style="z-index: 10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index: 10001;">
                    <h3 class="text-2xl font-bold text-gray-900">Imágenes de Banner Hero</h3>
                    <button id="close-banner-images-modal-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700" style="z-index: 10002;">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <div class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div id="banner-images-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div class="text-center text-gray-500 py-8 col-span-full">Cargando imágenes...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar modales al body si no existen
    if (!document.getElementById('product-crud-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalsHTML);

        // Asegurar que los modales estén ocultos al crearlos
        const productModal = document.getElementById('product-crud-modal');
        const importModal = document.getElementById('import-json-modal');
        const bannerModal = document.getElementById('banner-manager-modal');

        if (productModal) {
            productModal.classList.add('hidden');
            productModal.style.display = 'none';
            productModal.style.visibility = 'hidden';
        }

        if (importModal) {
            importModal.classList.add('hidden');
            importModal.style.display = 'none';
            importModal.style.visibility = 'hidden';
        }

        if (bannerModal) {
            bannerModal.classList.add('hidden');
            bannerModal.style.display = 'none';
            bannerModal.style.visibility = 'hidden';
        }

        const bannerImagesModal = document.getElementById('banner-images-modal');
        if (bannerImagesModal) {
            bannerImagesModal.classList.add('hidden');
            bannerImagesModal.style.display = 'none';
            bannerImagesModal.style.visibility = 'hidden';
        }

        if (window.lucide) lucide.createIcons();

        // Agregar listeners para cerrar al hacer click fuera
        setupModalCloseListeners();

        // Configurar event listeners para botones de modales
        setupModalButtons();

        // Prevenir propagación de clicks en el contenido del modal
        const productModalContent = document.getElementById('product-modal-content');
        if (productModalContent) {
            productModalContent.addEventListener('click', (e) => e.stopPropagation());
        }

        const importJsonModalContent = document.getElementById('import-json-modal-content');
        if (importJsonModalContent) {
            importJsonModalContent.addEventListener('click', (e) => e.stopPropagation());
        }

        const bannerModalContent = document.getElementById('banner-manager-modal-content');
        if (bannerModalContent) {
            bannerModalContent.addEventListener('click', (e) => e.stopPropagation());
        }

        const bannerImagesModalContent = document.getElementById('banner-images-modal-content');
        if (bannerImagesModalContent) {
            bannerImagesModalContent.addEventListener('click', (e) => e.stopPropagation());
        }

        // Listener para actualizar vista previa de imágenes
        const imagenesTextarea = document.getElementById('product-crud-imagenes');
        if (imagenesTextarea) {
            imagenesTextarea.addEventListener('input', updateImagePreview);
            imagenesTextarea.placeholder = "Ingrese una URL por línea (sin comas)";
        }
    } else {
        // Si ya existen, asegurarse de que estén ocultos
        const productModal = document.getElementById('product-crud-modal');
        const importModal = document.getElementById('import-json-modal');
        const bannerModal = document.getElementById('banner-manager-modal');

        if (productModal) {
            productModal.classList.add('hidden');
            productModal.style.display = 'none';
            productModal.style.visibility = 'hidden';
        }

        if (importModal) {
            importModal.classList.add('hidden');
            importModal.style.display = 'none';
            importModal.style.visibility = 'hidden';
        }

        if (bannerModal) {
            bannerModal.classList.add('hidden');
            bannerModal.style.display = 'none';
            bannerModal.style.visibility = 'hidden';
        }

        const bannerImagesModal = document.getElementById('banner-images-modal');
        if (bannerImagesModal) {
            bannerImagesModal.classList.add('hidden');
            bannerImagesModal.style.display = 'none';
            bannerImagesModal.style.visibility = 'hidden';
        }
    }
}

/**
 * Configurar botones de modales
 */
function setupModalButtons() {
    // Botón cerrar modal de producto (X)
    const closeProductBtn = document.getElementById('close-product-modal-btn');
    if (closeProductBtn && !closeProductBtn.dataset.listenerAttached) {
        closeProductBtn.addEventListener('click', closeProductModal);
        closeProductBtn.dataset.listenerAttached = 'true';
    }

    // Botón cancelar modal de producto
    const cancelProductBtn = document.getElementById('cancel-product-modal-btn');
    if (cancelProductBtn && !cancelProductBtn.dataset.listenerAttached) {
        cancelProductBtn.addEventListener('click', closeProductModal);
        cancelProductBtn.dataset.listenerAttached = 'true';
    }

    // Botón seleccionar imagen
    const selectImageBtn = document.getElementById('select-image-btn');
    const imageUploadInput = document.getElementById('product-crud-image-upload');
    if (selectImageBtn && imageUploadInput && !selectImageBtn.dataset.listenerAttached) {
        selectImageBtn.addEventListener('click', () => {
            imageUploadInput.click();
        });
        selectImageBtn.dataset.listenerAttached = 'true';
    }

    // Listener para subir imagen
    if (imageUploadInput && !imageUploadInput.dataset.listenerAttached) {
        imageUploadInput.addEventListener('change', handleImageUpload);
        imageUploadInput.dataset.listenerAttached = 'true';
    }

    // Formulario de producto
    const productForm = document.getElementById('product-crud-form');
    if (productForm && !productForm.dataset.listenerAttached) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveProductFromModal(e);
        });
        productForm.dataset.listenerAttached = 'true';
    }

    // Botones modal importar JSON
    const closeImportJsonBtn = document.getElementById('close-import-json-modal-btn');
    if (closeImportJsonBtn && !closeImportJsonBtn.dataset.listenerAttached) {
        closeImportJsonBtn.addEventListener('click', closeImportJSONModal);
        closeImportJsonBtn.dataset.listenerAttached = 'true';
    }

    const cancelImportJsonBtn = document.getElementById('cancel-import-json-btn');
    if (cancelImportJsonBtn && !cancelImportJsonBtn.dataset.listenerAttached) {
        cancelImportJsonBtn.addEventListener('click', closeImportJSONModal);
        cancelImportJsonBtn.dataset.listenerAttached = 'true';
    }

    const importJsonBtn = document.getElementById('import-json-btn');
    if (importJsonBtn && !importJsonBtn.dataset.listenerAttached) {
        importJsonBtn.addEventListener('click', importProductsFromJSON);
        importJsonBtn.dataset.listenerAttached = 'true';
    }

    // Botones modal banners
    const closeBannerBtn = document.getElementById('close-banner-manager-btn');
    if (closeBannerBtn && !closeBannerBtn.dataset.listenerAttached) {
        closeBannerBtn.addEventListener('click', closeBannerManager);
        closeBannerBtn.dataset.listenerAttached = 'true';
    }

    const addBannerBtn = document.getElementById('add-banner-btn');
    if (addBannerBtn && !addBannerBtn.dataset.listenerAttached) {
        addBannerBtn.addEventListener('click', addBannerFromManager);
        addBannerBtn.dataset.listenerAttached = 'true';
    }

    // Botón de subir imagen de banner
    const uploadBannerImageBtn = document.getElementById('upload-banner-image-btn');
    if (uploadBannerImageBtn && !uploadBannerImageBtn.dataset.listenerAttached) {
        uploadBannerImageBtn.addEventListener('click', () => {
            document.getElementById('banner-image-upload-input')?.click();
        });
        uploadBannerImageBtn.dataset.listenerAttached = 'true';
    }

    // Input oculto para subir imagen de banner
    const bannerImageUploadInput = document.getElementById('banner-image-upload-input');
    if (!bannerImageUploadInput) {
        const input = document.createElement('input');
        input.type = 'file';
        input.id = 'banner-image-upload-input';
        input.accept = 'image/*';
        input.style.display = 'none';
        input.addEventListener('change', handleBannerImageUpload);
        document.body.appendChild(input);
    } else if (!bannerImageUploadInput.dataset.listenerAttached) {
        bannerImageUploadInput.addEventListener('change', handleBannerImageUpload);
        bannerImageUploadInput.dataset.listenerAttached = 'true';
    }

    // Botón cerrar modal de imágenes
    const closeBannerImagesModalBtn = document.getElementById('close-banner-images-modal-btn');
    if (closeBannerImagesModalBtn && !closeBannerImagesModalBtn.dataset.listenerAttached) {
        closeBannerImagesModalBtn.addEventListener('click', closeBannerImagesModal);
        closeBannerImagesModalBtn.dataset.listenerAttached = 'true';
    }
}

/**
 * Configurar listeners para cerrar modales al hacer click fuera
 */
function setupModalCloseListeners() {
    const productModal = document.getElementById('product-crud-modal');
    const importModal = document.getElementById('import-json-modal');

    if (productModal) {
        productModal.addEventListener('click', (e) => {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }

    if (importModal) {
        importModal.addEventListener('click', (e) => {
            if (e.target === importModal) {
                closeImportJSONModal();
            }
        });
    }

    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (productModal && !productModal.classList.contains('hidden')) {
                closeProductModal();
            }
            if (importModal && !importModal.classList.contains('hidden')) {
                closeImportJSONModal();
            }
            const bannerModal = document.getElementById('banner-manager-modal');
            if (bannerModal && !bannerModal.classList.contains('hidden')) {
                closeBannerManager();
            }
        }
    });

    // Listener para cerrar banner manager al hacer click fuera
    const bannerModal = document.getElementById('banner-manager-modal');
    if (bannerModal) {
        bannerModal.addEventListener('click', (e) => {
            if (e.target === bannerModal) {
                closeBannerManager();
            }
        });
    }

    // Listener para cerrar modal de imágenes de banner al hacer click fuera
    const bannerImagesModal = document.getElementById('banner-images-modal');
    if (bannerImagesModal) {
        bannerImagesModal.addEventListener('click', (e) => {
            if (e.target === bannerImagesModal) {
                closeBannerImagesModal();
            }
        });
    }

    // Cerrar modal de imágenes con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const bannerImagesModal = document.getElementById('banner-images-modal');
            if (bannerImagesModal && !bannerImagesModal.classList.contains('hidden')) {
                closeBannerImagesModal();
            }
        }
    });
}

/**
 * Abrir modal de producto
 */
function openProductModal(productId = null) {
    // Solo abrir si el usuario es admin (verificar estado global)
    if (!isAdminMode) {
        console.warn('Solo administradores pueden abrir este modal');
        hideAllAdminControls();
        return;
    }

    const modal = document.getElementById('product-crud-modal');
    const form = document.getElementById('product-crud-form');
    const title = document.getElementById('product-modal-title');

    if (!modal) {
        console.error('Modal no encontrado');
        return;
    }

    if (productId) {
        title.textContent = 'Editar Producto';
        document.getElementById('product-crud-id').value = productId;
        loadProductData(productId);
    } else {
        title.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('product-crud-id').value = '';
        document.getElementById('product-crud-activo').checked = true;
    }

    loadCategoriesAndBrands();
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; // Mostrar como flex cuando se abre
    modal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body

    // Marcar que hay un modal abierto para evitar que el intervalo lo cierre
    if (window.lucide) lucide.createIcons();
}

/**
 * Cerrar modal de producto
 */
function closeProductModal() {
    const modal = document.getElementById('product-crud-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Asegurar que esté oculto
        modal.style.visibility = 'hidden';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
}

/**
 * Abrir modal de importar JSON
 */
function openImportJSONModal() {
    // Solo abrir si el usuario es admin (verificar estado global)
    if (!isAdminMode) {
        console.warn('Solo administradores pueden abrir este modal');
        hideAllAdminControls();
        return;
    }

    const modal = document.getElementById('import-json-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex'; // Mostrar como flex cuando se abre
        modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        if (window.lucide) lucide.createIcons();
    }
}

/**
 * Cerrar modal de importar JSON
 */
function closeImportJSONModal() {
    const modal = document.getElementById('import-json-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none'; // Asegurar que esté oculto
        modal.style.visibility = 'hidden';
        document.body.style.overflow = ''; // Restaurar scroll del body
    }
    const jsonInput = document.getElementById('json-input');
    if (jsonInput) jsonInput.value = '';
}

/**
 * Cargar datos del producto para editar
 */
async function loadProductData(id) {
    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            headers: {
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            }
        });
        const data = await response.json();
        if (data.success && data.data) {
            const product = data.data;
            document.getElementById('product-crud-nombre').value = product.nombre || '';
            document.getElementById('product-crud-sku').value = product.sku || '';
            document.getElementById('product-crud-precio').value = product.precio_actual || '';
            document.getElementById('product-crud-precio-anterior').value = product.precio_anterior || '';
            document.getElementById('product-crud-stock').value = product.stock || 0;
            document.getElementById('product-crud-badge').value = product.badge || '';
            document.getElementById('product-crud-descripcion-corta').value = product.descripcion_corta || '';
            document.getElementById('product-crud-descripcion-larga').value = product.descripcion_larga || '';
            document.getElementById('product-crud-destacado').checked = product.destacado || false;
            document.getElementById('product-crud-activo').checked = product.activo !== false;

            // Cargar categoría y marca
            if (product.id_categoria) {
                document.getElementById('product-crud-categoria').value = product.id_categoria;
            }
            if (product.id_marca) {
                document.getElementById('product-crud-marca').value = product.id_marca;
            }

            // Imágenes
            if (product.imagenes && Array.isArray(product.imagenes)) {
                const imageUrls = product.imagenes.map(img => img.url_imagen || img.url || img).filter(Boolean);
                document.getElementById('product-crud-imagenes').value = imageUrls.join(', ');
            } else if (product.imagen_principal) {
                document.getElementById('product-crud-imagenes').value = product.imagen_principal;
            }

            // Actualizar vista previa
            setTimeout(() => updateImagePreview(), 100);
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
        showNotification('Error al cargar los datos del producto', 'error');
    }
}

/**
 * Cargar categorías y marcas para los selects
 */
async function loadCategoriesAndBrands() {
    // Cargar categorías desde la BD
    try {
        // Obtener categorías consultando productos de diferentes categorías
        const categorias = [
            { id: 1, nombre: 'Electro Hogar', slug: 'electro-hogar' },
            { id: 2, nombre: 'Muebles', slug: 'muebles' },
            { id: 3, nombre: 'Motos', slug: 'motos' },
            { id: 4, nombre: 'Herramientas', slug: 'herramientas' }
        ];

        // Intentar obtener categorías reales desde la API
        try {
            const response = await fetch(`${API_BASE}/productos?limit=1`);
            // Si hay productos, intentar obtener categorías de otra forma
            // Por ahora usar las categorías conocidas
        } catch (e) {
            // Si falla, usar las categorías por defecto
        }

        const categoriaSelect = document.getElementById('product-crud-categoria');
        if (categoriaSelect) {
            categoriaSelect.innerHTML = '<option value="">Seleccionar categoría...</option>';
            categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.nombre;
                categoriaSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }

    // Cargar marcas
    try {
        const marcaResponse = await fetch(`${API_BASE}/marcas`);
        const marcaData = await marcaResponse.json();
        const marcaSelect = document.getElementById('product-crud-marca');
        if (marcaSelect) {
            marcaSelect.innerHTML = '<option value="">Seleccionar marca...</option>';
            if (marcaData.success && marcaData.data) {
                marcaData.data.forEach(marca => {
                    const option = document.createElement('option');
                    option.value = marca.id_marca;
                    option.textContent = marca.nombre;
                    marcaSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error cargando marcas:', error);
    }
}

/**
 * Manejar subida de imagen
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('image-upload-status');
    statusEl.textContent = 'Subiendo imagen...';
    statusEl.className = 'text-xs text-[#00458E]';

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE}/admin/upload/image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok && data.success) {
            // Agregar URL al textarea de imágenes
            const imagenesTextarea = document.getElementById('product-crud-imagenes');
            const currentUrls = imagenesTextarea.value.trim();
            const newUrl = data.data.url;

            if (currentUrls) {
                imagenesTextarea.value = currentUrls + ', ' + newUrl;
            } else {
                imagenesTextarea.value = newUrl;
            }

            statusEl.textContent = '✓ Imagen subida exitosamente';
            statusEl.className = 'text-xs text-green-600';

            // Actualizar vista previa
            updateImagePreview();

            // Limpiar input
            event.target.value = '';
        } else {
            statusEl.textContent = '✗ Error al subir imagen: ' + (data.message || 'Error desconocido');
            statusEl.className = 'text-xs text-red-600';
        }
    } catch (error) {
        console.error('Error subiendo imagen:', error);
        statusEl.textContent = '✗ Error al subir imagen';
        statusEl.className = 'text-xs text-red-600';
    }
}

/**
 * Actualizar vista previa de imágenes
 */
function updateImagePreview() {
    const imagenesTextarea = document.getElementById('product-crud-imagenes');
    const previewContainer = document.getElementById('image-preview-container');
    const urls = imagenesTextarea.value.split('\n').map(url => url.trim()).filter(Boolean);

    if (urls.length === 0) {
        previewContainer.classList.add('hidden');
        return;
    }

    previewContainer.classList.remove('hidden');
    previewContainer.innerHTML = '<p class="col-span-4 text-xs font-medium text-gray-600 mb-2">Vista previa de imágenes:</p>';

    urls.forEach((url, index) => {
        const imgDiv = document.createElement('div');
        imgDiv.className = 'relative group';
        imgDiv.innerHTML = `
            <img src="${url}" alt="Preview ${index + 1}" 
                class="js-preview-image w-full h-24 object-cover rounded-lg border border-gray-200">
            <button type="button" class="remove-image-btn absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs" data-index="${index}">
                ×
            </button>
            ${index === 0 ? '<span class="absolute bottom-1 left-1 bg-[#FE2418] text-white text-xs px-2 py-1 rounded">Principal</span>' : ''}
        `;
        previewContainer.appendChild(imgDiv);

        // Agregar listener al botón de eliminar
        const removeBtn = imgDiv.querySelector('.remove-image-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => removeImageFromPreview(index));
        }

        // Agregar listener para error de imagen
        const img = imgDiv.querySelector('.js-preview-image');
        if (img) {
            img.addEventListener('error', function () {
                this.src = '/assets/img/no-image.svg';
            });
        }
    });
}

/**
 * Remover imagen de la vista previa
 */
function removeImageFromPreview(index) {
    const imagenesTextarea = document.getElementById('product-crud-imagenes');
    const urls = imagenesTextarea.value.split('\n').map(url => url.trim()).filter(Boolean);
    urls.splice(index, 1);
    imagenesTextarea.value = urls.join('\n');
    updateImagePreview();
}

/**
 * Guardar producto desde el modal
 */
async function saveProductFromModal(event) {
    event.preventDefault();

    const id = document.getElementById('product-crud-id').value;

    // Obtener URLs de imágenes
    const imagenesText = document.getElementById('product-crud-imagenes').value;
    const imagenes = imagenesText.split(/[,\n]/)
        .map(url => url.trim())
        .filter(url => url && url.length > 0);

    const productData = {
        nombre: document.getElementById('product-crud-nombre').value,
        sku: document.getElementById('product-crud-sku').value,
        precio_actual: parseFloat(document.getElementById('product-crud-precio').value),
        precio_anterior: document.getElementById('product-crud-precio-anterior').value ? parseFloat(document.getElementById('product-crud-precio-anterior').value) : 0,
        stock: parseInt(document.getElementById('product-crud-stock').value),
        id_categoria: parseInt(document.getElementById('product-crud-categoria').value),
        id_marca: parseInt(document.getElementById('product-crud-marca').value),
        badge: document.getElementById('product-crud-badge').value || "",
        descripcion_corta: document.getElementById('product-crud-descripcion-corta').value || "",
        descripcion_larga: document.getElementById('product-crud-descripcion-larga').value || "",
        destacado: document.getElementById('product-crud-destacado').checked,
        activo: document.getElementById('product-crud-activo').checked,
        imagenes: imagenes.length > 0 ? imagenes : undefined // Si no hay imágenes, no enviar el campo (el backend lo ignorará o mantendrá las actuales si es undefined?)
    };

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
        const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
        const method = id ? 'PUT' : 'POST';

        const token = window.AdminHelper.getAuthToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method,
            credentials: 'include', // Include HttpOnly cookies
            headers: headers,
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            // Mostrar mensaje de éxito
            showNotification(id ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
            closeProductModal();

            // Recargar página o actualizar grid
            setTimeout(() => {
                if (window.location.pathname.includes('productos.html') || window.location.pathname.includes('index.html')) {
                    window.location.reload();
                }
            }, 1000);
        } else {
            showNotification(data.message || 'Error al guardar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al guardar producto', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Editar producto desde card
 */
function editProductFromCard(id) {
    openProductModal(id);
}

/**
 * Eliminar producto desde card
 */
async function deleteProductFromCard(id, nombre) {
    // Crear modal de confirmación personalizado
    const confirmed = await showConfirmDialog(
        '¿Eliminar producto?',
        `¿Estás seguro de que deseas eliminar el producto "${nombre}"? Esta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar'
    );

    if (!confirmed) return;

    try {
        const token = window.AdminHelper.getAuthToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE',
            credentials: 'include', // Include HttpOnly cookies
            headers: headers
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showNotification('Producto eliminado exitosamente', 'success');
            // Recargar página o remover card
            setTimeout(() => {
                if (window.location.pathname.includes('productos.html')) {
                    window.location.reload();
                } else {
                    // Remover card del DOM
                    const card = document.querySelector(`[data-product-id="${id}"]`);
                    if (card) {
                        card.style.transition = 'opacity 0.3s';
                        card.style.opacity = '0';
                        setTimeout(() => card.remove(), 300);
                    }
                }
            }, 500);
        } else {
            showNotification(data.message || 'Error al eliminar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar producto', 'error');
    }
}

/**
 * Mostrar diálogo de confirmación
 */
function showConfirmDialog(title, message, confirmText = 'Aceptar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'fixed inset-0 flex items-center justify-center p-4';
        dialog.style.cssText = 'background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); z-index: 9999;';
        dialog.style.cssText = 'background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);';
        dialog.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl" id="confirm-dialog-content">
                <div class="p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                    <div class="flex gap-3">
                        <button id="confirm-dialog-ok" class="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-medium">
                            ${confirmText}
                        </button>
                        <button id="confirm-dialog-cancel" class="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium">
                            ${cancelText}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const dialogContent = document.getElementById('confirm-dialog-content');
        if (dialogContent) {
            dialogContent.addEventListener('click', (e) => e.stopPropagation());
        }

        document.getElementById('confirm-dialog-ok').addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(true);
        });

        document.getElementById('confirm-dialog-cancel').addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(false);
        });

        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
                resolve(false);
            }
        });
    });
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    // Cambiado a top-20 para aparecer justo debajo del navbar y z-index muy alto
    notification.className = `fixed top-20 right-4 ${bgColor} text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2`;
    notification.style.zIndex = '99999'; // Z-index muy alto para estar sobre todo
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);

    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        notification.style.transition = 'all 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Importar productos desde JSON
 */
async function importProductsFromJSON() {
    const jsonText = document.getElementById('json-input').value.trim();
    if (!jsonText) {
        showNotification('Por favor ingresa el JSON', 'error');
        return;
    }

    try {
        let products = JSON.parse(jsonText);

        // Si es un objeto con propiedad productos
        if (products.productos && Array.isArray(products.productos)) {
            products = products.productos;
        }

        if (!Array.isArray(products)) {
            showNotification('El JSON debe ser un array de productos o un objeto con propiedad "productos"', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Importar Productos',
            `¿Deseas importar ${products.length} productos? Esta operación puede tardar unos momentos.`,
            'Importar',
            'Cancelar'
        );

        if (!confirmed) return;

        // Mostrar progreso
        const importBtn = document.querySelector('#import-json-modal button[onclick="importProductsFromJSON()"]');
        const originalText = importBtn.textContent;
        importBtn.disabled = true;
        importBtn.textContent = `Importando... (0/${products.length})`;

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            importBtn.textContent = `Importando... (${i + 1}/${products.length})`;

            try {
                // Verificar si el producto ya existe por SKU
                const sku = product.sku || product.referencia || `SKU-${Date.now()}-${Math.random()}`;
                const checkResponse = await fetch(`${API_BASE}/productos?busqueda=${encodeURIComponent(sku)}`, {
                    credentials: 'include', // Include HttpOnly cookies
                    headers: {
                        'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
                    }
                });

                const checkData = await checkResponse.json();
                const exists = checkData.data && checkData.data.some(p => p.sku === sku);

                if (exists) {
                    // Actualizar producto existente
                    const existingProduct = checkData.data.find(p => p.sku === sku);
                    const updateResponse = await fetch(`${API_BASE}/productos/${existingProduct.id_producto}`, {
                        method: 'PUT',
                        credentials: 'include', // Include HttpOnly cookies
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
                        },
                        body: JSON.stringify({
                            nombre: product.nombre || product.name || existingProduct.nombre,
                            precio_actual: product.precio_actual || product.precio || product.price || existingProduct.precio_actual,
                            precio_anterior: product.precio_anterior || product.oldPrice || null,
                            stock: product.stock !== undefined ? product.stock : existingProduct.stock,
                            id_categoria: product.id_categoria || product.categoria_id || existingProduct.id_categoria,
                            id_marca: product.id_marca || product.marca_id || existingProduct.id_marca,
                            descripcion_corta: product.descripcion_corta || product.descripcion || product.description || null,
                            descripcion_larga: product.descripcion_larga || null,
                            destacado: product.destacado !== undefined ? product.destacado : existingProduct.destacado,
                            activo: product.activo !== undefined ? product.activo : true,
                            imagenes: product.imagenes || product.imagenes || null
                        })
                    });

                    if (updateResponse.ok) {
                        successCount++;
                    } else {
                        errorCount++;
                        errors.push(`Producto ${product.nombre || sku}: Error al actualizar`);
                    }
                } else {
                    // Crear nuevo producto
                    const response = await fetch(`${API_BASE}/productos`, {
                        method: 'POST',
                        credentials: 'include', // Include HttpOnly cookies
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
                        },
                        body: JSON.stringify({
                            nombre: product.nombre || product.name,
                            sku: sku,
                            precio_actual: product.precio_actual || product.precio || product.price || 0,
                            precio_anterior: product.precio_anterior || product.oldPrice || null,
                            stock: product.stock || 0,
                            id_categoria: product.id_categoria || product.categoria_id || 1,
                            id_marca: product.id_marca || product.marca_id || 1,
                            descripcion_corta: product.descripcion_corta || product.descripcion || product.description || null,
                            descripcion_larga: product.descripcion_larga || null,
                            destacado: product.destacado || product.featured || false,
                            activo: product.activo !== false,
                            imagenes: product.imagenes || product.imagenes || null
                        })
                    });

                    if (response.ok) {
                        successCount++;
                    } else {
                        const errorData = await response.json();
                        errorCount++;
                        errors.push(`Producto ${product.nombre || sku}: ${errorData.message || 'Error desconocido'}`);
                    }
                }
            } catch (error) {
                console.error('Error importando producto:', error);
                errorCount++;
                errors.push(`Producto ${product.nombre || 'Desconocido'}: ${error.message}`);
            }
        }

        importBtn.disabled = false;
        importBtn.textContent = originalText;

        // Mostrar resultado
        let message = `Importación completada:\n✓ ${successCount} productos procesados`;
        if (errorCount > 0) {
            message += `\n✗ ${errorCount} errores`;
            if (errors.length > 0 && errors.length <= 5) {
                message += '\n\nErrores:\n' + errors.join('\n');
            }
        }

        showNotification(message, errorCount === 0 ? 'success' : 'error');

        closeImportJSONModal();

        setTimeout(() => {
            if (window.location.pathname.includes('productos.html') || window.location.pathname.includes('index.html')) {
                window.location.reload();
            }
        }, 2000);
    } catch (error) {
        console.error('Error parseando JSON:', error);
        showNotification('Error: El JSON no es válido. Verifica el formato.', 'error');
    }
}

/**
 * Abrir gestor de banners
 */
function openBannerManager() {
    // Solo abrir si el usuario es admin (verificar estado global)
    if (!isAdminMode) {
        console.warn('Solo administradores pueden abrir este modal');
        hideAllAdminControls();
        return;
    }

    const modal = document.getElementById('banner-manager-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';

        // Cargar datos de forma asíncrona sin bloquear la UI
        Promise.all([
            loadBannersList().catch(err => {
                console.error('Error cargando lista de banners:', err);
            }),
            loadBannerImagesInManager().catch(err => {
                console.error('Error cargando imágenes de banner:', err);
            })
        ]).finally(() => {
            if (window.lucide) lucide.createIcons();
        });
    }
}

/**
 * Cerrar gestor de banners
 */
function closeBannerManager() {
    const modal = document.getElementById('banner-manager-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        document.body.style.overflow = '';
    }
}

/**
 * Cargar lista de banners
 */
async function loadBannersList() {
    const listContainer = document.getElementById('banners-list');
    if (!listContainer) {
        console.warn('No se encontró el contenedor de banners');
        return;
    }

    listContainer.innerHTML = '<div class="text-center text-gray-500 py-4">Cargando...</div>';

    // Intentar obtener token de múltiples fuentes (puede estar en cookie HttpOnly que no podemos leer)
    const token = window.AdminHelper?.getAuthToken() ||
        window.StorageUtils?.getToken() ||
        localStorage.getItem('jwt_token') ||
        null;

    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Solo agregar Authorization si tenemos token (si no, el backend leerá de cookies HttpOnly)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📥 Cargando lista de banners...');
        const response = await fetch(`${API_BASE}/admin/banners`, {
            method: 'GET',
            credentials: 'include', // Importante: incluye cookies HttpOnly automáticamente
            headers: headers
        });

        console.log('📥 Respuesta recibida:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ Error parseando JSON:', jsonError);
            const textResponse = await response.text();
            console.error('   Respuesta de texto:', textResponse);
            listContainer.innerHTML = `<div class="text-center text-red-500 py-4">Error: No se pudo procesar la respuesta del servidor</div>`;
            return;
        }

        if (response.ok && data.success) {
            console.log('✅ Banners cargados exitosamente:', data.data?.length || 0);
            renderBannersList(data.data || []);
        } else {
            let errorMsg = data.message || 'Error al cargar banners';
            if (response.status === 401) {
                errorMsg = 'No autorizado. Por favor, inicia sesión nuevamente.';
                // Redirigir al login si no está autenticado
                setTimeout(() => {
                    const loginPath = window.location.pathname.includes('/pages/')
                        ? '/pages/login.html'
                        : 'login.html';
                    window.location.href = loginPath;
                }, 2000);
            }
            console.error('❌ Error en respuesta:', data);
            listContainer.innerHTML = `<div class="text-center text-red-500 py-4">
                <p class="font-semibold">${errorMsg}</p>
            </div>`;
        }
    } catch (error) {
        console.error('❌ Error cargando banners:', error);
        console.error('   Tipo:', error.constructor.name);
        console.error('   Mensaje:', error.message);
        listContainer.innerHTML = `<div class="text-center text-red-500 py-4">
            <p class="font-semibold">Error: ${error.message || 'Error al cargar banners'}</p>
            <p class="text-sm text-gray-500 mt-2">Verifica que el servidor esté corriendo.</p>
        </div>`;
    }
}

/**
 * Renderizar lista de banners
 */
function renderBannersList(banners) {
    const listContainer = document.getElementById('banners-list');

    if (banners.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-8">No hay banners registrados</div>';
        return;
    }

    listContainer.innerHTML = banners.map(banner => `
        <div class="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
            <div class="flex-shrink-0">
                <img src="${banner.imagen_url}" alt="${escHtml(banner.titulo)}"
                    class="js-banner-list-image w-24 h-24 object-cover rounded-lg border border-gray-200">
            </div>
            <div class="flex-1 min-w-0">
                <h5 class="font-semibold text-gray-900 truncate">${escHtml(banner.titulo || 'Sin título')}</h5>
                <p class="text-sm text-gray-600">${escHtml(banner.subtitulo || '')}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 text-xs rounded-full ${banner.posicion === 'hero' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${escHtml(banner.posicion)}
                    </span>
                    <span class="px-2 py-1 text-xs rounded-full ${banner.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${banner.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span class="text-xs text-gray-500">Orden: ${banner.orden}</span>
                </div>
            </div>
            <div class="flex-shrink-0 flex gap-2">
                <button class="edit-banner-btn px-4 py-2 bg-[#FE2418] text-white rounded-lg hover:bg-[#d91b10] transition text-sm" data-id="${banner.id_banner}">
                    Editar
                </button>
                <button class="delete-banner-btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm" data-id="${banner.id_banner}" data-titulo="${banner.titulo.replace(/'/g, "\\'")}">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a los botones de banners
    listContainer.querySelectorAll('.edit-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            editBannerFromManager(id);
        });
    });

    listContainer.querySelectorAll('.delete-banner-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            const titulo = btn.dataset.titulo;
            deleteBannerFromManager(id, titulo);
        });
    });

    // Agregar listeners para errores de imagen en banners
    listContainer.querySelectorAll('.js-banner-list-image').forEach(img => {
        img.addEventListener('error', function () {
            this.src = '/assets/img/no-image.svg';
        });
    });
}

/**
 * Agregar banner desde el gestor
 */
async function addBannerFromManager() {
    const titulo = document.getElementById('new-banner-titulo').value;
    const enlace = document.getElementById('new-banner-enlace').value;
    const posicion = document.getElementById('new-banner-posicion').value;
    const orden = parseInt(document.getElementById('new-banner-orden').value) || 0;
    const imageFile = document.getElementById('new-banner-image').files[0];

    if (!titulo) {
        showNotification('El título es requerido', 'error');
        return;
    }

    if (!imageFile) {
        showNotification('Debes seleccionar una imagen', 'error');
        return;
    }

    try {
        showNotification('Optimizando imagen...', 'success');

        // Optimizar imagen si es mayor a 1MB
        let fileToUpload = imageFile;
        const fileSizeMB = imageFile.size / (1024 * 1024);

        if (fileSizeMB > 1) {
            console.log(`📦 Tamaño original: ${fileSizeMB.toFixed(2)} MB`);
            const optimizedBlob = await optimizeImage(imageFile, 1920, 0.85);
            const optimizedSizeMB = optimizedBlob.size / (1024 * 1024);
            console.log(`✅ Tamaño optimizado: ${optimizedSizeMB.toFixed(2)} MB`);

            fileToUpload = new File([optimizedBlob], imageFile.name, {
                type: imageFile.type,
                lastModified: Date.now()
            });

            showNotification(`Imagen optimizada: ${fileSizeMB.toFixed(1)}MB → ${optimizedSizeMB.toFixed(1)}MB`, 'success');
        }

        // Validar tamaño después de optimización
        if (fileToUpload.size > 5 * 1024 * 1024) {
            showNotification('El archivo sigue siendo demasiado grande después de optimizar. Intenta con una imagen más pequeña.', 'error');
            return;
        }

        // Subir imagen primero
        const formData = new FormData();
        formData.append('image', fileToUpload);

        showNotification('Subiendo imagen...', 'success');

        const uploadResponse = await fetch(`${API_BASE}/admin/banners/images/upload`, {
            method: 'POST',
            credentials: 'include', // Incluir cookies (HttpOnly)
            body: formData
        });

        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadData.success) {
            showNotification('Error al subir imagen: ' + (uploadData.message || 'Error desconocido'), 'error');
            return;
        }

        // Crear banner en la BD
        const bannerData = {
            titulo: titulo,
            imagen_url: uploadData.data.url,
            enlace_url: enlace || null,
            posicion: posicion,
            orden: orden,
            activo: true
        };

        const bannerResponse = await fetch(`${API_BASE}/admin/banners`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            },
            body: JSON.stringify(bannerData)
        });

        const bannerDataResult = await bannerResponse.json();
        if (bannerResponse.ok && bannerDataResult.success) {
            showNotification('Banner agregado exitosamente', 'success');
            // Limpiar formulario
            document.getElementById('new-banner-titulo').value = '';
            document.getElementById('new-banner-enlace').value = '';
            document.getElementById('new-banner-image').value = '';
            document.getElementById('new-banner-orden').value = '0';
            // Recargar lista
            loadBannersList();
        } else {
            showNotification('Error al crear banner: ' + (bannerDataResult.message || 'Error desconocido'), 'error');
        }
    } catch (error) {
        console.error('Error agregando banner:', error);
        showNotification('Error al agregar banner: ' + error.message, 'error');
    }
}

/**
 * Editar banner desde el gestor
 */
function editBannerFromManager(id) {
    closeBannerManager();
    // Redirigir al panel admin o abrir modal de edición
    window.location.href = 'admin.html#banners';
}

/**
 * Eliminar banner desde el gestor
 */
async function deleteBannerFromManager(id, titulo) {
    const confirmed = await showConfirmDialog(
        '¿Eliminar banner?',
        `¿Estás seguro de que deseas eliminar el banner "${titulo}"? Esta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar'
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/admin/banners/${id}?permanent=true`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showNotification('Banner eliminado exitosamente', 'success');
            loadBannersList();
        } else {
            showNotification(data.message || 'Error al eliminar banner', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar banner', 'error');
    }
}

/**
 * Abrir modal de imágenes de banner
 */
function openBannerImagesModal() {
    if (!isAdminMode) {
        console.warn('Solo administradores pueden abrir este modal');
        return;
    }

    const modal = document.getElementById('banner-images-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        loadBannerImages();
        if (window.lucide) lucide.createIcons();
    }
}

/**
 * Cerrar modal de imágenes de banner
 */
function closeBannerImagesModal() {
    const modal = document.getElementById('banner-images-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        document.body.style.overflow = '';
    }
}

/**
 * Cargar lista de imágenes de banner
 */
async function loadBannerImages() {
    const listContainer = document.getElementById('banner-images-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="text-center text-gray-500 py-8 col-span-full">Cargando imágenes...</div>';

    try {
        const response = await fetch(`${API_BASE}/admin/banners/images`, {
            method: 'GET',
            credentials: 'include', // Incluir cookies (HttpOnly)
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            renderBannerImagesList(data.data || []);
        } else {
            console.error('Error en respuesta:', data);
            listContainer.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">Error: ${data.message || 'Error al cargar imágenes'}</div>`;
        }
    } catch (error) {
        console.error('Error cargando imágenes de banner:', error);
        listContainer.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">Error: ${error.message || 'Error al cargar imágenes'}</div>`;
    }
}

/**
 * Renderizar lista de imágenes de banner
 */
function renderBannerImagesList(images, containerId = null) {
    // Buscar el contenedor: primero el especificado, luego el visible, luego el primero disponible
    let listContainer = null;
    if (containerId) {
        listContainer = document.getElementById(containerId);
    }

    if (!listContainer) {
        // Buscar el contenedor en el modal de gestión de banners (si está visible)
        const bannerManagerModal = document.getElementById('banner-manager-modal');
        if (bannerManagerModal && !bannerManagerModal.classList.contains('hidden')) {
            listContainer = document.getElementById('banner-images-list-manager');
        } else {
            // Buscar en el modal de imágenes
            const bannerImagesModal = document.getElementById('banner-images-modal');
            if (bannerImagesModal && !bannerImagesModal.classList.contains('hidden')) {
                listContainer = document.getElementById('banner-images-list');
            } else {
                // Usar el primero disponible
                listContainer = document.getElementById('banner-images-list-manager') || document.getElementById('banner-images-list');
            }
        }
    }

    if (!listContainer) {
        console.error('No se encontró el contenedor de imágenes');
        return;
    }

    if (images.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-8 col-span-full">No hay imágenes disponibles</div>';
        return;
    }

    listContainer.innerHTML = images.map(image => `
        <div class="relative group bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            <div class="aspect-video relative">
                <img src="${image.url}" alt="${image.filename}" 
                    class="w-full h-full object-cover js-banner-image"
                    onerror="this.src='/assets/img/no-image.svg'">
            </div>
            <div class="p-3">
                <p class="text-xs text-gray-600 truncate mb-2" title="${image.filename}">${image.filename}</p>
                <button class="delete-banner-image-btn w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium" 
                    data-filename="${image.filename}" 
                    data-url="${image.url}">
                    <i data-lucide="trash-2" class="w-4 h-4 inline mr-1"></i>
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a los botones de eliminar
    listContainer.querySelectorAll('.delete-banner-image-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filename = btn.dataset.filename;
            const url = btn.dataset.url;
            deleteBannerImage(filename, url);
        });
    });

    if (window.lucide) lucide.createIcons();
}

/**
 * Cargar imágenes de banner en el modal de gestión
 */
async function loadBannerImagesInManager() {
    const listContainer = document.getElementById('banner-images-list-manager');

    if (!listContainer) {
        console.warn('No se encontró el contenedor de imágenes en el modal de gestión');
        return;
    }

    listContainer.innerHTML = '<div class="text-center text-gray-500 py-8 col-span-full">Cargando imágenes...</div>';

    // Intentar obtener token de múltiples fuentes (puede estar en cookie HttpOnly que no podemos leer)
    const token = window.AdminHelper?.getAuthToken() ||
        window.StorageUtils?.getToken() ||
        localStorage.getItem('jwt_token') ||
        null;

    try {
        const headers = {
            'Content-Type': 'application/json'
        };

        // Solo agregar Authorization si tenemos token (si no, el backend leerá de cookies HttpOnly)
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        console.log('📥 Cargando imágenes de banner...');
        const response = await fetch(`${API_BASE}/admin/banners/images`, {
            method: 'GET',
            credentials: 'include', // Importante: incluye cookies HttpOnly automáticamente
            headers: headers
        });

        console.log('📥 Respuesta recibida:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            console.error('❌ Error parseando JSON:', jsonError);
            const textResponse = await response.text();
            console.error('   Respuesta de texto:', textResponse);
            listContainer.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">Error: No se pudo procesar la respuesta del servidor</div>`;
            return;
        }

        if (response.ok && data.success) {
            console.log('✅ Imágenes cargadas exitosamente:', data.data?.length || 0);
            renderBannerImagesList(data.data || [], 'banner-images-list-manager');
        } else {
            let errorMsg = data.message || 'Error al cargar imágenes';
            if (response.status === 401) {
                errorMsg = 'No autorizado. Por favor, inicia sesión nuevamente.';
            }
            console.error('❌ Error en respuesta:', data);
            listContainer.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">
                <p class="font-semibold">Error: ${errorMsg}</p>
                <p class="text-sm text-gray-500 mt-2">El directorio de imágenes puede no existir. Verifica los logs del servidor.</p>
            </div>`;
        }
    } catch (error) {
        console.error('❌ Error cargando imágenes de banner:', error);
        console.error('   Tipo:', error.constructor.name);
        console.error('   Mensaje:', error.message);
        listContainer.innerHTML = `<div class="text-center text-red-500 py-8 col-span-full">
            <p class="font-semibold">Error: ${error.message || 'Error al cargar imágenes'}</p>
            <p class="text-sm text-gray-500 mt-2">Verifica que el servidor esté corriendo y que tengas permisos de administrador.</p>
        </div>`;
    }
}

/**
 * Optimizar imagen antes de subir
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo (default: 1920px para banners)
 * @param {number} quality - Calidad de compresión (0-1, default: 0.85)
 * @returns {Promise<Blob>} - Imagen optimizada
 */
async function optimizeImage(file, maxWidth = 1920, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar si es necesario
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a blob con compresión
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Error al optimizar imagen'));
                        }
                    },
                    file.type === 'image/png' ? 'image/png' : 'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Error al cargar imagen'));
        };
        reader.onerror = () => reject(new Error('Error al leer archivo'));
    });
}

/**
 * Manejar subida de imagen de banner
 */
async function handleBannerImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showNotification('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WEBP)', 'error');
        event.target.value = '';
        return;
    }

    try {
        showNotification('Optimizando imagen...', 'success');

        // Optimizar imagen si es mayor a 1MB
        let fileToUpload = file;
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > 1) {
            console.log(`📦 Tamaño original: ${fileSizeMB.toFixed(2)} MB`);
            try {
                const optimizedBlob = await optimizeImage(file, 1920, 0.85);
                const optimizedSizeMB = optimizedBlob.size / (1024 * 1024);
                console.log(`✅ Tamaño optimizado: ${optimizedSizeMB.toFixed(2)} MB`);

                // Determinar el tipo MIME correcto basado en el blob
                const mimeType = optimizedBlob.type || file.type || 'image/jpeg';

                // Crear un nuevo archivo con el blob optimizado
                // Usar el mismo nombre pero asegurar que el tipo MIME sea correcto
                fileToUpload = new File([optimizedBlob], file.name, {
                    type: mimeType,
                    lastModified: Date.now()
                });

                console.log('✅ Archivo optimizado creado:', {
                    name: fileToUpload.name,
                    type: fileToUpload.type,
                    size: fileToUpload.size
                });

                showNotification(`Imagen optimizada: ${fileSizeMB.toFixed(1)}MB → ${optimizedSizeMB.toFixed(1)}MB`, 'success');
            } catch (optimizeError) {
                console.error('❌ Error optimizando imagen, usando archivo original:', optimizeError);
                // Si falla la optimización, usar el archivo original
                fileToUpload = file;
            }
        }

        // Validar tamaño después de optimización (máximo 5MB)
        if (fileToUpload.size > 5 * 1024 * 1024) {
            showNotification('El archivo sigue siendo demasiado grande después de optimizar. Intenta con una imagen más pequeña.', 'error');
            event.target.value = '';
            return;
        }

        const formData = new FormData();
        formData.append('image', fileToUpload);

        showNotification('Subiendo imagen...', 'success');

        console.log('📤 Enviando imagen al servidor...');
        console.log('   Archivo:', fileToUpload.name);
        console.log('   Tamaño:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
        console.log('   Tipo:', fileToUpload.type);

        const response = await fetch(`${API_BASE}/admin/banners/images/upload`, {
            method: 'POST',
            credentials: 'include', // Incluir cookies (HttpOnly)
            body: formData
        });

        console.log('📥 Respuesta recibida:', response.status, response.statusText);

        let data;
        try {
            data = await response.json();
            console.log('📦 Datos de respuesta:', data);
        } catch (jsonError) {
            console.error('❌ Error parseando JSON de respuesta:', jsonError);
            const textResponse = await response.text();
            console.error('   Respuesta de texto:', textResponse);
            showNotification('Error al procesar respuesta del servidor', 'error');
            return;
        }

        if (response.ok && data.success) {
            console.log('✅ Imagen subida exitosamente');
            console.log('   URL:', data.data?.url);
            console.log('   Filename:', data.data?.filename);
            showNotification('Imagen subida exitosamente', 'success');
            // Esperar un momento antes de recargar para asegurar que el archivo esté completamente guardado
            setTimeout(() => {
                console.log('🔄 Recargando lista de imágenes...');
                // Recargar lista de imágenes en ambos modales si están abiertos
                const bannerImagesModal = document.getElementById('banner-images-modal');
                const bannerManagerModal = document.getElementById('banner-manager-modal');
                if (bannerImagesModal && !bannerImagesModal.classList.contains('hidden')) {
                    loadBannerImages();
                }
                if (bannerManagerModal && !bannerManagerModal.classList.contains('hidden')) {
                    loadBannerImagesInManager();
                }
            }, 500); // Esperar 500ms antes de recargar
        } else {
            console.error('❌ Error en la respuesta del servidor:', data);
            showNotification(data.message || 'Error al subir imagen', 'error');
        }
    } catch (error) {
        console.error('❌ Error subiendo imagen:', error);
        console.error('   Tipo de error:', error.constructor.name);
        console.error('   Mensaje:', error.message);
        console.error('   Stack:', error.stack);
        showNotification('Error al subir imagen: ' + error.message, 'error');
    } finally {
        event.target.value = '';
    }
}

/**
 * Eliminar imagen de banner
 */
async function deleteBannerImage(filename, url) {
    const confirmed = await showConfirmDialog(
        '¿Eliminar imagen?',
        `¿Estás seguro de que deseas eliminar la imagen "${filename}"? Esta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar'
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE}/admin/banners/images/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            credentials: 'include', // Incluir cookies (HttpOnly)
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showNotification('Imagen eliminada exitosamente', 'success');
            // Recargar lista de imágenes en ambos modales si están abiertos
            const bannerImagesModal = document.getElementById('banner-images-modal');
            const bannerManagerModal = document.getElementById('banner-manager-modal');
            if (bannerImagesModal && !bannerImagesModal.classList.contains('hidden')) {
                loadBannerImages();
            }
            if (bannerManagerModal && !bannerManagerModal.classList.contains('hidden')) {
                loadBannerImagesInManager();
            }
        } else {
            showNotification(data.message || 'Error al eliminar imagen', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error al eliminar imagen', 'error');
    }
}

// Exportar funciones globalmente
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.openImportJSONModal = openImportJSONModal;
window.closeImportJSONModal = closeImportJSONModal;
window.editProductFromCard = editProductFromCard;
window.deleteProductFromCard = deleteProductFromCard;
window.saveProductFromModal = saveProductFromModal;
window.importProductsFromJSON = importProductsFromJSON;
window.openBannerManager = openBannerManager;
window.closeBannerManager = closeBannerManager;
window.addBannerFromManager = addBannerFromManager;
window.editBannerFromManager = editBannerFromManager;
window.deleteBannerFromManager = deleteBannerFromManager;
window.openBannerImagesModal = openBannerImagesModal;
window.closeBannerImagesModal = closeBannerImagesModal;
window.loadBannerImages = loadBannerImages;
window.handleBannerImageUpload = handleBannerImageUpload;
window.deleteBannerImage = deleteBannerImage;
window.handleImageUpload = handleImageUpload;
window.updateImagePreview = updateImagePreview;
window.removeImageFromPreview = removeImageFromPreview;
window.setupModalCloseListeners = setupModalCloseListeners;

// ============================================================
// ADMIN PANEL — Página admin.html
// Se activa solo cuando la URL contiene "admin.html"
// ============================================================

(function () {
    if (!window.location.pathname.includes('admin')) return;

    // Estado del panel
    const adminPanel = {
        currentPage: 1,
        currentTab: 'productos',
        searchTimeout: null,
        selectedIds: new Set()
    };

    // --------------------------------------------------------
    // Inicialización del panel admin
    // --------------------------------------------------------
    async function initAdminPanel() {
        // Ocultar modales al arrancar (los estáticos del HTML)
        ['product-modal', 'banner-modal', 'loading-overlay'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add('hidden');
                el.style.display = 'none';
                el.style.visibility = 'hidden';
            }
        });

        // Verificar autenticación admin
        await checkAdminPanelAccess();

        // Cargar navbar
        loadAdminNavbar();

        // Inyectar modales de admin-crud (product-crud-modal, banner-manager-modal, etc.)
        isAdminMode = true;
        loadAdminModals();

        // Sobreescribir saveProductFromModal para que refresque la tabla en lugar de redirigir
        overrideSaveProduct();

        // Configurar tabla de productos mejorada
        upgradeProductsTable();

        // Escuchar hash
        const hash = window.location.hash.replace('#', '');
        const validTabs = ['dashboard', 'productos', 'banners', 'destacados', 'backup', 'categorias', 'marcas', 'sedes', 'asesores'];
        if (hash && validTabs.includes(hash)) {
            panelSwitchTab(hash);
        } else {
            panelSwitchTab('dashboard');
        }

        // Configurar tabs para que llamen a panelSwitchTab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = btn.getAttribute('data-tab');
                panelSwitchTab(tab);
            });
        });

        // Botón "+ Nuevo Producto"
        const newProductBtn = document.querySelector('button[onclick="openProductModal()"]');
        if (newProductBtn) {
            newProductBtn.removeAttribute('onclick');
            newProductBtn.addEventListener('click', () => {
                isAdminMode = true;
                openProductModal();
            });
        }

        // Búsqueda con Enter y botón
        const searchInput = document.getElementById('product-search');
        const searchBtn = document.querySelector('button[onclick="searchProducts()"]');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') panelLoadProducts(1);
            });
            searchInput.addEventListener('input', () => {
                clearTimeout(adminPanel.searchTimeout);
                adminPanel.searchTimeout = setTimeout(() => panelLoadProducts(1), 400);
            });
        }
        if (searchBtn) {
            searchBtn.removeAttribute('onclick');
            searchBtn.addEventListener('click', () => panelLoadProducts(1));
        }
    }

    // --------------------------------------------------------
    // Verificar acceso admin
    // --------------------------------------------------------
    async function checkAdminPanelAccess() {
        try {
            const response = await fetch('/api/v1/productos/admin/all?limit=1', {
                credentials: 'include'
            });
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/pages/login.html?redirect=admin';
            }
        } catch (err) {
            console.error('Error verificando acceso admin:', err);
            window.location.href = '/pages/login.html?redirect=admin';
        }
    }

    // --------------------------------------------------------
    // Cargar navbar
    // --------------------------------------------------------
    function loadAdminNavbar() {
        fetch('../components/navbar.html')
            .then(r => r.text())
            .then(html => {
                const container = document.getElementById('navbar-container');
                if (container) container.innerHTML = html;
                if (typeof initNavbar === 'function') initNavbar();
            })
            .catch(err => console.error('Error cargando navbar:', err));
    }

    // --------------------------------------------------------
    // Cambiar tab
    // --------------------------------------------------------
    function panelSwitchTab(tabName) {
        adminPanel.currentTab = tabName;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            const tab = btn.getAttribute('data-tab');
            if (tab === tabName) {
                btn.classList.add('border-[#FE2418]', 'text-[#FE2418]');
                btn.classList.remove('border-transparent', 'text-gray-500', 'border-blue-500', 'text-blue-600');
            } else {
                btn.classList.remove('border-[#FE2418]', 'text-[#FE2418]', 'border-blue-500', 'text-blue-600');
                btn.classList.add('border-transparent', 'text-gray-500');
            }
        });

        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const tabEl = document.getElementById(`tab-${tabName}`);
        if (tabEl) tabEl.classList.add('active');

        switch (tabName) {
            case 'dashboard': panelLoadDashboard(); break;
            case 'productos': panelLoadProducts(1); break;
            case 'banners': panelLoadBanners(); break;
            case 'destacados': panelLoadFeaturedProducts(); break;
            case 'backup': panelLoadBackups(); break;
            case 'categorias': wireNewTabButtons(); panelLoadCategorias(1); break;
            case 'marcas': wireNewTabButtons(); panelLoadMarcas(1); break;
            case 'sedes': wireNewTabButtons(); panelLoadSedes(1); break;
            case 'asesores': wireNewTabButtons(); panelLoadAsesores(1); break;
        }
    }

    // --------------------------------------------------------
    // Actualizar cabecera de tabla con columnas admin
    // --------------------------------------------------------
    function upgradeProductsTable() {
        // Reemplazar thead con columnas enriquecidas
        const table = document.querySelector('#tab-productos table');
        if (!table) return;

        const thead = table.querySelector('thead tr');
        if (thead) {
            thead.innerHTML = `
                <th class="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    <input type="checkbox" id="select-all-products" class="w-4 h-4 rounded">
                </th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Img</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destacado</th>
                <th class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            `;
        }

        // Inyectar barra de filtros y acciones masivas justo sobre la tabla
        const tableWrapper = document.querySelector('#tab-productos .overflow-x-auto');
        if (tableWrapper) {
            const filterBar = document.createElement('div');
            filterBar.id = 'admin-filter-bar';
            filterBar.className = 'mb-4 flex flex-wrap gap-3 items-center';
            filterBar.innerHTML = `
                <select id="filter-activo" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2418]">
                    <option value="">Todos los estados</option>
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                </select>
                <select id="filter-destacado" class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FE2418]">
                    <option value="">Todos</option>
                    <option value="true">Destacados</option>
                    <option value="false">No destacados</option>
                </select>
                <div id="bulk-actions-bar" class="hidden flex items-center gap-2">
                    <span id="selected-count" class="text-sm text-gray-600 font-medium">0 seleccionados</span>
                    <select id="bulk-action-select" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">Acción masiva...</option>
                        <option value="activate">Activar</option>
                        <option value="deactivate">Desactivar</option>
                        <option value="destacar">Marcar destacado</option>
                        <option value="undestacar">Quitar destacado</option>
                        <option value="delete">Eliminar (soft)</option>
                    </select>
                    <button id="apply-bulk-action-btn" class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition font-medium">
                        Aplicar
                    </button>
                </div>
            `;
            tableWrapper.parentNode.insertBefore(filterBar, tableWrapper);

            // Listeners de filtros
            document.getElementById('filter-activo').addEventListener('change', () => panelLoadProducts(1));
            document.getElementById('filter-destacado').addEventListener('change', () => panelLoadProducts(1));

            // Listener acción masiva
            document.getElementById('apply-bulk-action-btn').addEventListener('click', applyBulkAction);

            // Select all
            document.getElementById('select-all-products').addEventListener('change', (e) => {
                const checked = e.target.checked;
                document.querySelectorAll('.row-checkbox').forEach(cb => {
                    cb.checked = checked;
                    const id = parseInt(cb.dataset.id);
                    if (checked) adminPanel.selectedIds.add(id);
                    else adminPanel.selectedIds.delete(id);
                });
                updateBulkBar();
            });
        }
    }

    // --------------------------------------------------------
    // Cargar productos (tabla admin)
    // --------------------------------------------------------
    async function panelLoadProducts(page = 1) {
        adminPanel.currentPage = page;
        adminPanel.selectedIds.clear();
        updateBulkBar();

        const tbody = document.getElementById('products-table-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="12" class="px-6 py-4 text-center text-gray-500">Cargando productos...</td></tr>';
        }

        const params = new URLSearchParams({ page, limit: 25 });

        const searchVal = document.getElementById('product-search')?.value?.trim();
        if (searchVal) params.set('q', searchVal);

        const activoVal = document.getElementById('filter-activo')?.value;
        if (activoVal !== '' && activoVal !== null && activoVal !== undefined) params.set('activo', activoVal);

        const destacadoVal = document.getElementById('filter-destacado')?.value;
        if (destacadoVal !== '' && destacadoVal !== null && destacadoVal !== undefined) params.set('destacado', destacadoVal);

        try {
            const response = await fetch(`${API_BASE}/productos/admin/all?${params}`, {
                credentials: 'include'
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = '/pages/login.html?redirect=admin';
                return;
            }

            const data = await response.json();
            if (data.success) {
                panelRenderProductsTable(data.data || []);
                panelRenderPagination(data.pagination, panelLoadProducts);
            } else {
                showAdminPanelError('Error al cargar productos: ' + (data.message || ''));
            }
        } catch (err) {
            console.error('Error cargando productos admin:', err);
            showAdminPanelError('Error de conexión al cargar productos');
        }
    }

    // --------------------------------------------------------
    // Renderizar tabla de productos
    // --------------------------------------------------------
    function panelRenderProductsTable(products) {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="12" class="px-6 py-8 text-center text-gray-500">No se encontraron productos</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(p => {
            const imgUrl = p.imagen || '/assets/img/no-image.svg';
            const activoBadge = p.activo
                ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Activo</span>'
                : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactivo</span>';
            const destacadoBadge = p.destacado
                ? '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-medium">Si</span>'
                : '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-medium">No</span>';
            const precio = p.precio_actual != null
                ? '$' + parseFloat(p.precio_actual).toLocaleString('es-CO')
                : '-';

            return `
                <tr class="hover:bg-gray-50" data-product-id="${p.id_producto}">
                    <td class="px-3 py-3 text-center">
                        <input type="checkbox" class="row-checkbox w-4 h-4 rounded" data-id="${p.id_producto}">
                    </td>
                    <td class="px-3 py-2">
                        <img src="${imgUrl}" alt="${escHtml(p.nombre)}" class="w-12 h-12 object-cover rounded-lg border border-gray-200"
                             onerror="this.src='/assets/img/no-image.svg'">
                    </td>
                    <td class="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">${p.id_producto}</td>
                    <td class="px-3 py-3 text-sm text-gray-700 whitespace-nowrap font-mono">${escHtml(p.sku || '-')}</td>
                    <td class="px-3 py-3 text-sm text-gray-900 max-w-xs truncate" title="${escHtml(p.nombre)}">${escHtml(p.nombre)}</td>
                    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">${escHtml(p.categoria || '-')}</td>
                    <td class="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">${escHtml(p.marca || '-')}</td>
                    <td class="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">${precio}</td>
                    <td class="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">${p.stock != null ? p.stock : '-'}</td>
                    <td class="px-3 py-3 whitespace-nowrap">${activoBadge}</td>
                    <td class="px-3 py-3 whitespace-nowrap">${destacadoBadge}</td>
                    <td class="px-3 py-3 whitespace-nowrap text-sm font-medium">
                        <button class="panel-edit-btn text-[#FE2418] hover:text-[#091C49] mr-3 font-medium" data-id="${p.id_producto}">Editar</button>
                        <button class="panel-delete-btn text-red-600 hover:text-red-900 font-medium" data-id="${p.id_producto}" data-name="${escHtml(p.nombre)}">Eliminar</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Listeners para filas
        tbody.querySelectorAll('.panel-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                isAdminMode = true;
                openProductModal(id);
            });
        });

        tbody.querySelectorAll('.panel-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                const name = btn.dataset.name || 'este producto';
                panelDeleteProduct(id, name);
            });
        });

        tbody.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.addEventListener('change', (e) => {
                const id = parseInt(cb.dataset.id);
                if (e.target.checked) adminPanel.selectedIds.add(id);
                else adminPanel.selectedIds.delete(id);
                updateBulkBar();
            });
        });
    }

    // --------------------------------------------------------
    // Paginación panel
    // --------------------------------------------------------
    function panelRenderPagination(pagination, callback) {
        const container = document.getElementById('products-pagination');
        if (!container || !pagination || pagination.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        const { page, totalPages } = pagination;
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);

        container.innerHTML = `
            <button class="panel-page-btn px-3 py-2 border rounded text-sm ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
            ${pages.map(p => `
                <button class="panel-page-btn px-3 py-2 border rounded text-sm ${p === page ? 'bg-[#FE2418] text-white' : 'hover:bg-gray-50'}" data-page="${p}">${p}</button>
            `).join('')}
            <button class="panel-page-btn px-3 py-2 border rounded text-sm ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Siguiente</button>
        `;

        container.querySelectorAll('.panel-page-btn:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => callback(parseInt(btn.dataset.page)));
        });
    }

    // --------------------------------------------------------
    // Eliminar producto desde panel
    // --------------------------------------------------------
    async function panelDeleteProduct(id, name) {
        const confirmed = await showConfirmDialog(
            'Eliminar producto',
            `¿Eliminar "${name}"? Esta acción es reversible desde la base de datos (soft delete).`,
            'Eliminar', 'Cancelar'
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/productos/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showNotification('Producto eliminado', 'success');
                panelLoadProducts(adminPanel.currentPage);
            } else {
                showNotification(data.message || 'Error al eliminar', 'error');
            }
        } catch (err) {
            console.error('Error eliminando producto:', err);
            showNotification('Error de conexión', 'error');
        }
    }

    // --------------------------------------------------------
    // Acciones masivas
    // --------------------------------------------------------
    function updateBulkBar() {
        const bar = document.getElementById('bulk-actions-bar');
        const countEl = document.getElementById('selected-count');
        const selectAll = document.getElementById('select-all-products');
        if (!bar) return;

        const count = adminPanel.selectedIds.size;
        if (count > 0) {
            bar.classList.remove('hidden');
            bar.style.display = 'flex';
            if (countEl) countEl.textContent = `${count} seleccionado${count !== 1 ? 's' : ''}`;
        } else {
            bar.classList.add('hidden');
            bar.style.display = 'none';
        }

        // Actualizar checkbox "select all"
        if (selectAll) {
            const allCheckboxes = document.querySelectorAll('.row-checkbox');
            selectAll.indeterminate = count > 0 && count < allCheckboxes.length;
            selectAll.checked = count > 0 && count === allCheckboxes.length;
        }
    }

    async function applyBulkAction() {
        const action = document.getElementById('bulk-action-select')?.value;
        if (!action) {
            showNotification('Selecciona una acción', 'error');
            return;
        }
        if (adminPanel.selectedIds.size === 0) {
            showNotification('Selecciona al menos un producto', 'error');
            return;
        }

        const ids = Array.from(adminPanel.selectedIds);
        const actionLabels = {
            activate: 'activar',
            deactivate: 'desactivar',
            destacar: 'marcar como destacado',
            undestacar: 'quitar de destacados',
            delete: 'eliminar (soft)'
        };

        const confirmed = await showConfirmDialog(
            'Acción masiva',
            `¿Deseas ${actionLabels[action] || action} los ${ids.length} productos seleccionados?`,
            'Aplicar', 'Cancelar'
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`${API_BASE}/productos/admin/bulk-action`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ids })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                showNotification(`${data.affected_count} productos actualizados`, 'success');
                adminPanel.selectedIds.clear();
                panelLoadProducts(adminPanel.currentPage);
            } else {
                showNotification(data.message || 'Error en acción masiva', 'error');
            }
        } catch (err) {
            console.error('Error en acción masiva:', err);
            showNotification('Error de conexión', 'error');
        }
    }

    // --------------------------------------------------------
    // Tabs Banners, Destacados, Backup (reutilizan funciones del admin.js original)
    // --------------------------------------------------------
    async function panelLoadBanners() {
        const grid = document.getElementById('banners-grid');
        if (!grid) return;
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Cargando banners...</div>';

        // Wire up "+ Nuevo Banner" button
        const newBannerBtn = document.querySelector('button[onclick="openBannerModal()"]');
        if (newBannerBtn && !newBannerBtn.dataset.panelBannerListenerAttached) {
            newBannerBtn.removeAttribute('onclick');
            newBannerBtn.addEventListener('click', () => openPanelBannerModal());
            newBannerBtn.dataset.panelBannerListenerAttached = 'true';
        }

        try {
            const response = await fetch(`${API_BASE}/admin/banners`, { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                panelRenderBannersGrid(data.data || []);
            } else {
                grid.innerHTML = `<div class="col-span-full text-red-500 py-4">Error: ${data.message}</div>`;
            }
        } catch (err) {
            console.error('Error cargando banners:', err);
            grid.innerHTML = '<div class="col-span-full text-red-500 py-4">Error al cargar banners</div>';
        }
    }

    function panelRenderBannersGrid(banners) {
        const grid = document.getElementById('banners-grid');
        if (!grid) return;
        if (banners.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No hay banners.</div>';
            return;
        }

        const posicionColors = {
            hero: 'bg-blue-100 text-blue-800',
            sidebar: 'bg-purple-100 text-purple-800',
            footer: 'bg-gray-100 text-gray-700',
            popup: 'bg-orange-100 text-orange-800'
        };

        grid.innerHTML = banners.map(b => `
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" data-banner-id="${b.id_banner}">
                <!-- Image preview 16:9 -->
                <div class="relative w-full" style="padding-top:56.25%; max-height:200px;">
                    <img src="${b.imagen_url || '/assets/img/no-image.svg'}" alt="${escHtml(b.titulo || '')}"
                         class="absolute inset-0 w-full h-full object-cover"
                         onerror="this.src='/assets/img/no-image.svg'">
                </div>
                <div class="p-4">
                    <!-- Title -->
                    <h3 class="font-semibold text-gray-900 truncate mb-2" title="${escHtml(b.titulo || '')}">${escHtml(b.titulo || 'Sin título')}</h3>

                    <!-- Badges row -->
                    <div class="flex flex-wrap items-center gap-2 mb-3">
                        <span class="px-2 py-0.5 text-xs rounded-full font-medium ${posicionColors[b.posicion] || 'bg-gray-100 text-gray-700'}">
                            ${escHtml(b.posicion)}
                        </span>
                        <span class="banner-activo-badge px-2 py-0.5 text-xs rounded-full font-medium ${b.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${b.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <!-- Order input -->
                    <div class="flex items-center gap-2 mb-3">
                        <label class="text-xs text-gray-500 whitespace-nowrap">Orden:</label>
                        <input type="number" min="0"
                               class="banner-orden-input w-20 px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]"
                               value="${b.orden != null ? b.orden : 0}"
                               data-id="${b.id_banner}"
                               data-original="${b.orden != null ? b.orden : 0}">
                    </div>

                    <!-- Toggle activo switch -->
                    <div class="flex items-center gap-2 mb-4">
                        <label class="text-xs text-gray-500">Activo:</label>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" class="banner-activo-toggle sr-only" data-id="${b.id_banner}" ${b.activo ? 'checked' : ''}>
                            <div class="w-10 h-5 rounded-full transition-colors ${b.activo ? 'bg-green-500' : 'bg-gray-300'}"></div>
                            <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${b.activo ? 'translate-x-5' : 'translate-x-0'}"></div>
                        </label>
                    </div>

                    <!-- Actions -->
                    <div class="flex gap-2">
                        <button class="panel-edit-banner flex-1 bg-[#FE2418] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#d91b10] transition font-medium"
                                data-id="${b.id_banner}">Editar</button>
                        <button class="panel-delete-banner flex-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition font-medium"
                                data-id="${b.id_banner}" data-titulo="${escHtml(b.titulo || '')}">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');

        // Edit button listeners
        grid.querySelectorAll('.panel-edit-banner').forEach(btn => {
            btn.addEventListener('click', () => openPanelBannerModal(parseInt(btn.dataset.id)));
        });

        // Delete button listeners
        grid.querySelectorAll('.panel-delete-banner').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                const titulo = btn.dataset.titulo;
                const ok = await showConfirmDialog('Eliminar banner', `¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`, 'Eliminar', 'Cancelar');
                if (!ok) return;
                try {
                    const r = await fetch(`${API_BASE}/admin/banners/${id}`, { method: 'DELETE', credentials: 'include' });
                    const d = await r.json();
                    if (r.ok && d.success) { showNotification('Banner eliminado', 'success'); panelLoadBanners(); }
                    else showNotification(d.message || 'Error', 'error');
                } catch (e) { showNotification('Error de conexión', 'error'); }
            });
        });

        // Toggle activo listeners
        grid.querySelectorAll('.banner-activo-toggle').forEach(toggle => {
            toggle.addEventListener('change', async () => {
                const id = toggle.dataset.id;
                const newValue = toggle.checked;
                const card = toggle.closest('[data-banner-id]');
                try {
                    const r = await fetch(`${API_BASE}/admin/banners/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ activo: newValue })
                    });
                    const d = await r.json();
                    if (r.ok && d.success) {
                        // Update badge text and color without full reload
                        const badge = card.querySelector('.banner-activo-badge');
                        const track = toggle.nextElementSibling;
                        const thumb = track.nextElementSibling;
                        if (badge) {
                            badge.textContent = newValue ? 'Activo' : 'Inactivo';
                            badge.className = `banner-activo-badge px-2 py-0.5 text-xs rounded-full font-medium ${newValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
                        }
                        if (track) track.className = `w-10 h-5 rounded-full transition-colors ${newValue ? 'bg-green-500' : 'bg-gray-300'}`;
                        if (thumb) thumb.className = `absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newValue ? 'translate-x-5' : 'translate-x-0'}`;
                        showNotification(`Banner ${newValue ? 'activado' : 'desactivado'}`, 'success');
                    } else {
                        // Revert toggle
                        toggle.checked = !newValue;
                        showNotification(d.message || 'Error al actualizar', 'error');
                    }
                } catch (e) {
                    toggle.checked = !newValue;
                    showNotification('Error de conexión', 'error');
                }
            });
        });

        // Orden input blur listeners (save on blur)
        grid.querySelectorAll('.banner-orden-input').forEach(input => {
            input.addEventListener('blur', async () => {
                const id = input.dataset.id;
                const newOrden = parseInt(input.value);
                const original = parseInt(input.dataset.original);
                if (isNaN(newOrden) || newOrden === original) return;
                try {
                    const r = await fetch(`${API_BASE}/admin/banners/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orden: newOrden })
                    });
                    const d = await r.json();
                    if (r.ok && d.success) {
                        input.dataset.original = newOrden;
                        showNotification('Orden guardado', 'success');
                    } else {
                        input.value = original;
                        showNotification(d.message || 'Error al guardar orden', 'error');
                    }
                } catch (e) {
                    input.value = original;
                    showNotification('Error de conexión', 'error');
                }
            });
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
                if (e.key === 'Escape') { input.value = input.dataset.original; input.blur(); }
            });
        });
    }

    // --------------------------------------------------------
    // Banner CRUD Modal (for admin panel)
    // --------------------------------------------------------
    function ensurePanelBannerModal() {
        if (document.getElementById('panel-banner-crud-modal')) return;

        const html = `
        <div id="panel-banner-crud-modal" class="hidden fixed inset-0 items-center justify-center p-4"
             style="display:none; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:9999;">
            <div id="panel-banner-crud-modal-content" class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style="z-index:10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index:10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="panel-banner-modal-title">Nuevo Banner</h3>
                    <button id="close-panel-banner-modal-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="panel-banner-crud-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="panel-banner-crud-id">

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <!-- Título -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Título <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-banner-titulo" required placeholder="Ej: Ofertas de Temporada"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Subtítulo -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Subtítulo</label>
                            <input type="text" id="panel-banner-subtitulo" placeholder="Ej: Hasta 50% de descuento"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Descripción -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                            <textarea id="panel-banner-descripcion" rows="3" placeholder="Descripción del banner..."
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418] resize-none"></textarea>
                        </div>

                        <!-- Enlace URL -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de Enlace</label>
                            <input type="text" id="panel-banner-enlace-url" placeholder="Ej: /pages/productos.html?categoria=electro"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Texto Botón -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Texto Botón</label>
                            <input type="text" id="panel-banner-texto-boton" placeholder="Ej: Ver Ofertas"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Posición -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Posición</label>
                            <select id="panel-banner-posicion"
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418] appearance-none bg-white">
                                <option value="hero">Hero (Principal)</option>
                                <option value="sidebar">Sidebar</option>
                                <option value="footer">Footer</option>
                                <option value="popup">Popup</option>
                            </select>
                        </div>

                        <!-- Orden -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                            <input type="number" id="panel-banner-orden" min="0" value="0"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Fecha Inicio -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                            <input type="datetime-local" id="panel-banner-fecha-inicio"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Fecha Fin -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                            <input type="datetime-local" id="panel-banner-fecha-fin"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] focus:border-[#FE2418]">
                        </div>

                        <!-- Activo -->
                        <div class="md:col-span-2 flex items-center gap-3 pt-1">
                            <input type="checkbox" id="panel-banner-activo" checked
                                   class="w-5 h-5 text-[#FE2418] border-gray-300 rounded focus:ring-[#FE2418] cursor-pointer">
                            <label for="panel-banner-activo" class="text-sm font-medium text-gray-700 cursor-pointer">Activo</label>
                        </div>

                        <!-- Imagen -->
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                            <div class="flex items-center gap-3 mb-3">
                                <input type="file" id="panel-banner-image-file" accept="image/*" class="hidden">
                                <button type="button" id="panel-banner-select-img-btn"
                                        class="px-4 py-2 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-gray-700">
                                    Seleccionar imagen...
                                </button>
                                <span id="panel-banner-upload-status" class="text-xs text-gray-500"></span>
                            </div>
                            <!-- Preview -->
                            <div id="panel-banner-img-preview" class="hidden">
                                <img id="panel-banner-img-preview-img" src="" alt="Preview"
                                     class="w-full max-h-48 object-cover rounded-xl border border-gray-200">
                            </div>
                            <!-- Hidden field for resolved imagen_url -->
                            <input type="hidden" id="panel-banner-imagen-url">
                            <p class="mt-2 text-xs text-gray-500">Formatos: JPEG, PNG, GIF, WEBP. Máx 5MB.</p>
                        </div>
                    </div>

                    <div class="mt-8 flex gap-3 pt-6 border-t border-gray-200">
                        <button type="submit" id="panel-banner-submit-btn"
                                class="flex-1 bg-[#FE2418] text-white px-6 py-3 rounded-xl hover:bg-[#d91b10] transition font-medium shadow-md">
                            Guardar Banner
                        </button>
                        <button type="button" id="cancel-panel-banner-modal-btn"
                                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        const modal = document.getElementById('panel-banner-crud-modal');
        const content = document.getElementById('panel-banner-crud-modal-content');

        // Prevent click propagation inside content
        content.addEventListener('click', e => e.stopPropagation());

        // Close on backdrop click
        modal.addEventListener('click', e => { if (e.target === modal) closePanelBannerModal(); });

        // Close button
        document.getElementById('close-panel-banner-modal-btn').addEventListener('click', closePanelBannerModal);
        document.getElementById('cancel-panel-banner-modal-btn').addEventListener('click', closePanelBannerModal);

        // File picker
        const fileInput = document.getElementById('panel-banner-image-file');
        document.getElementById('panel-banner-select-img-btn').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handlePanelBannerFileSelect);

        // Form submit
        document.getElementById('panel-banner-crud-form').addEventListener('submit', savePanelBanner);

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) closePanelBannerModal();
        });

        if (window.lucide) lucide.createIcons();
    }

    async function openPanelBannerModal(bannerId = null) {
        ensurePanelBannerModal();

        const modal = document.getElementById('panel-banner-crud-modal');
        const title = document.getElementById('panel-banner-modal-title');
        const form = document.getElementById('panel-banner-crud-form');

        // Reset form
        form.reset();
        document.getElementById('panel-banner-crud-id').value = '';
        document.getElementById('panel-banner-imagen-url').value = '';
        document.getElementById('panel-banner-activo').checked = true;
        document.getElementById('panel-banner-orden').value = '0';

        const preview = document.getElementById('panel-banner-img-preview');
        const previewImg = document.getElementById('panel-banner-img-preview-img');
        preview.classList.add('hidden');
        previewImg.src = '';

        const statusEl = document.getElementById('panel-banner-upload-status');
        statusEl.textContent = '';

        if (bannerId) {
            title.textContent = 'Editar Banner';
            document.getElementById('panel-banner-crud-id').value = bannerId;

            // Load banner data
            try {
                const r = await fetch(`${API_BASE}/admin/banners/${bannerId}`, { credentials: 'include' });
                const d = await r.json();
                if (r.ok && d.success && d.data) {
                    const b = d.data;
                    document.getElementById('panel-banner-titulo').value = b.titulo || '';
                    document.getElementById('panel-banner-subtitulo').value = b.subtitulo || '';
                    document.getElementById('panel-banner-descripcion').value = b.descripcion || '';
                    document.getElementById('panel-banner-enlace-url').value = b.enlace_url || '';
                    document.getElementById('panel-banner-texto-boton').value = b.texto_boton || '';
                    document.getElementById('panel-banner-posicion').value = b.posicion || 'hero';
                    document.getElementById('panel-banner-orden').value = b.orden != null ? b.orden : 0;
                    document.getElementById('panel-banner-activo').checked = b.activo !== false;
                    document.getElementById('panel-banner-imagen-url').value = b.imagen_url || '';

                    // Format datetime-local
                    if (b.fecha_inicio) {
                        const fi = new Date(b.fecha_inicio);
                        document.getElementById('panel-banner-fecha-inicio').value = fi.toISOString().slice(0, 16);
                    }
                    if (b.fecha_fin) {
                        const ff = new Date(b.fecha_fin);
                        document.getElementById('panel-banner-fecha-fin').value = ff.toISOString().slice(0, 16);
                    }

                    // Show existing image preview
                    if (b.imagen_url) {
                        previewImg.src = b.imagen_url;
                        preview.classList.remove('hidden');
                    }
                }
            } catch (err) {
                console.error('Error cargando banner:', err);
                showNotification('Error al cargar datos del banner', 'error');
            }
        } else {
            title.textContent = 'Nuevo Banner';
        }

        modal.classList.remove('hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closePanelBannerModal() {
        const modal = document.getElementById('panel-banner-crud-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            document.body.style.overflow = '';
        }
    }

    async function handlePanelBannerFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const statusEl = document.getElementById('panel-banner-upload-status');
        const preview = document.getElementById('panel-banner-img-preview');
        const previewImg = document.getElementById('panel-banner-img-preview-img');

        // Show local preview immediately
        const localUrl = URL.createObjectURL(file);
        previewImg.src = localUrl;
        preview.classList.remove('hidden');

        statusEl.textContent = 'Subiendo imagen...';
        statusEl.className = 'text-xs text-[#00458E]';

        try {
            // Optimize if > 1MB
            let fileToUpload = file;
            if (file.size > 1024 * 1024) {
                try {
                    const blob = await optimizeImage(file, 1920, 0.85);
                    fileToUpload = new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() });
                } catch (e) {
                    console.warn('Image optimization failed, using original:', e);
                }
            }

            const formData = new FormData();
            formData.append('image', fileToUpload);

            const r = await fetch(`${API_BASE}/admin/banners/images/upload`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });
            const d = await r.json();

            if (r.ok && d.success) {
                document.getElementById('panel-banner-imagen-url').value = d.data.url;
                previewImg.src = d.data.url;
                statusEl.textContent = 'Imagen subida correctamente';
                statusEl.className = 'text-xs text-green-600';
            } else {
                statusEl.textContent = 'Error: ' + (d.message || 'No se pudo subir');
                statusEl.className = 'text-xs text-red-600';
                document.getElementById('panel-banner-imagen-url').value = '';
            }
        } catch (err) {
            console.error('Error uploading banner image:', err);
            statusEl.textContent = 'Error al subir imagen';
            statusEl.className = 'text-xs text-red-600';
        } finally {
            event.target.value = '';
        }
    }

    async function savePanelBanner(event) {
        event.preventDefault();

        const id = document.getElementById('panel-banner-crud-id').value;
        const imagenUrl = document.getElementById('panel-banner-imagen-url').value;
        const titulo = document.getElementById('panel-banner-titulo').value.trim();

        if (!titulo) {
            showNotification('El título es requerido', 'error');
            return;
        }

        if (!imagenUrl) {
            showNotification('Debes seleccionar una imagen para el banner', 'error');
            return;
        }

        const fechaInicioVal = document.getElementById('panel-banner-fecha-inicio').value;
        const fechaFinVal = document.getElementById('panel-banner-fecha-fin').value;

        const bannerData = {
            titulo: titulo,
            subtitulo: document.getElementById('panel-banner-subtitulo').value.trim() || null,
            descripcion: document.getElementById('panel-banner-descripcion').value.trim() || null,
            imagen_url: imagenUrl,
            enlace_url: document.getElementById('panel-banner-enlace-url').value.trim() || null,
            texto_boton: document.getElementById('panel-banner-texto-boton').value.trim() || null,
            posicion: document.getElementById('panel-banner-posicion').value,
            orden: parseInt(document.getElementById('panel-banner-orden').value) || 0,
            activo: document.getElementById('panel-banner-activo').checked,
            fecha_inicio: fechaInicioVal ? new Date(fechaInicioVal).toISOString() : null,
            fecha_fin: fechaFinVal ? new Date(fechaFinVal).toISOString() : null
        };

        const submitBtn = document.getElementById('panel-banner-submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Guardando...';

        try {
            const url = id ? `${API_BASE}/admin/banners/${id}` : `${API_BASE}/admin/banners`;
            const method = id ? 'PUT' : 'POST';

            const r = await fetch(url, {
                method,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bannerData)
            });
            const d = await r.json();

            if (r.ok && d.success) {
                showNotification(id ? 'Banner actualizado exitosamente' : 'Banner creado exitosamente', 'success');
                closePanelBannerModal();
                panelLoadBanners();
            } else {
                showNotification(d.message || 'Error al guardar banner', 'error');
            }
        } catch (err) {
            console.error('Error guardando banner:', err);
            showNotification('Error al guardar banner', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async function panelLoadFeaturedProducts() {
        const grid = document.getElementById('featured-products-grid');
        if (!grid) return;
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">Cargando...</div>';
        try {
            const response = await fetch(`${API_BASE}/productos/admin/all?destacado=true&limit=50`, { credentials: 'include' });
            const data = await response.json();
            if (data.success) {
                const products = data.data || [];
                if (products.length === 0) {
                    grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No hay productos destacados.</div>';
                    return;
                }
                grid.innerHTML = products.map(p => `
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                        <img src="${p.imagen || '/assets/img/no-image.svg'}" alt="${escHtml(p.nombre)}" class="w-full h-32 object-cover rounded mb-2"
                             onerror="this.src='/assets/img/no-image.svg'">
                        <h3 class="font-semibold text-gray-800 mb-1 text-sm truncate">${escHtml(p.nombre)}</h3>
                        <p class="text-sm text-gray-600 mb-2">$${parseFloat(p.precio_actual).toLocaleString('es-CO')}</p>
                        <button class="panel-toggle-featured w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
                                data-id="${p.id_producto}">Quitar de Destacados</button>
                    </div>
                `).join('');

                grid.querySelectorAll('.panel-toggle-featured').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        try {
                            const r = await fetch(`${API_BASE}/productos/${btn.dataset.id}`, {
                                method: 'PUT',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ destacado: false })
                            });
                            const d = await r.json();
                            if (r.ok && d.success) { showNotification('Producto actualizado', 'success'); panelLoadFeaturedProducts(); }
                            else showNotification(d.message || 'Error', 'error');
                        } catch (e) { showNotification('Error', 'error'); }
                    });
                });
            }
        } catch (err) {
            console.error('Error cargando destacados:', err);
            grid.innerHTML = '<div class="col-span-full text-red-500 py-8">Error al cargar</div>';
        }
    }

    async function panelLoadBackups() {
        const list = document.getElementById('backups-list');
        if (!list) return;
        list.innerHTML = '<div class="text-center text-gray-500 py-4">Cargando backups...</div>';
        try {
            const response = await fetch(`${API_BASE}/admin/backups`, { credentials: 'include' });
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                list.innerHTML = data.data.map(b => `
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
                        <div>
                            <h4 class="font-semibold text-gray-800">${b.filename}</h4>
                            <p class="text-sm text-gray-600">${b.size} - ${new Date(b.created).toLocaleString()}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                list.innerHTML = '<div class="text-center text-gray-500 py-8">No hay backups disponibles</div>';
            }
        } catch (err) {
            list.innerHTML = '<div class="text-center text-red-500 py-4">Error al cargar backups</div>';
        }

        // Botón generar backup
        const genBtn = document.querySelector('button[onclick="generateBackup()"]');
        if (genBtn && !genBtn.dataset.panelListenerAttached) {
            genBtn.removeAttribute('onclick');
            genBtn.addEventListener('click', async () => {
                if (!confirm('¿Generar backup ahora?')) return;
                try {
                    const r = await fetch(`${API_BASE}/admin/backup`, { method: 'POST', credentials: 'include' });
                    const d = await r.json();
                    if (r.ok && d.success) { showNotification('Backup generado', 'success'); panelLoadBackups(); }
                    else showNotification(d.message || 'Error', 'error');
                } catch (e) { showNotification('Error', 'error'); }
            });
            genBtn.dataset.panelListenerAttached = 'true';
        }
    }

    // --------------------------------------------------------
    // Dashboard with KPIs
    // --------------------------------------------------------
    async function panelLoadDashboard() {
        const container = document.getElementById('dashboard-container');
        if (!container) return;
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Cargando dashboard...</div>';

        try {
            const response = await fetch('/api/v1/admin/stats', { credentials: 'include' });
            if (response.status === 401 || response.status === 403) {
                window.location.href = '/pages/login.html?redirect=admin';
                return;
            }
            const data = await response.json();
            if (!data.success) {
                container.innerHTML = `<div class="text-center text-red-500 py-12">Error al cargar estadísticas: ${data.message || ''}</div>`;
                return;
            }

            const s = data.data;
            const fmt = n => (n || 0).toLocaleString('es-CO');

            container.innerHTML = `
                <!-- 4 Metric Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

                    <!-- Productos activos -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-[#FE2418]">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 mb-1">Productos Activos</p>
                                <p class="text-3xl font-bold text-gray-900">${fmt(s.productos.activos)}</p>
                                <p class="text-xs text-gray-400 mt-1">de ${fmt(s.productos.total)} total</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 10V7"></path>
                                </svg>
                            </div>
                        </div>
                        ${s.productos.sin_stock > 0 ? `<p class="mt-3 text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-1.5">⚠ ${s.productos.sin_stock} sin stock · ${s.productos.stock_bajo_5} stock bajo</p>` : `<p class="mt-3 text-xs font-medium text-green-600 bg-green-50 rounded-lg px-3 py-1.5">✓ Sin alertas de stock</p>`}
                    </div>

                    <!-- Pedidos pendientes -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-[#00458E]">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 mb-1">Pedidos Pendientes</p>
                                <p class="text-3xl font-bold text-gray-900">${fmt(s.pedidos.pendientes)}</p>
                                <p class="text-xs text-gray-400 mt-1">${fmt(s.pedidos.mes)} este mes</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-[#00458E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">Hoy: ${fmt(s.pedidos.hoy)} · Semana: ${fmt(s.pedidos.semana)}</p>
                    </div>

                    <!-- Banners activos -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-[#091C49]">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 mb-1">Banners Activos</p>
                                <p class="text-3xl font-bold text-gray-900">${fmt(s.banners.activos)}</p>
                                <p class="text-xs text-gray-400 mt-1">de ${fmt(s.banners.total)} total</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-[#091C49]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        </div>
                        <p class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">${s.banners.total - s.banners.activos} inactivos</p>
                    </div>

                    <!-- Usuarios totales -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 border-l-4 border-l-[#FFD23F]">
                        <div class="flex items-start justify-between">
                            <div>
                                <p class="text-sm font-medium text-gray-500 mb-1">Usuarios Totales</p>
                                <p class="text-3xl font-bold text-gray-900">${fmt(s.usuarios.total)}</p>
                                <p class="text-xs text-gray-400 mt-1">${fmt(s.usuarios.admins)} admins</p>
                            </div>
                            <div class="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                                <svg class="w-6 h-6 text-[#FFD23F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                            </div>
                        </div>
                        ${s.usuarios.nuevos_semana > 0 ? `<p class="mt-3 text-xs font-medium text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">+${fmt(s.usuarios.nuevos_semana)} nuevos esta semana</p>` : `<p class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">Sin nuevos registros esta semana</p>`}
                    </div>
                </div>

                <!-- 2 Lists -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

                    <!-- Productos sin stock / stock bajo -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            Productos sin stock / stock bajo
                        </h3>
                        ${s.productos_sin_stock && s.productos_sin_stock.length > 0 ? `
                        <div class="space-y-3">
                            ${s.productos_sin_stock.map(p => `
                            <div class="flex items-center gap-3">
                                <img src="${p.imagen || '/assets/img/no-image.svg'}" alt="${escHtml(p.nombre)}"
                                     class="w-12 h-12 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                     onerror="this.src='/assets/img/no-image.svg'">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate" title="${escHtml(p.nombre)}">${escHtml(p.nombre)}</p>
                                    <p class="text-xs text-gray-400 font-mono">${escHtml(p.sku || '-')}</p>
                                </div>
                                <span class="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}">
                                    Stock: ${p.stock}
                                </span>
                            </div>
                            `).join('')}
                        </div>` : `<p class="text-sm text-gray-400 text-center py-6">No hay productos con stock crítico</p>`}
                    </div>

                    <!-- Pedidos pendientes -->
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-[#00458E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                            </svg>
                            Pedidos pendientes recientes
                        </h3>
                        ${s.ultimos_pedidos_pendientes && s.ultimos_pedidos_pendientes.length > 0 ? `
                        <div class="space-y-3">
                            ${s.ultimos_pedidos_pendientes.map(p => `
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <svg class="w-5 h-5 text-[#00458E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900">${escHtml(p.numero_pedido || '#' + p.id_pedido)}</p>
                                    <p class="text-xs text-gray-400">${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString('es-CO') : '-'}</p>
                                </div>
                                <div class="flex-shrink-0 text-right">
                                    <p class="text-sm font-semibold text-gray-900">$${parseFloat(p.total || 0).toLocaleString('es-CO')}</p>
                                    <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">${p.estado}</span>
                                </div>
                            </div>
                            `).join('')}
                        </div>` : `<p class="text-sm text-gray-400 text-center py-6">No hay pedidos pendientes</p>`}
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-base font-semibold text-gray-800 mb-4">Acceso rápido</h3>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <button onclick="window.panelSwitchTab('categorias')"
                                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#FE2418] hover:bg-red-50 transition group">
                            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                            </svg>
                            <span class="text-sm font-medium text-gray-700 group-hover:text-[#FE2418]">Categorías</span>
                            <span class="text-lg font-bold text-gray-900">${fmt(s.categorias)}</span>
                        </button>
                        <button onclick="window.panelSwitchTab('marcas')"
                                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#FE2418] hover:bg-red-50 transition group">
                            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                            </svg>
                            <span class="text-sm font-medium text-gray-700 group-hover:text-[#FE2418]">Marcas</span>
                            <span class="text-lg font-bold text-gray-900">${fmt(s.marcas)}</span>
                        </button>
                        <button onclick="window.panelSwitchTab('sedes')"
                                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#FE2418] hover:bg-red-50 transition group">
                            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span class="text-sm font-medium text-gray-700 group-hover:text-[#FE2418]">Sedes</span>
                            <span class="text-lg font-bold text-gray-900">${fmt(s.sedes)}</span>
                        </button>
                        <button onclick="window.panelSwitchTab('asesores')"
                                class="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-[#FE2418] hover:bg-red-50 transition group">
                            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#FE2418]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                            <span class="text-sm font-medium text-gray-700 group-hover:text-[#FE2418]">Asesores</span>
                            <span class="text-lg font-bold text-gray-900">—</span>
                        </button>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Error cargando dashboard:', err);
            container.innerHTML = '<div class="text-center text-red-500 py-12">Error al cargar el dashboard. Verifica la conexión.</div>';
        }
    }

    // --------------------------------------------------------
    // Override saveProductFromModal para refrescar tabla en admin.html
    // --------------------------------------------------------
    function overrideSaveProduct() {
        const origSave = window.saveProductFromModal;
        window.saveProductFromModal = async function (event) {
            if (event) event.preventDefault();

            const id = document.getElementById('product-crud-id')?.value;
            const fileInput = document.getElementById('product-crud-image-upload');
            const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

            // Recoger datos del formulario
            const productData = {
                nombre: document.getElementById('product-crud-nombre')?.value,
                sku: document.getElementById('product-crud-sku')?.value,
                precio_actual: parseFloat(document.getElementById('product-crud-precio')?.value),
                precio_anterior: document.getElementById('product-crud-precio-anterior')?.value
                    ? parseFloat(document.getElementById('product-crud-precio-anterior').value)
                    : null,
                stock: parseInt(document.getElementById('product-crud-stock')?.value),
                id_categoria: parseInt(document.getElementById('product-crud-categoria')?.value),
                id_marca: parseInt(document.getElementById('product-crud-marca')?.value),
                badge: document.getElementById('product-crud-badge')?.value || null,
                descripcion_corta: document.getElementById('product-crud-descripcion-corta')?.value || null,
                descripcion_larga: document.getElementById('product-crud-descripcion-larga')?.value || null,
                destacado: document.getElementById('product-crud-destacado')?.checked || false,
                activo: document.getElementById('product-crud-activo')?.checked !== false
            };

            // Si hay URLs en el textarea, incluirlas
            const imagenesText = document.getElementById('product-crud-imagenes')?.value;
            if (imagenesText && imagenesText.trim()) {
                const imagenes = imagenesText.split(/[,\n]/).map(u => u.trim()).filter(Boolean);
                if (imagenes.length > 0) productData.imagenes = imagenes;
            }

            const submitBtn = event?.target?.querySelector('button[type="submit"]')
                || document.querySelector('#product-crud-form button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Guardando...'; }

            try {
                const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
                const method = id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showNotification(data.message || 'Error al guardar producto', 'error');
                    return;
                }

                const savedId = id || data.data?.id_producto;

                // Si hay archivo de imagen, subirlo ahora
                if (hasFile && savedId) {
                    if (submitBtn) submitBtn.textContent = 'Subiendo imagen...';
                    const formData = new FormData();
                    formData.append('imagen', fileInput.files[0]);

                    try {
                        const uploadResp = await fetch(`${API_BASE}/admin/upload/producto/${savedId}`, {
                            method: 'POST',
                            credentials: 'include',
                            body: formData
                        });
                        const uploadData = await uploadResp.json();
                        if (!uploadResp.ok || !uploadData.success) {
                            console.warn('Error subiendo imagen:', uploadData.message);
                            showNotification('Producto guardado pero hubo un error al subir la imagen', 'error');
                        }
                    } catch (uploadErr) {
                        console.error('Error subiendo imagen de producto:', uploadErr);
                    }
                }

                showNotification(id ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
                closeProductModal();
                panelLoadProducts(adminPanel.currentPage);

            } catch (err) {
                console.error('Error guardando producto:', err);
                showNotification('Error al guardar producto', 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
            }
        };
    }

    // --------------------------------------------------------
    // Error helper
    // --------------------------------------------------------
    function showAdminPanelError(msg) {
        const tbody = document.getElementById('products-table-body');
        if (tbody) tbody.innerHTML = `<tr><td colspan="12" class="px-6 py-4 text-center text-red-500">${msg}</td></tr>`;
    }

    // --------------------------------------------------------
    // Iniciar cuando el DOM esté listo
    // --------------------------------------------------------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdminPanel);
    } else {
        initAdminPanel();
    }

    // ============================================================
    // TAB: CATEGORÍAS
    // ============================================================
    const categoriaState = { currentPage: 1, searchTimeout: null };

    async function panelLoadCategorias(page = 1) {
        categoriaState.currentPage = page;
        const tbody = document.getElementById('categorias-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>';

        const params = new URLSearchParams({ page, limit: 25 });
        const q = document.getElementById('categoria-search')?.value?.trim();
        if (q) params.set('q', q);

        try {
            const r = await fetch(`${API_BASE}/categorias/admin/all?${params}`, { credentials: 'include' });
            if (r.status === 401 || r.status === 403) { window.location.href = '/pages/login.html?redirect=admin'; return; }
            const data = await r.json();
            if (data.success) {
                panelRenderCategoriasTable(data.data || []);
                panelRenderSimplePagination(data.pagination, 'categorias-pagination', panelLoadCategorias);
            } else {
                if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error: ${data.message}</td></tr>`;
            }
        } catch (err) {
            console.error('Error cargando categorias admin:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error de conexión</td></tr>';
        }
    }

    function panelRenderCategoriasTable(rows) {
        const tbody = document.getElementById('categorias-table-body');
        if (!tbody) return;
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No se encontraron categorías</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(c => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${c.id_categoria}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${c.nombre}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">${c.slug || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${c.orden != null ? c.orden : '-'}</td>
                <td class="px-4 py-3">
                    ${c.activo
                        ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Activo</span>'
                        : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactivo</span>'}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="cat-edit-btn text-[#FE2418] hover:text-[#091C49] mr-3 font-medium" data-id="${c.id_categoria}">Editar</button>
                    <button class="cat-del-btn text-red-600 hover:text-red-900 font-medium" data-id="${c.id_categoria}" data-name="${(c.nombre || '').replace(/"/g, '&quot;')}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.cat-edit-btn').forEach(btn =>
            btn.addEventListener('click', () => panelOpenCategoriaModal(parseInt(btn.dataset.id))));
        tbody.querySelectorAll('.cat-del-btn').forEach(btn =>
            btn.addEventListener('click', () => panelDeleteCategoria(parseInt(btn.dataset.id), btn.dataset.name)));
    }

    function ensurePanelCategoriaModal() {
        if (document.getElementById('panel-categoria-modal')) return;
        document.body.insertAdjacentHTML('beforeend', `
        <div id="panel-categoria-modal" class="hidden fixed inset-0 items-center justify-center p-4"
             style="display:none; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:9999;">
            <div id="panel-categoria-modal-content" class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style="z-index:10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index:10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="panel-categoria-modal-title">Nueva Categoría</h3>
                    <button id="close-panel-categoria-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="panel-categoria-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="panel-categoria-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-categoria-nombre" required placeholder="Ej: Electro Hogar"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Slug <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-categoria-slug" required placeholder="electro-hogar"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Icono (Lucide)</label>
                            <input type="text" id="panel-categoria-icono" placeholder="tv, sofa, bike..."
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                            <textarea id="panel-categoria-descripcion" rows="3"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] resize-none"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de Imagen</label>
                            <input type="text" id="panel-categoria-imagen-url"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                            <input type="number" id="panel-categoria-orden" min="0" value="0"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2 flex items-center gap-3">
                            <input type="checkbox" id="panel-categoria-activo" checked class="w-5 h-5 rounded">
                            <label for="panel-categoria-activo" class="text-sm font-medium text-gray-700">Activo</label>
                        </div>
                    </div>
                    <div class="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                        <button type="submit" id="panel-categoria-submit-btn"
                                class="flex-1 bg-[#FE2418] text-white px-6 py-3 rounded-xl hover:bg-[#d91b10] transition font-medium">
                            Guardar Categoría
                        </button>
                        <button type="button" id="cancel-panel-categoria-btn"
                                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>`);

        const modal = document.getElementById('panel-categoria-modal');
        const content = document.getElementById('panel-categoria-modal-content');
        content.addEventListener('click', e => e.stopPropagation());
        modal.addEventListener('click', e => { if (e.target === modal) closePanelCategoriaModal(); });
        document.getElementById('close-panel-categoria-btn').addEventListener('click', closePanelCategoriaModal);
        document.getElementById('cancel-panel-categoria-btn').addEventListener('click', closePanelCategoriaModal);
        document.getElementById('panel-categoria-nombre').addEventListener('input', e => {
            const slug = document.getElementById('panel-categoria-slug');
            if (!slug.dataset.manual) {
                slug.value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            }
        });
        document.getElementById('panel-categoria-slug').addEventListener('input', e => {
            e.target.dataset.manual = 'true';
        });
        document.getElementById('panel-categoria-form').addEventListener('submit', panelSaveCategoria);
        if (window.lucide) lucide.createIcons();
    }

    async function panelOpenCategoriaModal(id = null) {
        ensurePanelCategoriaModal();
        const modal = document.getElementById('panel-categoria-modal');
        const form = document.getElementById('panel-categoria-form');
        form.reset();
        document.getElementById('panel-categoria-id').value = '';
        document.getElementById('panel-categoria-activo').checked = true;
        document.getElementById('panel-categoria-orden').value = '0';
        delete document.getElementById('panel-categoria-slug').dataset.manual;

        if (id) {
            document.getElementById('panel-categoria-modal-title').textContent = 'Editar Categoría';
            document.getElementById('panel-categoria-id').value = id;
            try {
                const r = await fetch(`${API_BASE}/categorias/admin/${id}`, { credentials: 'include' });
                const d = await r.json();
                if (r.ok && d.success && d.data) {
                    const c = d.data;
                    document.getElementById('panel-categoria-nombre').value = c.nombre || '';
                    document.getElementById('panel-categoria-slug').value = c.slug || '';
                    document.getElementById('panel-categoria-slug').dataset.manual = 'true';
                    document.getElementById('panel-categoria-descripcion').value = c.descripcion || '';
                    document.getElementById('panel-categoria-imagen-url').value = c.imagen_url || '';
                    document.getElementById('panel-categoria-icono').value = c.icono || '';
                    document.getElementById('panel-categoria-orden').value = c.orden != null ? c.orden : 0;
                    document.getElementById('panel-categoria-activo').checked = c.activo !== false;
                }
            } catch (err) { showNotification('Error al cargar categoría', 'error'); }
        } else {
            document.getElementById('panel-categoria-modal-title').textContent = 'Nueva Categoría';
        }

        modal.classList.remove('hidden'); modal.style.display = 'flex'; modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closePanelCategoriaModal() {
        const modal = document.getElementById('panel-categoria-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; modal.style.visibility = 'hidden'; document.body.style.overflow = ''; }
    }

    async function panelSaveCategoria(event) {
        event.preventDefault();
        const id = document.getElementById('panel-categoria-id').value;
        const body = {
            nombre: document.getElementById('panel-categoria-nombre').value.trim(),
            slug: document.getElementById('panel-categoria-slug').value.trim(),
            descripcion: document.getElementById('panel-categoria-descripcion').value.trim() || null,
            imagen_url: document.getElementById('panel-categoria-imagen-url').value.trim() || null,
            icono: document.getElementById('panel-categoria-icono').value.trim() || null,
            orden: parseInt(document.getElementById('panel-categoria-orden').value) || 0,
            activo: document.getElementById('panel-categoria-activo').checked
        };
        const btn = document.getElementById('panel-categoria-submit-btn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Guardando...';
        try {
            const url = id ? `${API_BASE}/categorias/admin/${id}` : `${API_BASE}/categorias/admin`;
            const r = await fetch(url, { method: id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const d = await r.json();
            if (r.ok && d.success) {
                showNotification(id ? 'Categoría actualizada' : 'Categoría creada', 'success');
                closePanelCategoriaModal();
                panelLoadCategorias(categoriaState.currentPage);
            } else { showNotification(d.message || 'Error al guardar categoría', 'error'); }
        } catch (err) { console.error('Error guardando categoría:', err); showNotification('Error de conexión', 'error'); }
        finally { btn.disabled = false; btn.textContent = orig; }
    }

    async function panelDeleteCategoria(id, name) {
        const ok = await showConfirmDialog('Eliminar categoría', `¿Eliminar "${name}"? Si tiene productos asociados, la operación será rechazada.`, 'Eliminar', 'Cancelar');
        if (!ok) return;
        try {
            const r = await fetch(`${API_BASE}/categorias/admin/${id}`, { method: 'DELETE', credentials: 'include' });
            const d = await r.json();
            if (r.ok && d.success) { showNotification('Categoría eliminada', 'success'); panelLoadCategorias(categoriaState.currentPage); }
            else showNotification(d.message || 'Error al eliminar', 'error');
        } catch (err) { showNotification('Error de conexión', 'error'); }
    }

    // ============================================================
    // TAB: MARCAS
    // ============================================================
    const marcaState = { currentPage: 1, searchTimeout: null };

    async function panelLoadMarcas(page = 1) {
        marcaState.currentPage = page;
        const tbody = document.getElementById('marcas-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>';

        const params = new URLSearchParams({ page, limit: 25 });
        const q = document.getElementById('marca-search')?.value?.trim();
        if (q) params.set('q', q);

        try {
            const r = await fetch(`${API_BASE}/marcas/admin/all?${params}`, { credentials: 'include' });
            if (r.status === 401 || r.status === 403) { window.location.href = '/pages/login.html?redirect=admin'; return; }
            const data = await r.json();
            if (data.success) {
                panelRenderMarcasTable(data.data || []);
                panelRenderSimplePagination(data.pagination, 'marcas-pagination', panelLoadMarcas);
            } else {
                if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error: ${data.message}</td></tr>`;
            }
        } catch (err) {
            console.error('Error cargando marcas admin:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error de conexión</td></tr>';
        }
    }

    function panelRenderMarcasTable(rows) {
        const tbody = document.getElementById('marcas-table-body');
        if (!tbody) return;
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No se encontraron marcas</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(m => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${m.id_marca}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${m.nombre}</td>
                <td class="px-4 py-3 text-sm text-gray-600 font-mono">${m.slug || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${m.sitio_web ? `<a href="${m.sitio_web}" target="_blank" class="text-[#00458E] hover:underline">Ver</a>` : '-'}</td>
                <td class="px-4 py-3">
                    ${m.activo
                        ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Activo</span>'
                        : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactivo</span>'}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="marca-edit-btn text-[#FE2418] hover:text-[#091C49] mr-3 font-medium" data-id="${m.id_marca}">Editar</button>
                    <button class="marca-del-btn text-red-600 hover:text-red-900 font-medium" data-id="${m.id_marca}" data-name="${(m.nombre || '').replace(/"/g, '&quot;')}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.marca-edit-btn').forEach(btn =>
            btn.addEventListener('click', () => panelOpenMarcaModal(parseInt(btn.dataset.id))));
        tbody.querySelectorAll('.marca-del-btn').forEach(btn =>
            btn.addEventListener('click', () => panelDeleteMarca(parseInt(btn.dataset.id), btn.dataset.name)));
    }

    function ensurePanelMarcaModal() {
        if (document.getElementById('panel-marca-modal')) return;
        document.body.insertAdjacentHTML('beforeend', `
        <div id="panel-marca-modal" class="hidden fixed inset-0 items-center justify-center p-4"
             style="display:none; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:9999;">
            <div id="panel-marca-modal-content" class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style="z-index:10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index:10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="panel-marca-modal-title">Nueva Marca</h3>
                    <button id="close-panel-marca-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="panel-marca-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="panel-marca-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-marca-nombre" required placeholder="Ej: Samsung"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Slug <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-marca-slug" required placeholder="samsung"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                            <input type="text" id="panel-marca-sitio-web" placeholder="https://samsung.com"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de Logo</label>
                            <input type="text" id="panel-marca-logo-url"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                            <textarea id="panel-marca-descripcion" rows="3"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] resize-none"></textarea>
                        </div>
                        <div class="md:col-span-2 flex items-center gap-3">
                            <input type="checkbox" id="panel-marca-activo" checked class="w-5 h-5 rounded">
                            <label for="panel-marca-activo" class="text-sm font-medium text-gray-700">Activo</label>
                        </div>
                    </div>
                    <div class="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                        <button type="submit" id="panel-marca-submit-btn"
                                class="flex-1 bg-[#FE2418] text-white px-6 py-3 rounded-xl hover:bg-[#d91b10] transition font-medium">
                            Guardar Marca
                        </button>
                        <button type="button" id="cancel-panel-marca-btn"
                                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>`);

        const modal = document.getElementById('panel-marca-modal');
        const content = document.getElementById('panel-marca-modal-content');
        content.addEventListener('click', e => e.stopPropagation());
        modal.addEventListener('click', e => { if (e.target === modal) closePanelMarcaModal(); });
        document.getElementById('close-panel-marca-btn').addEventListener('click', closePanelMarcaModal);
        document.getElementById('cancel-panel-marca-btn').addEventListener('click', closePanelMarcaModal);
        document.getElementById('panel-marca-nombre').addEventListener('input', e => {
            const slug = document.getElementById('panel-marca-slug');
            if (!slug.dataset.manual) slug.value = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        });
        document.getElementById('panel-marca-slug').addEventListener('input', e => { e.target.dataset.manual = 'true'; });
        document.getElementById('panel-marca-form').addEventListener('submit', panelSaveMarca);
        if (window.lucide) lucide.createIcons();
    }

    async function panelOpenMarcaModal(id = null) {
        ensurePanelMarcaModal();
        const modal = document.getElementById('panel-marca-modal');
        const form = document.getElementById('panel-marca-form');
        form.reset();
        document.getElementById('panel-marca-id').value = '';
        document.getElementById('panel-marca-activo').checked = true;
        delete document.getElementById('panel-marca-slug').dataset.manual;

        if (id) {
            document.getElementById('panel-marca-modal-title').textContent = 'Editar Marca';
            document.getElementById('panel-marca-id').value = id;
            try {
                const r = await fetch(`${API_BASE}/marcas/admin/${id}`, { credentials: 'include' });
                const d = await r.json();
                if (r.ok && d.success && d.data) {
                    const m = d.data;
                    document.getElementById('panel-marca-nombre').value = m.nombre || '';
                    document.getElementById('panel-marca-slug').value = m.slug || '';
                    document.getElementById('panel-marca-slug').dataset.manual = 'true';
                    document.getElementById('panel-marca-logo-url').value = m.logo_url || '';
                    document.getElementById('panel-marca-descripcion').value = m.descripcion || '';
                    document.getElementById('panel-marca-sitio-web').value = m.sitio_web || '';
                    document.getElementById('panel-marca-activo').checked = m.activo !== false;
                }
            } catch (err) { showNotification('Error al cargar marca', 'error'); }
        } else {
            document.getElementById('panel-marca-modal-title').textContent = 'Nueva Marca';
        }

        modal.classList.remove('hidden'); modal.style.display = 'flex'; modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closePanelMarcaModal() {
        const modal = document.getElementById('panel-marca-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; modal.style.visibility = 'hidden'; document.body.style.overflow = ''; }
    }

    async function panelSaveMarca(event) {
        event.preventDefault();
        const id = document.getElementById('panel-marca-id').value;
        const body = {
            nombre: document.getElementById('panel-marca-nombre').value.trim(),
            slug: document.getElementById('panel-marca-slug').value.trim(),
            logo_url: document.getElementById('panel-marca-logo-url').value.trim() || null,
            descripcion: document.getElementById('panel-marca-descripcion').value.trim() || null,
            sitio_web: document.getElementById('panel-marca-sitio-web').value.trim() || null,
            activo: document.getElementById('panel-marca-activo').checked
        };
        const btn = document.getElementById('panel-marca-submit-btn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Guardando...';
        try {
            const url = id ? `${API_BASE}/marcas/admin/${id}` : `${API_BASE}/marcas/admin`;
            const r = await fetch(url, { method: id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const d = await r.json();
            if (r.ok && d.success) {
                showNotification(id ? 'Marca actualizada' : 'Marca creada', 'success');
                closePanelMarcaModal();
                panelLoadMarcas(marcaState.currentPage);
            } else { showNotification(d.message || 'Error al guardar marca', 'error'); }
        } catch (err) { console.error('Error guardando marca:', err); showNotification('Error de conexión', 'error'); }
        finally { btn.disabled = false; btn.textContent = orig; }
    }

    async function panelDeleteMarca(id, name) {
        const ok = await showConfirmDialog('Eliminar marca', `¿Eliminar "${name}"? Si tiene productos asociados, la operación será rechazada.`, 'Eliminar', 'Cancelar');
        if (!ok) return;
        try {
            const r = await fetch(`${API_BASE}/marcas/admin/${id}`, { method: 'DELETE', credentials: 'include' });
            const d = await r.json();
            if (r.ok && d.success) { showNotification('Marca eliminada', 'success'); panelLoadMarcas(marcaState.currentPage); }
            else showNotification(d.message || 'Error al eliminar', 'error');
        } catch (err) { showNotification('Error de conexión', 'error'); }
    }

    // ============================================================
    // TAB: SEDES
    // ============================================================
    const sedeState = { currentPage: 1, searchTimeout: null };

    async function panelLoadSedes(page = 1) {
        sedeState.currentPage = page;
        const tbody = document.getElementById('sedes-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>';

        const params = new URLSearchParams({ page, limit: 25 });
        const q = document.getElementById('sede-search')?.value?.trim();
        if (q) params.set('q', q);

        try {
            const r = await fetch(`${API_BASE}/sedes/admin/all?${params}`, { credentials: 'include' });
            if (r.status === 401 || r.status === 403) { window.location.href = '/pages/login.html?redirect=admin'; return; }
            const data = await r.json();
            if (data.success) {
                panelRenderSedesTable(data.data || []);
                panelRenderSimplePagination(data.pagination, 'sedes-pagination', panelLoadSedes);
            } else {
                if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error: ${data.message}</td></tr>`;
            }
        } catch (err) {
            console.error('Error cargando sedes admin:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error de conexión</td></tr>';
        }
    }

    function panelRenderSedesTable(rows) {
        const tbody = document.getElementById('sedes-table-body');
        if (!tbody) return;
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No se encontraron sedes</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(s => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${s.id_sede}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900">${s.nombre}${s.es_principal ? ' <span class="ml-1 px-1.5 py-0.5 text-xs rounded bg-yellow-100 text-yellow-800">Principal</span>' : ''}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${s.ciudad || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title="${s.direccion || ''}">${s.direccion || '-'}</td>
                <td class="px-4 py-3">
                    ${s.activo
                        ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Activo</span>'
                        : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactivo</span>'}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="sede-edit-btn text-[#FE2418] hover:text-[#091C49] mr-3 font-medium" data-id="${s.id_sede}">Editar</button>
                    <button class="sede-del-btn text-red-600 hover:text-red-900 font-medium" data-id="${s.id_sede}" data-name="${(s.nombre || '').replace(/"/g, '&quot;')}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.sede-edit-btn').forEach(btn =>
            btn.addEventListener('click', () => panelOpenSedeModal(parseInt(btn.dataset.id))));
        tbody.querySelectorAll('.sede-del-btn').forEach(btn =>
            btn.addEventListener('click', () => panelDeleteSede(parseInt(btn.dataset.id), btn.dataset.name)));
    }

    function ensurePanelSedeModal() {
        if (document.getElementById('panel-sede-modal')) return;
        document.body.insertAdjacentHTML('beforeend', `
        <div id="panel-sede-modal" class="hidden fixed inset-0 items-center justify-center p-4"
             style="display:none; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:9999;">
            <div id="panel-sede-modal-content" class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style="z-index:10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index:10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="panel-sede-modal-title">Nueva Sede</h3>
                    <button id="close-panel-sede-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="panel-sede-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="panel-sede-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-sede-nombre" required placeholder="Ej: Sede Principal Bogotá"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Ciudad <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-sede-ciudad" required placeholder="Bogotá"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                            <input type="text" id="panel-sede-departamento" placeholder="Cundinamarca"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-sede-direccion" required placeholder="Calle 80 # 45-23"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                            <input type="text" id="panel-sede-telefono"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                            <input type="text" id="panel-sede-whatsapp" placeholder="+57 300 000 0000"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Latitud</label>
                            <input type="number" step="any" id="panel-sede-latitud" placeholder="4.7110"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
                            <input type="number" step="any" id="panel-sede-longitud" placeholder="-74.0721"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                            <textarea id="panel-sede-horario" rows="3" placeholder="Lunes a Viernes 8am - 6pm"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] resize-none"></textarea>
                        </div>
                        <div class="md:col-span-2 flex items-center gap-6 pt-1">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="panel-sede-es-principal" class="w-5 h-5 rounded">
                                <span class="text-sm font-medium text-gray-700">Sede Principal</span>
                            </label>
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="panel-sede-activo" checked class="w-5 h-5 rounded">
                                <span class="text-sm font-medium text-gray-700">Activo</span>
                            </label>
                        </div>
                    </div>
                    <div class="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                        <button type="submit" id="panel-sede-submit-btn"
                                class="flex-1 bg-[#FE2418] text-white px-6 py-3 rounded-xl hover:bg-[#d91b10] transition font-medium">
                            Guardar Sede
                        </button>
                        <button type="button" id="cancel-panel-sede-btn"
                                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>`);

        const modal = document.getElementById('panel-sede-modal');
        const content = document.getElementById('panel-sede-modal-content');
        content.addEventListener('click', e => e.stopPropagation());
        modal.addEventListener('click', e => { if (e.target === modal) closePanelSedeModal(); });
        document.getElementById('close-panel-sede-btn').addEventListener('click', closePanelSedeModal);
        document.getElementById('cancel-panel-sede-btn').addEventListener('click', closePanelSedeModal);
        document.getElementById('panel-sede-form').addEventListener('submit', panelSaveSede);
        if (window.lucide) lucide.createIcons();
    }

    async function panelOpenSedeModal(id = null) {
        ensurePanelSedeModal();
        const modal = document.getElementById('panel-sede-modal');
        const form = document.getElementById('panel-sede-form');
        form.reset();
        document.getElementById('panel-sede-id').value = '';
        document.getElementById('panel-sede-activo').checked = true;
        document.getElementById('panel-sede-es-principal').checked = false;

        if (id) {
            document.getElementById('panel-sede-modal-title').textContent = 'Editar Sede';
            document.getElementById('panel-sede-id').value = id;
            try {
                const r = await fetch(`${API_BASE}/sedes/admin/${id}`, { credentials: 'include' });
                const d = await r.json();
                if (r.ok && d.success && d.data) {
                    const s = d.data;
                    document.getElementById('panel-sede-nombre').value = s.nombre || '';
                    document.getElementById('panel-sede-ciudad').value = s.ciudad || '';
                    document.getElementById('panel-sede-departamento').value = s.departamento || '';
                    document.getElementById('panel-sede-direccion').value = s.direccion || '';
                    document.getElementById('panel-sede-telefono').value = s.telefono || '';
                    document.getElementById('panel-sede-whatsapp').value = s.whatsapp || '';
                    document.getElementById('panel-sede-latitud').value = s.latitud || '';
                    document.getElementById('panel-sede-longitud').value = s.longitud || '';
                    document.getElementById('panel-sede-horario').value = s.horario_atencion || '';
                    document.getElementById('panel-sede-es-principal').checked = s.es_principal === true;
                    document.getElementById('panel-sede-activo').checked = s.activo !== false;
                }
            } catch (err) { showNotification('Error al cargar sede', 'error'); }
        } else {
            document.getElementById('panel-sede-modal-title').textContent = 'Nueva Sede';
        }

        modal.classList.remove('hidden'); modal.style.display = 'flex'; modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closePanelSedeModal() {
        const modal = document.getElementById('panel-sede-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; modal.style.visibility = 'hidden'; document.body.style.overflow = ''; }
    }

    async function panelSaveSede(event) {
        event.preventDefault();
        const id = document.getElementById('panel-sede-id').value;
        const lat = document.getElementById('panel-sede-latitud').value;
        const lng = document.getElementById('panel-sede-longitud').value;
        const body = {
            nombre: document.getElementById('panel-sede-nombre').value.trim(),
            ciudad: document.getElementById('panel-sede-ciudad').value.trim(),
            departamento: document.getElementById('panel-sede-departamento').value.trim() || null,
            direccion: document.getElementById('panel-sede-direccion').value.trim(),
            telefono: document.getElementById('panel-sede-telefono').value.trim() || null,
            whatsapp: document.getElementById('panel-sede-whatsapp').value.trim() || null,
            latitud: lat ? parseFloat(lat) : null,
            longitud: lng ? parseFloat(lng) : null,
            horario_atencion: document.getElementById('panel-sede-horario').value.trim() || null,
            es_principal: document.getElementById('panel-sede-es-principal').checked,
            activo: document.getElementById('panel-sede-activo').checked
        };
        const btn = document.getElementById('panel-sede-submit-btn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Guardando...';
        try {
            const url = id ? `${API_BASE}/sedes/admin/${id}` : `${API_BASE}/sedes/admin`;
            const r = await fetch(url, { method: id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const d = await r.json();
            if (r.ok && d.success) {
                showNotification(id ? 'Sede actualizada' : 'Sede creada', 'success');
                closePanelSedeModal();
                panelLoadSedes(sedeState.currentPage);
            } else { showNotification(d.message || 'Error al guardar sede', 'error'); }
        } catch (err) { console.error('Error guardando sede:', err); showNotification('Error de conexión', 'error'); }
        finally { btn.disabled = false; btn.textContent = orig; }
    }

    async function panelDeleteSede(id, name) {
        const ok = await showConfirmDialog('Eliminar sede', `¿Eliminar "${name}"? Esta acción no se puede deshacer.`, 'Eliminar', 'Cancelar');
        if (!ok) return;
        try {
            const r = await fetch(`${API_BASE}/sedes/admin/${id}`, { method: 'DELETE', credentials: 'include' });
            const d = await r.json();
            if (r.ok && d.success) { showNotification('Sede eliminada', 'success'); panelLoadSedes(sedeState.currentPage); }
            else showNotification(d.message || 'Error al eliminar', 'error');
        } catch (err) { showNotification('Error de conexión', 'error'); }
    }

    // ============================================================
    // TAB: ASESORES
    // ============================================================
    const asesorState = { currentPage: 1, searchTimeout: null };

    async function panelLoadAsesores(page = 1) {
        asesorState.currentPage = page;
        const tbody = document.getElementById('asesores-table-body');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-gray-500">Cargando...</td></tr>';

        const params = new URLSearchParams({ page, limit: 25 });
        const q = document.getElementById('asesor-search')?.value?.trim();
        if (q) params.set('q', q);

        try {
            const r = await fetch(`${API_BASE}/asesores/admin/all?${params}`, { credentials: 'include' });
            if (r.status === 401 || r.status === 403) { window.location.href = '/pages/login.html?redirect=admin'; return; }
            const data = await r.json();
            if (data.success) {
                panelRenderAsesoresTable(data.data || []);
                panelRenderSimplePagination(data.pagination, 'asesores-pagination', panelLoadAsesores);
            } else {
                if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error: ${data.message}</td></tr>`;
            }
        } catch (err) {
            console.error('Error cargando asesores admin:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-4 text-center text-red-500">Error de conexión</td></tr>';
        }
    }

    function panelRenderAsesoresTable(rows) {
        const tbody = document.getElementById('asesores-table-body');
        if (!tbody) return;
        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">No se encontraron asesores</td></tr>';
            return;
        }
        tbody.innerHTML = rows.map(a => `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm text-gray-900">${a.id_asesor}</td>
                <td class="px-4 py-3 text-sm font-medium text-gray-900 flex items-center gap-2">
                    ${a.foto_url ? `<img src="${a.foto_url}" alt="${a.nombre_completo}" class="w-8 h-8 rounded-full object-cover" onerror="this.style.display='none'">` : ''}
                    ${a.nombre_completo}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">${a.telefono || '-'}</td>
                <td class="px-4 py-3 text-sm text-gray-600">${a.especialidad || '-'}</td>
                <td class="px-4 py-3">
                    ${a.activo
                        ? '<span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">Activo</span>'
                        : '<span class="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">Inactivo</span>'}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <button class="asesor-edit-btn text-[#FE2418] hover:text-[#091C49] mr-3 font-medium" data-id="${a.id_asesor}">Editar</button>
                    <button class="asesor-del-btn text-red-600 hover:text-red-900 font-medium" data-id="${a.id_asesor}" data-name="${(a.nombre_completo || '').replace(/"/g, '&quot;')}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.asesor-edit-btn').forEach(btn =>
            btn.addEventListener('click', () => panelOpenAsesorModal(parseInt(btn.dataset.id))));
        tbody.querySelectorAll('.asesor-del-btn').forEach(btn =>
            btn.addEventListener('click', () => panelDeleteAsesor(parseInt(btn.dataset.id), btn.dataset.name)));
    }

    function ensurePanelAsesorModal() {
        if (document.getElementById('panel-asesor-modal')) return;
        document.body.insertAdjacentHTML('beforeend', `
        <div id="panel-asesor-modal" class="hidden fixed inset-0 items-center justify-center p-4"
             style="display:none; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:9999;">
            <div id="panel-asesor-modal-content" class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl" style="z-index:10000;">
                <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 flex justify-between items-center" style="z-index:10001;">
                    <h3 class="text-2xl font-bold text-gray-900" id="panel-asesor-modal-title">Nuevo Asesor</h3>
                    <button id="close-panel-asesor-btn" class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                <form id="panel-asesor-form" class="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <input type="hidden" id="panel-asesor-id">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Completo <span class="text-red-500">*</span></label>
                            <input type="text" id="panel-asesor-nombre" required placeholder="Ej: Juan Carlos Pérez"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono / WhatsApp</label>
                            <input type="text" id="panel-asesor-telefono" placeholder="+57 300 000 0000"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Especialidad</label>
                            <input type="text" id="panel-asesor-especialidad" placeholder="Ej: Electro Hogar"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">URL de Foto</label>
                            <input type="text" id="panel-asesor-foto-url"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Horario de Atención</label>
                            <textarea id="panel-asesor-horario" rows="2" placeholder="Lunes a Viernes 8am - 6pm"
                                      class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418] resize-none"></textarea>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
                            <input type="number" id="panel-asesor-orden" min="0" value="0"
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FE2418]">
                        </div>
                        <div class="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="panel-asesor-activo" checked class="w-5 h-5 rounded">
                            <label for="panel-asesor-activo" class="text-sm font-medium text-gray-700">Activo</label>
                        </div>
                    </div>
                    <div class="mt-6 flex gap-3 pt-4 border-t border-gray-200">
                        <button type="submit" id="panel-asesor-submit-btn"
                                class="flex-1 bg-[#FE2418] text-white px-6 py-3 rounded-xl hover:bg-[#d91b10] transition font-medium">
                            Guardar Asesor
                        </button>
                        <button type="button" id="cancel-panel-asesor-btn"
                                class="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>`);

        const modal = document.getElementById('panel-asesor-modal');
        const content = document.getElementById('panel-asesor-modal-content');
        content.addEventListener('click', e => e.stopPropagation());
        modal.addEventListener('click', e => { if (e.target === modal) closePanelAsesorModal(); });
        document.getElementById('close-panel-asesor-btn').addEventListener('click', closePanelAsesorModal);
        document.getElementById('cancel-panel-asesor-btn').addEventListener('click', closePanelAsesorModal);
        document.getElementById('panel-asesor-form').addEventListener('submit', panelSaveAsesor);
        if (window.lucide) lucide.createIcons();
    }

    async function panelOpenAsesorModal(id = null) {
        ensurePanelAsesorModal();
        const modal = document.getElementById('panel-asesor-modal');
        const form = document.getElementById('panel-asesor-form');
        form.reset();
        document.getElementById('panel-asesor-id').value = '';
        document.getElementById('panel-asesor-activo').checked = true;
        document.getElementById('panel-asesor-orden').value = '0';

        if (id) {
            document.getElementById('panel-asesor-modal-title').textContent = 'Editar Asesor';
            document.getElementById('panel-asesor-id').value = id;
            try {
                const r = await fetch(`${API_BASE}/asesores/admin/${id}`, { credentials: 'include' });
                const d = await r.json();
                if (r.ok && d.success && d.data) {
                    const a = d.data;
                    document.getElementById('panel-asesor-nombre').value = a.nombre_completo || '';
                    document.getElementById('panel-asesor-telefono').value = a.telefono || '';
                    document.getElementById('panel-asesor-foto-url').value = a.foto_url || '';
                    document.getElementById('panel-asesor-especialidad').value = a.especialidad || '';
                    document.getElementById('panel-asesor-horario').value = a.horario_atencion || '';
                    document.getElementById('panel-asesor-orden').value = a.orden != null ? a.orden : 0;
                    document.getElementById('panel-asesor-activo').checked = a.activo !== false;
                }
            } catch (err) { showNotification('Error al cargar asesor', 'error'); }
        } else {
            document.getElementById('panel-asesor-modal-title').textContent = 'Nuevo Asesor';
        }

        modal.classList.remove('hidden'); modal.style.display = 'flex'; modal.style.visibility = 'visible';
        document.body.style.overflow = 'hidden';
        if (window.lucide) lucide.createIcons();
    }

    function closePanelAsesorModal() {
        const modal = document.getElementById('panel-asesor-modal');
        if (modal) { modal.classList.add('hidden'); modal.style.display = 'none'; modal.style.visibility = 'hidden'; document.body.style.overflow = ''; }
    }

    async function panelSaveAsesor(event) {
        event.preventDefault();
        const id = document.getElementById('panel-asesor-id').value;
        const body = {
            nombre_completo: document.getElementById('panel-asesor-nombre').value.trim(),
            telefono: document.getElementById('panel-asesor-telefono').value.trim() || null,
            foto_url: document.getElementById('panel-asesor-foto-url').value.trim() || null,
            especialidad: document.getElementById('panel-asesor-especialidad').value.trim() || null,
            horario_atencion: document.getElementById('panel-asesor-horario').value.trim() || null,
            orden: parseInt(document.getElementById('panel-asesor-orden').value) || 0,
            activo: document.getElementById('panel-asesor-activo').checked
        };
        const btn = document.getElementById('panel-asesor-submit-btn');
        const orig = btn.textContent; btn.disabled = true; btn.textContent = 'Guardando...';
        try {
            const url = id ? `${API_BASE}/asesores/admin/${id}` : `${API_BASE}/asesores/admin`;
            const r = await fetch(url, { method: id ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const d = await r.json();
            if (r.ok && d.success) {
                showNotification(id ? 'Asesor actualizado' : 'Asesor creado', 'success');
                closePanelAsesorModal();
                panelLoadAsesores(asesorState.currentPage);
            } else { showNotification(d.message || 'Error al guardar asesor', 'error'); }
        } catch (err) { console.error('Error guardando asesor:', err); showNotification('Error de conexión', 'error'); }
        finally { btn.disabled = false; btn.textContent = orig; }
    }

    async function panelDeleteAsesor(id, name) {
        const ok = await showConfirmDialog('Eliminar asesor', `¿Eliminar "${name}"? Esta acción no se puede deshacer.`, 'Eliminar', 'Cancelar');
        if (!ok) return;
        try {
            const r = await fetch(`${API_BASE}/asesores/admin/${id}`, { method: 'DELETE', credentials: 'include' });
            const d = await r.json();
            if (r.ok && d.success) { showNotification('Asesor eliminado', 'success'); panelLoadAsesores(asesorState.currentPage); }
            else showNotification(d.message || 'Error al eliminar', 'error');
        } catch (err) { showNotification('Error de conexión', 'error'); }
    }

    // ============================================================
    // SHARED PAGINATION HELPER
    // ============================================================
    function panelRenderSimplePagination(pagination, containerId, callback) {
        const container = document.getElementById(containerId);
        if (!container || !pagination || pagination.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        const { page, totalPages } = pagination;
        const pages = [];
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

        container.innerHTML = `
            <button class="spg-btn px-3 py-2 border rounded text-sm ${page <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Anterior</button>
            ${pages.map(p => `<button class="spg-btn px-3 py-2 border rounded text-sm ${p === page ? 'bg-[#FE2418] text-white' : 'hover:bg-gray-50'}" data-page="${p}">${p}</button>`).join('')}
            <button class="spg-btn px-3 py-2 border rounded text-sm ${page >= totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Siguiente</button>
        `;
        container.querySelectorAll('.spg-btn:not([disabled])').forEach(btn =>
            btn.addEventListener('click', () => callback(parseInt(btn.dataset.page))));
    }

    // ============================================================
    // Wire up new tab buttons and search inputs
    // ============================================================
    function wireNewTabButtons() {
        const newCatBtn = document.getElementById('new-categoria-btn');
        if (newCatBtn && !newCatBtn.dataset.listenerAttached) {
            newCatBtn.addEventListener('click', () => panelOpenCategoriaModal());
            newCatBtn.dataset.listenerAttached = 'true';
        }
        const catSearch = document.getElementById('categoria-search');
        if (catSearch && !catSearch.dataset.listenerAttached) {
            catSearch.addEventListener('input', () => {
                clearTimeout(categoriaState.searchTimeout);
                categoriaState.searchTimeout = setTimeout(() => panelLoadCategorias(1), 400);
            });
            catSearch.dataset.listenerAttached = 'true';
        }

        const newMarcaBtn = document.getElementById('new-marca-btn');
        if (newMarcaBtn && !newMarcaBtn.dataset.listenerAttached) {
            newMarcaBtn.addEventListener('click', () => panelOpenMarcaModal());
            newMarcaBtn.dataset.listenerAttached = 'true';
        }
        const marcaSearch = document.getElementById('marca-search');
        if (marcaSearch && !marcaSearch.dataset.listenerAttached) {
            marcaSearch.addEventListener('input', () => {
                clearTimeout(marcaState.searchTimeout);
                marcaState.searchTimeout = setTimeout(() => panelLoadMarcas(1), 400);
            });
            marcaSearch.dataset.listenerAttached = 'true';
        }

        const newSedeBtn = document.getElementById('new-sede-btn');
        if (newSedeBtn && !newSedeBtn.dataset.listenerAttached) {
            newSedeBtn.addEventListener('click', () => panelOpenSedeModal());
            newSedeBtn.dataset.listenerAttached = 'true';
        }
        const sedeSearch = document.getElementById('sede-search');
        if (sedeSearch && !sedeSearch.dataset.listenerAttached) {
            sedeSearch.addEventListener('input', () => {
                clearTimeout(sedeState.searchTimeout);
                sedeState.searchTimeout = setTimeout(() => panelLoadSedes(1), 400);
            });
            sedeSearch.dataset.listenerAttached = 'true';
        }

        const newAsesorBtn = document.getElementById('new-asesor-btn');
        if (newAsesorBtn && !newAsesorBtn.dataset.listenerAttached) {
            newAsesorBtn.addEventListener('click', () => panelOpenAsesorModal());
            newAsesorBtn.dataset.listenerAttached = 'true';
        }
        const asesorSearch = document.getElementById('asesor-search');
        if (asesorSearch && !asesorSearch.dataset.listenerAttached) {
            asesorSearch.addEventListener('input', () => {
                clearTimeout(asesorState.searchTimeout);
                asesorState.searchTimeout = setTimeout(() => panelLoadAsesores(1), 400);
            });
            asesorSearch.dataset.listenerAttached = 'true';
        }
    }

    // Exportar funciones del panel
    window.panelSwitchTab = panelSwitchTab;
    window.panelLoadProducts = panelLoadProducts;
    window.switchTab = panelSwitchTab; // compatibilidad con onclick en admin.html
    window.searchProducts = () => panelLoadProducts(1);
    window.generateBackup = () => panelLoadBackups();
    window.openBannerModal = () => openPanelBannerModal();
    window.openPanelBannerModal = openPanelBannerModal;
    window.closePanelBannerModal = closePanelBannerModal;

}());
