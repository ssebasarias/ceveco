/**
 * Logica de la pagina Checkout
 */

// Inicializar iconos Lucide
if (window.lucide) window.lucide.createIcons();

console.log('✅ Checkout JS Loaded');

let currentStep = 1;

// Load cart items on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Checkout DOM Ready');
    loadCheckoutItems();

    // Button Event Listeners
    document.getElementById('btn-pay-now')?.addEventListener('click', initiatePayment);

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

    // Attempt to auto-fill user data
    if (window.AuthService && window.AuthService.isAuthenticated()) {
        loadUserData();
    }

    setupAddressPreview();
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
// In `detalle - producto.html`, I removed `onclick` in previous steps (Step 297).
// For `checkout.html`, I haven't removed `onclick` yet.
// So I will expose these functions to `window` for now to minimize risk of breaking static HTML bindings unless I do a massive search/replace on HTML too.
// Actually, `checkout.html` has `onclick = "goToStep(2)"` etc.
// I will expose them to `window`.

window.goToStep = function (step) {
    console.log('👣 goToStep called:', step, 'Current:', currentStep);
    // Validate current step before proceeding
    if (step > currentStep) {
        if (currentStep === 1) {
            const emailEl = document.getElementById('email');
            const phoneEl = document.getElementById('phone');

            const email = emailEl ? emailEl.value.trim() : '';
            const phone = phoneEl ? phoneEl.value.trim() : '';

            console.log('Checking Contact Info:', { email, phone });

            if (!email || !phone) {
                alert('Por favor completa la información de contacto (Email y Teléfono).');
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
            // Validate Structured Address Fields
            const via = document.getElementById('addr_via').value;
            const numVia = document.getElementById('addr_num_via').value;
            const numCruce = document.getElementById('addr_num_cruce').value;
            const placa = document.getElementById('addr_placa').value;

            const department = document.getElementById('department').value;
            const city = document.getElementById('city').value;

            if (!firstName || !lastName || !department || !city) {
                alert('Por favor completa todos los campos obligatorios de envío.');
                return;
            }

            if (!via || !numVia || !numCruce || !placa) {
                alert('Por favor completa todos los campos de la dirección (Vía, Número, #, -).');
                return;
            }

            // Update hidden address field explicitly
            updateAddressHiddenField();
        }
    }

    currentStep = step;

    // Update step indicators
    // Update step indicators
    for (let i = 1; i <= 3; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        const sectionEl = document.getElementById(`section-${i === 1 ? 'contact' : i === 2 ? 'shipping' : 'payment'}`);

        if (i < step) {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg step-completed mb-2 transition-all duration-300';
            stepEl.innerHTML = '<i data-lucide="check" class="w-6 h-6"></i>';
            if (sectionEl) sectionEl.classList.remove('opacity-50', 'pointer-events-none');
        } else if (i === step) {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg step-active mb-2 transition-all duration-300';
            stepEl.textContent = i;
            if (sectionEl) {
                sectionEl.classList.remove('opacity-50', 'pointer-events-none');
                sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            stepEl.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gray-200 text-gray-500 mb-2 transition-all duration-300';
            stepEl.textContent = i;
            // Ensure enabled even for future steps
            if (sectionEl) sectionEl.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    // Update progress bars
    const prog1 = document.getElementById('progress-1');
    const prog2 = document.getElementById('progress-2');
    if (prog1) prog1.style.width = step >= 2 ? '100%' : '0%';
    if (prog2) prog2.style.width = step >= 3 ? '100%' : '0%';

    // Update step labels
    for (let i = 1; i <= 3; i++) {
        const label = document.querySelector(`#step - ${i} + span`);
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



window.initiatePayment = async function () {
    // 0. Update Hidden Fields logic (Address)
    // We must ensure the hidden address field is up to date before submitting
    updateAddressHiddenField();

    // 1. Validate All Fields manually since we removed step-by-step validation
    const emailVal = document.getElementById('email')?.value.trim();
    const phoneVal = document.getElementById('phone')?.value.trim();
    if (!emailVal || !phoneVal) {
        alert('Por favor completa la información de contacto (Email y Teléfono).');
        return;
    }
    if (!emailVal.includes('@')) {
        alert('Por favor ingresa un correo electrónico válido.');
        return;
    }

    const firstNameVal = document.getElementById('firstName')?.value.trim();
    const lastNameVal = document.getElementById('lastName')?.value.trim();
    const departmentVal = document.getElementById('department')?.value;
    const cityVal = document.getElementById('city')?.value.trim();

    // Structured Address Check
    const via = document.getElementById('addr_via')?.value;
    const numVia = document.getElementById('addr_num_via')?.value;
    const numCruce = document.getElementById('addr_num_cruce')?.value;
    const placa = document.getElementById('addr_placa')?.value;

    if (!firstNameVal || !lastNameVal || !departmentVal || !cityVal) {
        alert('Por favor completa todos los campos obligatorios de envío (Nombres, Apellidos, Departamento, Ciudad).');
        return;
    }

    if (!via || !numVia || !numCruce || !placa) {
        alert('Por favor completa correctamente la dirección (Vía, Número, #, -).');
        return;
    }


    // Check authentication first or guest checkout logic
    const isAuthenticated = window.AuthService ? window.AuthService.isAuthenticated() : false;
    // Guest mode enabled: No redirection to login.


    // 🔧 DEV MODE: Allow instant simulation bypass
    // This allows testing the order creation flow without opening the Wompi widget
    if (window.CONFIG && window.CONFIG.IS_DEV) {
        if (confirm('🔧 MODO DESARROLLO\n\n¿Quieres simular un pago exitoso inmediatamente sin abrir la pasarela de pagos?')) {
            if (typeof window.simulateOrder === 'function') {
                await window.simulateOrder();
                return;
            } else {
                console.warn('simulateOrder function not found even though IS_DEV is true.');
            }
        }
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
    // New fields
    const type = document.getElementById('addr_type').value;
    const detail = document.getElementById('addr_detail').value;
    const notes = document.getElementById('notes').value;

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
                fullName: `${firstName} ${lastName} `,
                phoneNumber: phone,
                phoneNumberPrefix: '+57'
            }
        });

        checkout.open(async function (result) {
            var transaction = result.transaction;
            if (transaction.status === 'APPROVED') {
                await createOrderBackend(cart, {
                    firstName, lastName, address, department, city, zip, email, phone,
                    type, detail, notes
                }, total, reference); // Pass reference
            }
        });

    } catch (e) {
        console.error('Wompi Error:', e);

        // Development fallback only
        if (window.CONFIG && window.CONFIG.IS_DEV) {
            alert('Wompi no disponible. Usando modo simulación (DEV ONLY).');
            simulateOrder();
        } else {
            alert('El sistema de pagos no está disponible en este momento. Por favor intenta más tarde.');
        }
    }
};

// Development helper - Only define in DEV mode
if (window.CONFIG && window.CONFIG.IS_DEV) {
    window.simulateOrder = async function () {
        const directBuy = sessionStorage.getItem('ceveco_direct_buy');
        const savedCart = localStorage.getItem('cevecoCart');
        const cart = directBuy ? JSON.parse(directBuy) : JSON.parse(savedCart || '[]');

        if (cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Capture all values explicitly
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const address = document.getElementById('address').value;
        const department = document.getElementById('department').value;
        const city = document.getElementById('city').value;
        const zip = document.getElementById('zip').value;
        // New fields
        const type = document.getElementById('addr_type').value;
        const detail = document.getElementById('addr_detail').value;
        const notes = document.getElementById('notes').value;

        // Generate simulation reference
        const reference = 'SIM-' + Date.now();

        await createOrderBackend(cart, {
            firstName, lastName, address, department, city, zip, email, phone,
            type, detail, notes
        }, total, reference);
    };
}

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
            const response = await window.OrdersService.createOrder(orderData);

            if (response.success) {
                // Auto-login for Guest Checkout
                if (response.auth && response.auth.token) {
                    console.log('🔌 Auto-logging in guest user...');
                    if (window.StorageUtils) {
                        window.StorageUtils.setToken(response.auth.token);
                        window.StorageUtils.setUser(response.auth.user);
                    }
                }

                // Clear the correct storage
                if (sessionStorage.getItem('ceveco_direct_buy')) {
                    sessionStorage.removeItem('ceveco_direct_buy');
                } else {
                    localStorage.removeItem('cevecoCart');
                }

                alert('¡Pedido Creado Exitosamente!');

                // Redirect to Order Details
                const orderId = response.data.id_pedido;
                window.location.href = `pedidos-detalle.html?id=${orderId}`;
            } else {
                throw new Error(response.message || 'Error desconocido al crear pedido');
            }

        } else {
            console.error('OrdersService not found');
            alert('Error interno: Servicio de órdenes no disponible.');
            return;
        }

    } catch (error) {
        console.error('Error creando pedido:', error);
        alert('Error al guardar el pedido: ' + error.message);
    }
}

async function loadUserData() {
    try {
        console.log('🔄 Attempting to load user data for checkout...');

        // 1. Get User Profile
        let user = window.AuthService.getCurrentUser();

        try {
            // Try to refresh profile to ensure latest data
            const refreshedUser = await window.AuthService.refreshProfile();
            if (refreshedUser) user = refreshedUser;
        } catch (e) {
            console.warn('Could not refresh profile, using cached data');
        }

        if (user) {
            console.log('👤 User found, auto-filling basic info...');
            fillFieldIfEmpty('email', user.email);
            fillFieldIfEmpty('phone', user.celular || user.telefono);
            fillFieldIfEmpty('firstName', user.nombre);
            fillFieldIfEmpty('lastName', user.apellido);
        }

        // 2. Get User Addresses
        const response = await window.API.get('/direcciones');
        if (response.success && response.data && response.data.length > 0) {
            // Find principal address or take the first one
            const principalAddress = response.data.find(a => a.es_principal) || response.data[0];

            console.log('📍 Address found, auto-filling shipping info...', principalAddress);
            if (principalAddress) {
                // Parse full address to structured inputs
                parseAddressToFields(principalAddress.direccion_linea1);

                fillFieldIfEmpty('department', principalAddress.departamento);
                fillFieldIfEmpty('city', principalAddress.ciudad);
                fillFieldIfEmpty('zip', principalAddress.codigo_postal);

                // Map new fields
                fillFieldIfEmpty('addr_type', principalAddress.tipo);
                fillFieldIfEmpty('addr_detail', principalAddress.direccion_linea2); // Explicitly map Detail
                fillFieldIfEmpty('notes', principalAddress.referencias);

                // Force update hidden field
                updateAddressHiddenField();
            }
        } else {
            console.log('ℹ️ No saved addresses found.');
        }
    } catch (error) {
        console.error('Error loading user data for checkout:', error);
    }
}

function fillFieldIfEmpty(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el && !el.value) {
        el.value = value;
        // Trigger change event just in case
        el.dispatchEvent(new Event('change'));
        el.dispatchEvent(new Event('input'));
    }
}

// -----------------------------------------------------
// Address Builder Logic (Structured Address)
// -----------------------------------------------------

function setupAddressPreview() {
    const inputs = ['addr_via', 'addr_num_via', 'addr_num_cruce', 'addr_placa', 'addr_type', 'addr_detail'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateAddressHiddenField);
            el.addEventListener('change', updateAddressHiddenField);
        }
    });
}

function updateAddressHiddenField() {
    const via = document.getElementById('addr_via').value || 'Calle';
    const numVia = document.getElementById('addr_num_via').value || '...';
    const numCruce = document.getElementById('addr_num_cruce').value || '...';
    const placa = document.getElementById('addr_placa').value || '...';

    // Preview
    const preview = document.getElementById('address-preview');
    if (preview) {
        preview.textContent = `${via} ${numVia} # ${numCruce} - ${placa}`;
    }

    // Update Hidden Input (Important for submission)
    const addressInput = document.getElementById('address');
    if (addressInput) {
        let fullAddr = `${via} ${numVia} # ${numCruce} - ${placa}`;

        const type = document.getElementById('addr_type')?.value;
        const detail = document.getElementById('addr_detail')?.value;

        if (type && type !== 'Otro') fullAddr += ` (${type})`;
        if (detail) fullAddr += ` ${detail}`;

        addressInput.value = fullAddr;
    }




}

function parseAddressToFields(fullAddress) {
    console.log('📝 Parsing address:', fullAddress);
    if (!fullAddress) return;

    // Relaxed Regex: (Type) (NumVia) # (NumCruce) -? (Placa)
    // Supports: "Calle 123 # 45 - 67", "Carrera 10 #20-30", etc.
    const addrRegex = /^([a-zA-ZñÑ\.]+)\s+([a-zA-Z0-9]+)\s*#\s*([a-zA-Z0-9]+)[\s-]*([a-zA-Z0-9]+)?/i;
    const match = fullAddress.match(addrRegex);

    if (match) {
        console.log('✅ Regex match:', match);
        const viaVal = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
        const viaSelect = document.getElementById('addr_via');

        // Check if value exists, if not default
        if ([...viaSelect.options].some(o => o.value === viaVal)) {
            viaSelect.value = viaVal;
        } else {
            console.warn('Unknown Via Type:', viaVal);
        }

        document.getElementById('addr_num_via').value = match[2] || '';
        document.getElementById('addr_num_cruce').value = match[3] || '';
        document.getElementById('addr_placa').value = match[4] || '';
    } else {
        console.warn('❌ Could not parse address format:', fullAddress);
    }

    // Force update hidden field to reflect parsed values
    updateAddressHiddenField();
}
