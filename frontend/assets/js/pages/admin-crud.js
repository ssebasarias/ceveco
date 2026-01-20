/**
 * Admin CRUD Functions
 * Funcionalidades CRUD para productos en las páginas públicas
 */

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
                            <button id="add-banner-btn" class="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-medium">
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
    statusEl.className = 'text-xs text-blue-600';

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
    const urls = imagenesTextarea.value.split(/[,\n]/).map(url => url.trim()).filter(Boolean);

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
            ${index === 0 ? '<span class="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">Principal</span>' : ''}
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
    const urls = imagenesTextarea.value.split(/[,\n]/).map(url => url.trim()).filter(Boolean);
    urls.splice(index, 1);
    imagenesTextarea.value = urls.join(', ');
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
        precio_anterior: parseFloat(document.getElementById('product-crud-precio-anterior').value) || null,
        stock: parseInt(document.getElementById('product-crud-stock').value),
        id_categoria: parseInt(document.getElementById('product-crud-categoria').value),
        id_marca: parseInt(document.getElementById('product-crud-marca').value),
        badge: document.getElementById('product-crud-badge').value || null,
        descripcion_corta: document.getElementById('product-crud-descripcion-corta').value || null,
        descripcion_larga: document.getElementById('product-crud-descripcion-larga').value || null,
        destacado: document.getElementById('product-crud-destacado').checked,
        activo: document.getElementById('product-crud-activo').checked,
        imagenes: imagenes.length > 0 ? imagenes : undefined
    };

    // Mostrar loading
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
        const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            },
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
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.AdminHelper.getAuthToken()}`
            }
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
                <img src="${banner.imagen_url}" alt="${banner.titulo}" 
                    class="js-banner-list-image w-24 h-24 object-cover rounded-lg border border-gray-200">
            </div>
            <div class="flex-1 min-w-0">
                <h5 class="font-semibold text-gray-900 truncate">${banner.titulo || 'Sin título'}</h5>
                <p class="text-sm text-gray-600">${banner.subtitulo || ''}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="px-2 py-1 text-xs rounded-full ${banner.posicion === 'hero' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}">
                        ${banner.posicion}
                    </span>
                    <span class="px-2 py-1 text-xs rounded-full ${banner.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${banner.activo ? 'Activo' : 'Inactivo'}
                    </span>
                    <span class="text-xs text-gray-500">Orden: ${banner.orden}</span>
                </div>
            </div>
            <div class="flex-shrink-0 flex gap-2">
                <button class="edit-banner-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm" data-id="${banner.id_banner}">
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