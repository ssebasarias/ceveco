/**
 * Logica de la pagina Checkout
 */

// Inicializar iconos Lucide
if (window.lucide) window.lucide.createIcons();

let currentStep = 1;

// Load cart items on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutItems();

    // Restore form data if returning from login
    const savedFormData = sessionStorage.getItem('checkout_form_data');
    if (savedFormData) {
        try {
            const data = JSON.parse(savedFormData);
            const fields = ['email', 'phone', 'firstName', 'lastName', 'address', 'department', 'city', 'zip', 'notes'];
            fields.forEach(field => {
                const el = document.getElementById(field);
                if (el && data[field]) el.value = data[field];
            });
            // Clean up after restoring
            sessionStorage.removeItem('checkout_form_data');
        } catch (e) {
            console.error('Error restoring form data:', e);
        }
    }

    // Bind Enter key events
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToStep(2);
        });
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') goToStep(2);
        });
    }
});

function loadCheckoutItems() {
    const container = document.getElementById('checkout-items');
    if (!container) return;

    // Prioritize Direct Buy item
    const directBuy = sessionStorage.getItem('ceveco_direct_buy');
    let cart = [];

    if (directBuy) {
        cart = JSON.parse(directBuy);
    } else {
        const savedCart = localStorage.getItem('cevecoCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }

    if (cart.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    let total = 0;

    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="w-20 h-20 bg-white rounded-lg flex-shrink-0 p-2 border border-gray-200">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">${item.name}</h4>
                    <p class="text-xs text-gray-500">Cantidad: ${item.quantity}</p>
                    <p class="text-sm font-bold text-primary mt-1">${window.formatPrice(itemTotal)}</p>
                </div>
            </div>
        `;
    }).join('');

    const subtotalEl = document.getElementById('checkout-subtotal');
    const totalEl = document.getElementById('checkout-total');
    if (subtotalEl) subtotalEl.textContent = window.formatPrice(total);
    if (totalEl) totalEl.textContent = window.formatPrice(total);
}

// Global scope needed for inline onclick calls in HTML?
// Ideally we replace them, but user asked to isolate code, not necessarily refactor 100% of HTML logic bindings if not broken.
// However, since we are moving to a module/file, it's safer to expose these to `window` or refactor listeners.
// Given previous step refactored listeners to be clean, I should try to do the same or expose to window.
// The previous refactor (Step 314) KEPT inline HTML structure but removed the script block. Wait, I replaced inline scripts with logic in JS file.
// But did I remove `onclick` in `checkout.html`? No, I haven't edited `checkout.html` yet.
// In `detalle-producto.html`, I removed `onclick` in previous steps (Step 297).
// For `checkout.html`, I haven't removed `onclick` yet.
// So I will expose these functions to `window` for now to minimize risk of breaking static HTML bindings unless I do a massive search/replace on HTML too.
// Actually, `checkout.html` has `onclick="goToStep(2)"` etc.
// I will expose them to `window`.

window.goToStep = function (step) {
    // Validate current step before proceeding
    if (step > currentStep) {
        if (currentStep === 1) {
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;

            if (!email || !phone) {
                alert('Por favor completa la información de contacto.');
                return;
            }

            if (!email.includes('@')) {
                alert('Por favor ingresa un correo electrónico válido.');
                return;
            }
        }

        if (currentStep === 2 && step === 3) {
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const address = document.getElementById('address').value;
            const department = document.getElementById('department').value;
            const city = document.getElementById('city').value;

            if (!firstName || !lastName || !address || !department || !city) {
                alert('Por favor completa todos los campos obligatorios de envío.');
                return;
            }
        }
    }

    currentStep = step;

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        const sectionEl = document.getElementById(`section-${i === 1 ? 'contact' : i === 2 ? 'shipping' : 'payment'}`);

        if (i < step) {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg step-completed mb-2 transition-all duration-300';
            stepEl.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';
            sectionEl.classList.add('opacity-50', 'pointer-events-none');
        } else if (i === step) {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg step-active mb-2 transition-all duration-300';
            stepEl.textContent = i;
            sectionEl.classList.remove('opacity-50', 'pointer-events-none');

            // Scroll to section
            sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gray-200 text-gray-500 mb-2 transition-all duration-300';
            stepEl.textContent = i;
            sectionEl.classList.add('opacity-50', 'pointer-events-none');
        }
    }

    // Update progress bars
    const prog1 = document.getElementById('progress-1');
    const prog2 = document.getElementById('progress-2');
    if (prog1) prog1.style.width = step >= 2 ? '100%' : '0%';
    if (prog2) prog2.style.width = step >= 3 ? '100%' : '0%';

    // Update step labels
    for (let i = 1; i <= 3; i++) {
        const label = document.querySelector(`#step-${i} + span`);
        if (label) {
            if (i <= step) {
                label.classList.remove('text-gray-500');
                label.classList.add('text-gray-700', 'font-semibold');
            } else {
                label.classList.add('text-gray-500');
                label.classList.remove('text-gray-700', 'font-semibold');
            }
        }
    }

    if (window.lucide) window.lucide.createIcons();
};

window.applyPromoCode = function () {
    const codeInput = document.getElementById('promo-code');
    const code = codeInput ? codeInput.value.trim() : '';
    if (!code) {
        alert('Por favor ingresa un código de descuento.');
        return;
    }
    // TODO: Validate promo code with backend
    alert('Funcionalidad de códigos promocionales próximamente disponible.');
};

window.initiatePayment = async function () {
    // Check authentication first
    const token = localStorage.getItem('ceveco_auth_token');
    if (!token) {
        alert('Para completar tu compra, por favor inicia sesión o regístrate.');

        // Save form data
        const formData = {
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            department: document.getElementById('department').value,
            city: document.getElementById('city').value,
            zip: document.getElementById('zip').value,
            notes: document.getElementById('notes').value
        };
        sessionStorage.setItem('checkout_form_data', JSON.stringify(formData));
        sessionStorage.setItem('redirect_after_login', window.location.href);

        window.location.href = 'login.html';
        return;
    }

    const directBuy = sessionStorage.getItem('ceveco_direct_buy');
    const savedCart = localStorage.getItem('cevecoCart');
    const cart = directBuy ? JSON.parse(directBuy) : JSON.parse(savedCart || '[]');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalInCents = Math.round(total * 100);

    // Capture all values explicitly
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const department = document.getElementById('department').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;

    // Generate a unique reference
    const reference = 'CEVECO-' + Date.now();

    // Try-Catch block for Wompi
    try {
        if (typeof WidgetCheckout === 'undefined') {
            throw new Error('Wompi Widget not loaded');
        }

        // Fetch config from backend
        const configResponse = await fetch('/api/v1/config');
        const configData = await configResponse.json();
        const publicKey = (configData.success && configData.data.wompiPublicKey)
            ? configData.data.wompiPublicKey
            : 'pub_test_Q5yDA9xoKdePzhSGeVe9HAez7HgGORGf'; // Fallback

        var checkout = new WidgetCheckout({
            currency: 'COP',
            amountInCents: totalInCents,
            reference: reference,
            publicKey: publicKey,
            redirectUrl: window.location.origin + '/frontend/pages/index.html',
            customerData: {
                email: email,
                fullName: `${firstName} ${lastName}`,
                phoneNumber: phone,
                phoneNumberPrefix: '+57'
            }
        });

        checkout.open(async function (result) {
            var transaction = result.transaction;
            if (transaction.status === 'APPROVED') {
                await createOrderBackend(cart, {
                    firstName, lastName, address, department, city, zip, email, phone
                }, total, reference); // Pass reference
            }
        });

    } catch (e) {
        console.error('Wompi Error:', e);
        alert('El sistema de pagos no está disponible. Usando modo simulación.');
        simulateOrder();
    }
};

window.simulateOrder = async function () {
    const directBuy = sessionStorage.getItem('ceveco_direct_buy');
    const savedCart = localStorage.getItem('cevecoCart');
    const cart = directBuy ? JSON.parse(directBuy) : JSON.parse(savedCart || '[]');

    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Capture values again just in case
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const address = document.getElementById('address').value;
    const department = document.getElementById('department').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;

    // Generate simulation reference
    const reference = 'SIM-' + Date.now();

    await createOrderBackend(cart, {
        firstName, lastName, address, department, city, zip, email, phone
    }, total, reference);
};

async function createOrderBackend(cart, shippingData, total, reference) {
    try {
        const orderData = {
            items: cart,
            shippingAddress: shippingData,
            contact: {
                email: shippingData.email,
                phone: shippingData.phone
            },
            totals: {
                subtotal: total,
                total: total,
                shipping: 0
            },
            reference: reference // Include reference for Webhook/Wompi matching
        };

        if (window.OrdersService) {
            await window.OrdersService.createOrder(orderData);
        } else {
            console.error('OrdersService not found');
            alert('Error interno: Servicio de órdenes no disponible.');
            return;
        }

        // Clear the correct storage
        if (sessionStorage.getItem('ceveco_direct_buy')) {
            sessionStorage.removeItem('ceveco_direct_buy');
        } else {
            localStorage.removeItem('cevecoCart');
        }

        alert('¡Pedido Creado Exitosamente (Simulación)!');
        window.location.href = 'pedidos.html';

    } catch (error) {
        console.error('Error creando pedido:', error);
        alert('Error al guardar el pedido: ' + error.message);
    }
}
