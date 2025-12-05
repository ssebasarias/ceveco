// Shopping Cart Management
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cevecoCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cevecoCart', JSON.stringify(cart));
    updateCartUI();
}

// Add item to cart
// Acepta: (productId, nombre, precio, imagen) o (productObject)
function addToCart(productId, nombre = null, precio = null, imagen = null) {
    let product;

    // Si se pasan los parámetros individuales
    if (nombre !== null && precio !== null) {
        product = {
            id: productId,
            name: nombre,
            price: precio,
            image: imagen || 'https://via.placeholder.com/100x100?text=Producto',
            brand: 'Ceveco'
        };
    } else if (typeof productId === 'object') {
        // Si se pasa un objeto producto
        product = {
            id: productId.id_producto || productId.id,
            name: productId.nombre || productId.name,
            price: productId.precio_actual || productId.price,
            image: productId.imagen_principal || productId.image || 'https://via.placeholder.com/100x100?text=Producto',
            brand: productId.marca || productId.brand || 'Ceveco'
        };
    } else {
        console.error('addToCart: parámetros inválidos');
        return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    showCartNotification(product.name);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

// Update item quantity
function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
    }
}

// Get cart total
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (!cartSidebar || !overlay) {
        console.warn('Cart elements not found');
        return;
    }

    if (cartSidebar.classList.contains('translate-x-full')) {
        cartSidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        cartSidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// Close cart
function closeCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    if (!cartSidebar || !overlay) return;

    cartSidebar.classList.add('translate-x-full');
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Update cart UI
function updateCartUI() {
    // Update cart count badge
    const cartCount = document.getElementById('cart-count');
    const count = getCartCount();
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }

    // Update cart items
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartFooter = document.getElementById('cart-footer');

    if (!cartItems) return;

    if (cart.length === 0) {
        if (emptyCart) emptyCart.classList.remove('hidden');
        if (cartFooter) cartFooter.classList.add('hidden');
        cartItems.innerHTML = '';
        return;
    }

    if (emptyCart) emptyCart.classList.add('hidden');
    if (cartFooter) cartFooter.classList.remove('hidden');

    cartItems.innerHTML = cart.map(item => `
        <div class="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-contain bg-white rounded-lg">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-sm mb-1">${item.name}</h4>
                <p class="text-xs text-gray-500 mb-2">${item.brand}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-50">
                            <i data-lucide="minus" class="w-3 h-3"></i>
                        </button>
                        <span class="text-sm font-medium w-8 text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="w-6 h-6 flex items-center justify-center bg-white border border-gray-200 rounded hover:bg-gray-50">
                            <i data-lucide="plus" class="w-3 h-3"></i>
                        </button>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
                <p class="text-sm font-bold text-primary mt-2">${formatPrice(item.price * item.quantity)}</p>
            </div>
        </div>
    `).join('');

    // Update total
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        cartTotal.textContent = formatPrice(getCartTotal());
    }

    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Show notification when item is added
function showCartNotification(productName) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-fade-in';
    notification.innerHTML = `
        <i data-lucide="check-circle" class="w-5 h-5"></i>
        <span class="font-medium">Producto agregado al carrito</span>
    `;

    document.body.appendChild(notification);
    lucide.createIcons();

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';
        notification.style.transition = 'all 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});
