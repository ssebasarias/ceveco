/**
 * Panel de Administración - Ceveco
 * Gestión de productos, banners y backups
 */

const API_BASE = '/api/v1';
let currentPage = 1;
let currentTab = 'productos';

// Verificar autenticación y rol admin al cargar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Asegurar que el loading overlay esté oculto al inicio INMEDIATAMENTE
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
            loadingOverlay.style.display = 'none';
            loadingOverlay.style.visibility = 'hidden';
        }
        
        // Asegurar que los modales estén cerrados
        const productModal = document.getElementById('product-modal');
        if (productModal) {
            productModal.classList.add('hidden');
            productModal.style.display = 'none';
            productModal.style.visibility = 'hidden';
        }
        
        const bannerModal = document.getElementById('banner-modal');
        if (bannerModal) {
            bannerModal.classList.add('hidden');
            bannerModal.style.display = 'none';
            bannerModal.style.visibility = 'hidden';
        }
        
        await checkAdminAccess();
        loadNavbar();
        loadInitialData();
    } catch (error) {
        console.error('Error inicializando admin panel:', error);
        // Asegurar que el loading se oculte incluso si hay error
        hideLoading();
    }
});

/**
 * Verificar que el usuario es admin
 */
async function checkAdminAccess() {
    try {
        // Verificar usando la sesión del usuario en lugar del token
        const user = window.AuthService?.getCurrentUser() || 
                     window.getCurrentUser?.() || 
                     window.StorageUtils?.getUser()?.user ||
                     window.StorageUtils?.getUser();
        
        if (!user) {
            // Si no hay usuario, verificar con una petición al backend con timeout
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
                
                const response = await fetch('/api/v1/admin/banners?limit=1', {
                    credentials: 'include',
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/pages/login.html?redirect=admin';
                    return;
                }
                
                // Si la petición fue exitosa, el usuario es admin
                return;
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('Timeout verificando acceso admin');
                }
                window.location.href = '/pages/login.html?redirect=admin';
                return;
            }
        }
        
        // Verificar rol del usuario
        if (user.rol !== 'admin') {
            alert('Acceso denegado. Se requieren permisos de administrador.');
            window.location.href = '/pages/index.html';
            return;
        }
    } catch (error) {
        console.error('Error verificando acceso:', error);
        window.location.href = '/pages/login.html?redirect=admin';
    }
}

/**
 * Obtener token de autenticación
 */
function getAuthToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'jwt_token') {
            return value;
        }
    }
    return null;
}

/**
 * Cargar navbar
 */
function loadNavbar() {
    fetch('../components/navbar.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
            // Inicializar navbar si tiene su propio script
            if (typeof initNavbar === 'function') {
                initNavbar();
            }
        })
        .catch(err => console.error('Error cargando navbar:', err));
}

/**
 * Cambiar de tab
 */
function switchTab(tabName) {
    currentTab = tabName;
    
    // Actualizar botones de tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const tab = btn.getAttribute('data-tab');
        if (tab === tabName) {
            btn.classList.add('border-blue-500', 'text-blue-600');
            btn.classList.remove('border-transparent', 'text-gray-500');
        } else {
            btn.classList.remove('border-blue-500', 'text-blue-600');
            btn.classList.add('border-transparent', 'text-gray-500');
        }
    });

    // Mostrar contenido del tab
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Cargar datos según el tab
    switch(tabName) {
        case 'productos':
            loadProducts();
            break;
        case 'banners':
            loadBanners();
            break;
        case 'destacados':
            loadFeaturedProducts();
            break;
        case 'backup':
            loadBackups();
            break;
    }
}

/**
 * Cargar datos iniciales
 */
function loadInitialData() {
    // Asegurar que el loading overlay esté oculto al inicio
    hideLoading();
    
    // Asegurar que los modales estén cerrados
    const productModal = document.getElementById('product-modal');
    if (productModal) {
        productModal.classList.add('hidden');
        productModal.style.display = 'none';
        productModal.style.visibility = 'hidden';
    }
    
    const bannerModal = document.getElementById('banner-modal');
    if (bannerModal) {
        bannerModal.classList.add('hidden');
        bannerModal.style.display = 'none';
        bannerModal.style.visibility = 'hidden';
    }
    
    // Verificar si hay un hash en la URL para cambiar de tab
    const hash = window.location.hash.replace('#', '');
    if (hash && ['productos', 'banners', 'destacados', 'backup'].includes(hash)) {
        switchTab(hash);
    } else {
        // Cargar el tab inicial
        switchTab('productos');
    }
}

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

async function loadProducts(page = 1) {
    showLoading();
    try {
        const searchTerm = document.getElementById('product-search')?.value || '';
        const params = new URLSearchParams({
            page,
            limit: 20
        });
        if (searchTerm) {
            params.append('busqueda', searchTerm);
        }

        const response = await fetch(`${API_BASE}/productos?${params}`, {
            method: 'GET',
            credentials: 'include', // Incluir cookies (HttpOnly)
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                hideLoading(); // Ocultar loading antes de redirigir
                window.location.href = '/pages/login.html?redirect=admin';
                return;
            }
            throw new Error('Error al cargar productos');
        }

        const data = await response.json();
        renderProductsTable(data.data || []);
        if (data.pagination) {
            renderPagination(data.pagination, 'products-pagination', loadProducts);
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar productos');
    } finally {
        // Asegurar que el loading siempre se oculte
        hideLoading();
    }
}

function renderProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No se encontraron productos</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.id_producto}</td>
            <td class="px-6 py-4 text-sm text-gray-900">${product.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${parseFloat(product.precio_actual).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.stock}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full ${product.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${product.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editProduct(${product.id_producto})" class="text-blue-600 hover:text-blue-900 mr-3">Editar</button>
                <button onclick="deleteProduct(${product.id_producto})" class="text-red-600 hover:text-red-900">Eliminar</button>
            </td>
        </tr>
    `).join('');
}

function searchProducts() {
    loadProducts(1);
}

function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    
    if (!modal) {
        console.error('Modal de producto no encontrado');
        return;
    }
    
    if (productId) {
        title.textContent = 'Editar Producto';
        document.getElementById('product-id').value = productId;
        // Cargar datos del producto
        loadProductData(productId);
    } else {
        title.textContent = 'Nuevo Producto';
        form.reset();
        document.getElementById('product-id').value = '';
    }
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

async function loadProductData(id) {
    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            const product = data.data;
            document.getElementById('product-nombre').value = product.nombre || '';
            document.getElementById('product-precio').value = product.precio_actual || '';
            document.getElementById('product-stock').value = product.stock || 0;
            document.getElementById('product-descripcion').value = product.descripcion_corta || '';
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
    }
}

async function saveProduct(event) {
    event.preventDefault();
    showLoading();
    
    const id = document.getElementById('product-id').value;
    const productData = {
        nombre: document.getElementById('product-nombre').value,
        precio_actual: parseFloat(document.getElementById('product-precio').value),
        stock: parseInt(document.getElementById('product-stock').value),
        descripcion_corta: document.getElementById('product-descripcion').value
    };

    try {
        const url = id ? `${API_BASE}/productos/${id}` : `${API_BASE}/productos`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess(id ? 'Producto actualizado' : 'Producto creado');
            closeProductModal();
            loadProducts(currentPage);
        } else {
            showError(data.message || 'Error al guardar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al guardar producto');
    } finally {
        hideLoading();
    }
}

async function editProduct(id) {
    openProductModal(id);
}

async function deleteProduct(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/productos/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess('Producto eliminado');
            loadProducts(currentPage);
        } else {
            showError(data.message || 'Error al eliminar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al eliminar producto');
    } finally {
        hideLoading();
    }
}

// ============================================
// GESTIÓN DE BANNERS
// ============================================

async function loadBanners() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/banners`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al cargar banners');

        const data = await response.json();
        renderBannersGrid(data.data || []);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar banners');
    } finally {
        // Asegurar que el loading se oculte siempre
        setTimeout(() => {
            hideLoading();
        }, 100);
    }
}

function renderBannersGrid(banners) {
    const grid = document.getElementById('banners-grid');
    if (banners.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No hay banners. Crea uno nuevo.</div>';
        return;
    }

    grid.innerHTML = banners.map(banner => `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="mb-3">
                <img src="${banner.imagen_url}" alt="${banner.titulo}" class="w-full h-32 object-cover rounded">
            </div>
            <h3 class="font-semibold text-gray-800 mb-1">${banner.titulo}</h3>
            <p class="text-sm text-gray-600 mb-2">${banner.posicion} - Orden: ${banner.orden}</p>
            <div class="flex items-center gap-2 mb-3">
                <span class="px-2 py-1 text-xs rounded-full ${banner.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${banner.activo ? 'Activo' : 'Inactivo'}
                </span>
            </div>
            <div class="flex gap-2">
                <button onclick="editBanner(${banner.id_banner})" class="flex-1 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                    Editar
                </button>
                <button onclick="deleteBanner(${banner.id_banner})" class="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">
                    Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

function openBannerModal(bannerId = null) {
    const modal = document.getElementById('banner-modal');
    const form = document.getElementById('banner-form');
    const title = document.getElementById('banner-modal-title');
    
    if (!modal) {
        console.error('Modal de banner no encontrado');
        return;
    }
    
    // Asegurar que el loading overlay esté oculto cuando se abre el modal
    hideLoading();
    
    if (bannerId) {
        title.textContent = 'Editar Banner';
        document.getElementById('banner-id').value = bannerId;
        loadBannerData(bannerId);
    } else {
        title.textContent = 'Nuevo Banner';
        form.reset();
        document.getElementById('banner-id').value = '';
        document.getElementById('banner-posicion').value = 'hero';
        document.getElementById('banner-orden').value = '0';
        document.getElementById('banner-activo').checked = true;
    }
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.visibility = 'visible';
    document.body.style.overflow = 'hidden';
}

function closeBannerModal() {
    const modal = document.getElementById('banner-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        document.body.style.overflow = '';
    }
    // Asegurar que el loading overlay también esté oculto
    hideLoading();
}

async function loadBannerData(id) {
    try {
        const response = await fetch(`${API_BASE}/admin/banners/${id}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.success) {
            const banner = data.data;
            document.getElementById('banner-titulo').value = banner.titulo || '';
            document.getElementById('banner-subtitulo').value = banner.subtitulo || '';
            document.getElementById('banner-imagen').value = banner.imagen_url || '';
            document.getElementById('banner-enlace').value = banner.enlace_url || '';
            document.getElementById('banner-posicion').value = banner.posicion || 'hero';
            document.getElementById('banner-orden').value = banner.orden || 0;
            document.getElementById('banner-activo').checked = banner.activo !== false;
        }
    } catch (error) {
        console.error('Error cargando banner:', error);
    }
}

async function saveBanner(event) {
    event.preventDefault();
    showLoading();
    
    const id = document.getElementById('banner-id').value;
    const bannerData = {
        titulo: document.getElementById('banner-titulo').value,
        subtitulo: document.getElementById('banner-subtitulo').value,
        imagen_url: document.getElementById('banner-imagen').value,
        enlace_url: document.getElementById('banner-enlace').value,
        posicion: document.getElementById('banner-posicion').value,
        orden: parseInt(document.getElementById('banner-orden').value),
        activo: document.getElementById('banner-activo').checked
    };

    try {
        const url = id ? `${API_BASE}/admin/banners/${id}` : `${API_BASE}/admin/banners`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bannerData)
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess(id ? 'Banner actualizado' : 'Banner creado');
            closeBannerModal();
            // Asegurar que el loading se oculte antes de recargar
            hideLoading();
            loadBanners();
        } else {
            showError(data.message || 'Error al guardar banner');
            hideLoading();
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al guardar banner');
        hideLoading();
    }
}

async function editBanner(id) {
    openBannerModal(id);
}

async function deleteBanner(id) {
    if (!confirm('¿Estás seguro de eliminar este banner?')) return;
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/banners/${id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess('Banner eliminado');
            loadBanners();
        } else {
            showError(data.message || 'Error al eliminar banner');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al eliminar banner');
    } finally {
        hideLoading();
    }
}

// ============================================
// GESTIÓN DE PRODUCTOS DESTACADOS
// ============================================

async function loadFeaturedProducts() {
    showLoading();
    try {
        const searchTerm = document.getElementById('featured-search')?.value || '';
        const params = new URLSearchParams({
            page: 1,
            limit: 50
        });
        if (searchTerm) {
            params.append('busqueda', searchTerm);
        }

        const response = await fetch(`${API_BASE}/productos?${params}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al cargar productos');

        const data = await response.json();
        renderFeaturedProductsGrid(data.data || []);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar productos');
    } finally {
        hideLoading();
    }
}

function renderFeaturedProductsGrid(products) {
    const grid = document.getElementById('featured-products-grid');
    if (products.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center text-gray-500 py-8">No se encontraron productos</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="mb-3">
                <img src="${product.imagen_principal || '/assets/img/no-image.svg'}" alt="${product.nombre}" class="w-full h-32 object-cover rounded">
            </div>
            <h3 class="font-semibold text-gray-800 mb-2 text-sm">${product.nombre}</h3>
            <p class="text-sm text-gray-600 mb-3">$${parseFloat(product.precio_actual).toLocaleString()}</p>
            <button onclick="toggleFeatured(${product.id_producto}, ${product.destacado})" 
                    class="w-full ${product.destacado ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white px-4 py-2 rounded text-sm transition">
                ${product.destacado ? 'Quitar de Destacados' : 'Marcar como Destacado'}
            </button>
        </div>
    `).join('');
}

async function toggleFeatured(productId, currentStatus) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/productos/${productId}/destacado`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ destacado: !currentStatus })
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess(data.message);
            loadFeaturedProducts();
        } else {
            showError(data.message || 'Error al actualizar producto');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al actualizar producto');
    } finally {
        hideLoading();
    }
}

// Búsqueda de productos destacados
document.addEventListener('DOMContentLoaded', () => {
    const featuredSearch = document.getElementById('featured-search');
    if (featuredSearch) {
        let searchTimeout;
        featuredSearch.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadFeaturedProducts();
            }, 500);
        });
    }
});

// ============================================
// GESTIÓN DE BACKUPS
// ============================================

async function loadBackups() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/backups`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Error al cargar backups');

        const data = await response.json();
        renderBackupsList(data.data || []);
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar backups');
    } finally {
        hideLoading();
    }
}

function renderBackupsList(backups) {
    const list = document.getElementById('backups-list');
    if (backups.length === 0) {
        list.innerHTML = '<div class="text-center text-gray-500 py-8">No hay backups disponibles</div>';
        return;
    }

    list.innerHTML = backups.map(backup => `
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center">
            <div>
                <h4 class="font-semibold text-gray-800">${backup.filename}</h4>
                <p class="text-sm text-gray-600">${backup.size} - ${new Date(backup.created).toLocaleString()}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="downloadBackup('${backup.filename}')" class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
                    Descargar
                </button>
            </div>
        </div>
    `).join('');
}

async function generateBackup() {
    if (!confirm('¿Generar backup de la base de datos ahora?')) return;
    
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/admin/backup`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (response.ok && data.success) {
            showSuccess('Backup generado exitosamente');
            loadBackups();
        } else {
            showError(data.message || 'Error al generar backup');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al generar backup');
    } finally {
        hideLoading();
    }
}

function downloadBackup(filename) {
    // Implementar descarga de backup
    alert('Funcionalidad de descarga en desarrollo');
}

// ============================================
// UTILIDADES
// ============================================

function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        overlay.style.visibility = 'visible';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        overlay.style.visibility = 'hidden';
    }
}

function showSuccess(message) {
    // Crear notificación de éxito
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showError(message) {
    // Crear notificación de error
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function renderPagination(pagination, containerId, callback) {
    const container = document.getElementById(containerId);
    if (!pagination || pagination.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
    }

    container.innerHTML = `
        <button onclick="${callback.name}(${pagination.page - 1})" 
                ${!pagination.hasPrevPage ? 'disabled' : ''} 
                class="px-4 py-2 border rounded ${pagination.hasPrevPage ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}">
            Anterior
        </button>
        ${pages.map(page => `
            <button onclick="${callback.name}(${page})" 
                    class="px-4 py-2 border rounded ${page === pagination.page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}">
                ${page}
            </button>
        `).join('')}
        <button onclick="${callback.name}(${pagination.page + 1})" 
                ${!pagination.hasNextPage ? 'disabled' : ''} 
                class="px-4 py-2 border rounded ${pagination.hasNextPage ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}">
            Siguiente
        </button>
    `;
}
