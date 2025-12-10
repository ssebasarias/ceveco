/**
 * Logica de la pagina de Perfil de Usuario
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar autenticación
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Cargar datos del usuario
    await loadUserProfile();
    await loadAddresses();

    // 3. Inicializar iconos
    lucide.createIcons();

    // 4. Listeners
    setupListeners();
});

function setupListeners() {
    // Navegación Tabs (Solo frontend visual por ahora)
    const tabs = document.querySelectorAll('.profile-nav-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // e.preventDefault();
            // Lógica de navegación entre secciones si fuera SPA
        });
    });

    // Formulario Perfil
    const profileForm = document.getElementById('profile-form');
    if (profileForm) profileForm.addEventListener('submit', handleProfileUpdate);

    // Toggle Seguridad
    const securityToggle = document.getElementById('security-toggle');
    const securityContent = document.getElementById('security-content');
    if (securityToggle) {
        securityToggle.addEventListener('click', () => {
            securityContent.classList.toggle('hidden');
            const icon = securityToggle.querySelector('[data-lucide="chevron-down"]');
            if (icon) icon.classList.toggle('rotate-180');
        });
    }

    // Formulario Password
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) passwordForm.addEventListener('submit', handlePasswordChange);

    // Modal Dirección
    const addAddressBtn = document.getElementById('btn-add-address');
    const addressModal = document.getElementById('address-modal');
    const closeAddressModal = document.getElementById('btn-close-address-modal');
    const cancelAddressBtn = document.getElementById('btn-cancel-address');
    const addressForm = document.getElementById('address-form');

    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', () => {
            addressModal.classList.remove('hidden');
            addressModal.classList.add('flex');
        });
    }

    const closeModal = () => {
        addressModal.classList.add('hidden');
        addressModal.classList.remove('flex');
        addressForm.reset();
    };

    if (closeAddressModal) closeAddressModal.addEventListener('click', closeModal);
    if (cancelAddressBtn) cancelAddressBtn.addEventListener('click', closeModal);

    if (addressForm) {
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCreateAddress(new FormData(addressForm));
            closeModal();
        });
    }
}

/**
 * Cargar datos del perfil
 */
async function loadUserProfile() {
    try {
        const user = await AuthService.refreshProfile() || AuthService.getCurrentUser();
        if (!user) {
            AuthService.logout();
            return;
        }
        renderUserData(user);
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function renderUserData(user) {
    document.getElementById('sidebar-name').textContent = `${user.nombre} ${user.apellido || ''}`;
    document.getElementById('sidebar-email').textContent = user.email;

    const avatarImg = document.getElementById('profile-avatar');
    const defaultIcon = document.getElementById('default-avatar');

    if (user.avatar_url) {
        avatarImg.src = user.avatar_url;
        avatarImg.classList.remove('hidden');
        defaultIcon.classList.add('hidden');
    } else {
        avatarImg.classList.add('hidden');
        defaultIcon.classList.remove('hidden');
    }

    setInputValue('nombre', user.nombre);
    setInputValue('apellido', user.apellido);
    setInputValue('email', user.email);
    setInputValue('telefono', user.celular || user.telefono || '');
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
}

/**
 * Cargar Direcciones
 */
async function loadAddresses() {
    const container = document.getElementById('addresses-list');
    if (!container) return;

    try {
        const response = await window.API.get('/api/v1/direcciones'); // O usar CONSTANTS si actualizas theme.config
        const addresses = response.data || [];

        if (addresses.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <i data-lucide="map-pin" class="w-8 h-8 mx-auto mb-2 text-gray-400"></i>
                    <p>No tienes direcciones guardadas.</p>
                </div>
            `;
        } else {
            container.innerHTML = addresses.map(addr => `
                <div class="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow bg-white">
                    ${addr.es_principal ? '<span class="absolute top-4 right-4 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Principal</span>' : ''}
                    <div class="flex items-start gap-3 mb-3">
                        <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="${addr.tipo === 'trabajo' ? 'briefcase' : 'home'}" class="w-4 h-4 text-gray-600"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900 text-sm">${addr.direccion_linea1}</h4>
                            <p class="text-xs text-gray-500">${addr.ciudad}, ${addr.departamento}</p>
                        </div>
                    </div>
                    <div class="text-xs text-gray-600 space-y-1 mb-4">
                        <p><span class="font-medium">Recibe:</span> ${addr.nombre_destinatario}</p>
                        <p><span class="font-medium">Tel:</span> ${addr.telefono_contacto}</p> 
                    </div>
                    <div class="border-t border-gray-100 pt-3 flex justify-end">
                        <button onclick="deleteAddress(${addr.id_direccion})" class="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                            <i data-lucide="trash-2" class="w-3 h-3"></i> Eliminar
                        </button>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();

    } catch (error) {
        console.error('Error loading addresses:', error);
        container.innerHTML = '<p class="text-red-500 text-sm">Error cargando direcciones.</p>';
    }
}

/**
 * Crear Dirección
 */
async function handleCreateAddress(formData) {
    const data = Object.fromEntries(formData.entries());

    // Convert checkbox to boolean
    data.es_principal = formData.get('es_principal') === 'on';

    try {
        const response = await window.API.post('/api/v1/direcciones', data);
        if (response.success) {
            alert('Dirección agregada correctamente.');
            await loadAddresses();
        } else {
            alert(response.message || 'Error al guardar dirección');
        }
    } catch (error) {
        console.error('Error creating address:', error);
        alert('Error conectando con el servidor.');
    }
}

/**
 * Eliminar Dirección
 */
window.deleteAddress = async function (id) {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
        const response = await window.API.delete(`/api/v1/direcciones/${id}`);
        if (response.success) {
            await loadAddresses();
        } else {
            alert('Error al eliminar dirección.');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
    }
};

// ... (Resto de funciones de perfil: toggleEditMode, cancelEdit, handleProfileUpdate, handlePasswordChange - Mismas que antes)
// Copiar las funciones existentes de toggleEditMode, cancelEdit, handleProfileUpdate, handlePasswordChange aquí abajo
// Para brevedad en esta respuesta, asumo que se mantienen igual, solo agregando la lógica de direcciones arriba.

window.toggleEditMode = function () { /* ... código anterior ... */
    const inputs = ['nombre', 'apellido', 'telefono'];
    const isDisabled = document.getElementById('nombre').disabled;
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (isDisabled) {
            el.removeAttribute('disabled');
            el.classList.remove('border-transparent'); el.classList.add('border-gray-200');
        } else {
            el.setAttribute('disabled', 'true');
            el.classList.add('border-transparent'); el.classList.remove('border-gray-200');
        }
    });
    const editBtn = document.getElementById('btn-edit');
    const actions = document.getElementById('edit-actions');
    if (isDisabled) {
        editBtn.classList.add('hidden');
        actions.classList.remove('hidden'); actions.classList.add('flex');
    } else {
        cancelEdit();
    }
};

window.cancelEdit = function () { /* ... código anterior ... */
    const actions = document.getElementById('edit-actions');
    const editBtn = document.getElementById('btn-edit');
    actions.classList.add('hidden'); actions.classList.remove('flex');
    editBtn.classList.remove('hidden');
    const inputs = ['nombre', 'apellido', 'telefono'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        el.setAttribute('disabled', 'true');
        el.classList.add('border-transparent'); el.classList.remove('border-gray-200');
    });
    const user = AuthService.getCurrentUser();
    if (user) {
        setInputValue('nombre', user.nombre);
        setInputValue('apellido', user.apellido);
        setInputValue('telefono', user.celular || user.telefono);
    }
};

window.handleLogout = function () {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthService.logout();
    }
};

async function handleProfileUpdate(e) { /* ... código anterior ... */
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const telefono = document.getElementById('telefono').value;
    if (!nombre) { alert('El nombre es obligatorio.'); return; }
    try {
        const updatedData = { nombre, apellido, celular: telefono };
        const response = await window.API.put(window.CONSTANTS.API_PATHS.AUTH.PROFILE, updatedData);
        if (response.success) {
            alert('Perfil actualizado correctamente.');
            window.cancelEdit();
            await loadUserProfile();
        } else {
            alert(response.message || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error de conexión al actualizar el perfil.');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;
    if (!newPassword || newPassword.length < 6) { alert('La nueva contraseña debe tener al menos 6 caracteres.'); return; }
    try {
        const response = await window.API.post(window.CONSTANTS.API_PATHS.AUTH.CHANGE_PASSWORD, { currentPassword, newPassword });
        if (response.success) { alert('Contraseña actualizada correctamente.'); e.target.reset(); }
        else { alert(response.message || 'Error al cambiar contraseña'); }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error al cambiar la contraseña. Verifica tus datos.');
    }
}
