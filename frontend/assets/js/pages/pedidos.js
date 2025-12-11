document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();

    // Validar Auth
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Cargar datos usuario sidebar
    const user = AuthService.getCurrentUser();
    if (user) {
        document.getElementById('sidebar-username').textContent = `${user.nombre} ${user.apellido}`;
        document.getElementById('avatar-initials').textContent = user.nombre.charAt(0).toUpperCase();
    }

    // Funciones
    await loadOrders();
});

async function loadOrders() {
    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-orders');

    console.log('📦 Loading orders...');
    try {
        const orders = await OrdersService.getUserOrders();
        console.log('📦 Orders fetched:', orders);

        if (!orders || orders.length === 0) {
            console.log('📦 No orders found. Showing empty state.');
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        // Remove response.data mapping, orders IS the array
        container.innerHTML = orders.map(renderOrderCard).join('');
        lucide.createIcons();

    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="text-center py-8 text-red-500 bg-red-50 rounded-xl">
                Error al cargar tus pedidos. Por favor intenta nuevamente.
            </div>
        `;
    }
}

function renderOrderCard(order) {
    const date = new Date(order.fecha_pedido).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const statusConfig = getStatusConfig(order.estado);

    // Imagen preview (fallback to generic package if no image)
    const imageHtml = order.imagen_preview
        ? `<img src="${order.imagen_preview}" class="w-full h-full object-cover" alt="Producto">`
        : `<div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400"><i data-lucide="package" class="w-8 h-8"></i></div>`;

    return `
        <div class="bg-white border border-gray-200 rounded-2xl p-6 transition-all hover:shadow-md hover:border-gray-300">
            <div class="flex flex-col md:flex-row gap-6 items-center">
                <!-- Image Preview -->
                <div class="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                    ${imageHtml}
                </div>

                <!-- Info Principal -->
                <div class="flex-1 w-full md:w-auto text-center md:text-left">
                    <div class="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                        <span class="font-bold text-gray-900 text-lg">pedido #${order.numero_pedido}</span>
                        <span class="${statusConfig.bg} ${statusConfig.text} px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide inline-block">
                            ${order.estado}
                        </span>
                    </div>
                    <div class="text-sm text-gray-500">
                        <span class="mr-3"><i data-lucide="calendar" class="w-4 h-4 inline mb-0.5"></i> ${date}</span>
                        <span><i data-lucide="box" class="w-4 h-4 inline mb-0.5"></i> ${order.items_count} items</span>
                    </div>
                </div>

                <!-- Price and Action -->
                <div class="flex flex-row md:flex-col items-center justify-between w-full md:w-auto gap-4 md:items-end">
                    <div class="text-right">
                        <p class="text-xs text-gray-500 mb-0.5">Total</p>
                        <p class="text-xl font-bold text-gray-900">${formatCurrency(order.total)}</p>
                    </div>
                    
                    <a href="pedidos-detalle.html?id=${order.id_pedido}" 
                       class="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 rounded-xl transition-all font-semibold text-sm flex items-center gap-2">
                        Ver Detalles
                        <i data-lucide="chevron-right" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

function getStatusConfig(status) {
    const configs = {
        'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'procesando': { bg: 'bg-blue-100', text: 'text-blue-700' },
        'enviado': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
        'entregado': { bg: 'bg-green-100', text: 'text-green-700' },
        'cancelado': { bg: 'bg-red-100', text: 'text-red-700' },
        'default': { bg: 'bg-gray-100', text: 'text-gray-700' }
    };
    return configs[status.toLowerCase()] || configs['default'];
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(value);
}

// Global logout handler (reused from profile but good to have explicit)
window.handleLogout = async () => {
    try {
        await AuthService.logout();
    } catch (error) {
        console.error('Logout error', error);
        window.location.href = 'index.html';
    }
};
