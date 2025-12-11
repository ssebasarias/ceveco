document.addEventListener('DOMContentLoaded', async () => {
    lucide.createIcons();

    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        window.location.href = 'pedidos.html';
        return;
    }

    await loadOrderDetails(orderId);
});

async function loadOrderDetails(orderId) {
    const loadingSkeleton = document.getElementById('loading-skeleton');
    const content = document.getElementById('order-content');

    try {
        const response = await OrdersService.getOrderById(orderId);

        if (!response.success || !response.data) {
            throw new Error('Order not found');
        }

        const order = response.data;
        renderOrderData(order);

        loadingSkeleton.classList.add('hidden');
        content.classList.remove('hidden');
        lucide.createIcons();

    } catch (error) {
        console.error('Error details:', error);
        alert('No pudimos cargar los detalles del pedido.');
        window.location.href = 'pedidos.html';
    }
}

function renderOrderData(order) {
    // Header
    const date = new Date(order.fecha_pedido).toLocaleDateString('es-CO', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('order-title').textContent = `Pedido #${order.numero_pedido}`;
    document.getElementById('order-date').textContent = `Realizado el ${date}`;

    // Status Banner
    const statusConfig = getStatusDetails(order.estado);
    const statusCard = document.getElementById('status-card');
    const statusIconContainer = document.getElementById('status-icon-container');

    document.getElementById('order-status-text').textContent = order.estado.charAt(0).toUpperCase() + order.estado.slice(1);

    // Status Styles
    statusCard.className = `bg-white rounded-2xl p-6 shadow-sm border-l-4 ${statusConfig.borderColor} flex items-center justify-between`;
    statusIconContainer.className = `w-12 h-12 rounded-full ${statusConfig.bg2} flex items-center justify-center`;
    statusIconContainer.innerHTML = `<i data-lucide="${statusConfig.icon}" class="w-6 h-6 ${statusConfig.text}"></i>`;

    // Items
    const itemsContainer = document.getElementById('items-container');
    itemsContainer.innerHTML = order.items.map(item => `
        <div class="flex gap-4 items-center">
            <div class="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
                <img src="${item.imagen || '../assets/img/placeholder.png'}" 
                     class="w-full h-full object-cover" alt="${item.nombre}">
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-gray-900 line-clamp-2">${item.nombre}</h4>
                <p class="text-sm text-gray-500">Cantidad: ${item.cantidad}</p>
            </div>
            <div class="text-right">
                <p class="font-bold text-gray-900">${Helpers.formatPrice(item.subtotal)}</p>
                <p class="text-xs text-gray-400">${Helpers.formatPrice(item.precio_unitario)} c/u</p>
            </div>
        </div>
    `).join('');

    // Address
    const address = order.direccion_envio;
    if (address) {
        document.getElementById('shipping-address').innerHTML = `
            <p class="font-bold text-gray-900">${address.nombre_destinatario}</p>
            <p>${address.direccion_linea1}</p>
            <p>${address.ciudad}, ${address.departamento}</p>
            <p class="mt-2 text-sm text-gray-500">Tel: ${address.telefono_contacto}</p>
        `;
    }

    // Totals
    document.getElementById('summary-subtotal').textContent = Helpers.formatPrice(order.subtotal);
    document.getElementById('summary-shipping').textContent = Helpers.formatPrice(order.costo_envio);
    document.getElementById('summary-total').textContent = Helpers.formatPrice(order.total);
}

function getStatusDetails(status) {
    const map = {
        'pendiente': { icon: 'clock', text: 'text-yellow-600', bg2: 'bg-yellow-100', borderColor: 'border-yellow-400' },
        'procesando': { icon: 'loader', text: 'text-blue-600', bg2: 'bg-blue-100', borderColor: 'border-blue-500' },
        'enviado': { icon: 'truck', text: 'text-indigo-600', bg2: 'bg-indigo-100', borderColor: 'border-indigo-500' },
        'entregado': { icon: 'check', text: 'text-green-600', bg2: 'bg-green-100', borderColor: 'border-green-500' },
        'cancelado': { icon: 'x', text: 'text-red-600', bg2: 'bg-red-100', borderColor: 'border-red-500' }
    };
    return map[status.toLowerCase()] || map['pendiente'];
}


