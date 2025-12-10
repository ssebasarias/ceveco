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
    // Buttons (Edit Profile)
    const editBtn = document.getElementById('btn-edit');
    if (editBtn) editBtn.addEventListener('click', toggleEditMode);

    const cancelEditBtn = document.getElementById('btn-cancel-edit');
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', cancelEdit);

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

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

    // Event Delegation for Address Deletion (Dynamic Elements)
    const addressesList = document.getElementById('addresses-list');
    if (addressesList) {
        addressesList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-address');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                if (id) deleteAddress(id);
            }
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
        // Fix: Use relative endpoint since API Client appends base URL
        const response = await window.API.get('/direcciones');
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
                        <button type="button" class="btn-delete-address text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1" data-id="${addr.id_direccion}">
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
        const response = await window.API.post('/direcciones', data);
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
async function deleteAddress(id) {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
        const response = await window.API.delete(`/direcciones/${id}`);
        if (response.success) {
            await loadAddresses();
        } else {
            alert('Error al eliminar dirección.');
        }
    } catch (error) {
        console.error('Error deleting address:', error);
    }
};


function toggleEditMode() {
    console.log('✏️ toggleEditMode called');
    const inputs = ['nombre', 'apellido', 'telefono'];
    const nameInput = document.getElementById('nombre');
    const isDisabled = nameInput.disabled;

    console.log('Current disabled state:', isDisabled);

    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isDisabled) {
                el.removeAttribute('disabled');
                el.classList.remove('border-transparent');
                el.classList.remove('border-gray-50'); // Remove bg helper if any
                el.classList.add('border-gray-200');
            } else {
                el.setAttribute('disabled', 'true');
                el.classList.add('border-transparent');
                el.classList.add('border-gray-50');
                el.classList.remove('border-gray-200');
            }
        }
    });

    const editBtn = document.getElementById('btn-edit');
    const actions = document.getElementById('edit-actions');

    if (editBtn && actions) {
        if (isDisabled) {
            editBtn.classList.add('hidden');
            actions.classList.remove('hidden');
            actions.classList.add('flex');
            nameInput.focus();
        } else {
            cancelEdit();
        }
    } else {
        console.error('Botones de edición no encontrados');
    }
};

function cancelEdit() {
    const actions = document.getElementById('edit-actions');
    const editBtn = document.getElementById('btn-edit');

    if (actions) {
        actions.classList.add('hidden');
        actions.classList.remove('flex');
    }

    if (editBtn) {
        editBtn.classList.remove('hidden');
    }

    const inputs = ['nombre', 'apellido', 'telefono'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('disabled', 'true');
            el.classList.add('border-transparent');
            el.classList.add('border-gray-50');
            el.classList.remove('border-gray-200');
        }
    });

    // Restore original values
    const user = AuthService.getCurrentUser();
    if (user) {
        setInputValue('nombre', user.nombre);
        setInputValue('apellido', user.apellido);
        setInputValue('telefono', user.celular || user.telefono);
    }
};

function handleLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthService.logout();
    }
};

async function handleProfileUpdate(e) {
    if (e) e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellido = document.getElementById('apellido').value;
    const telefono = document.getElementById('telefono').value;

    if (!nombre) {
        alert('El nombre es obligatorio.');
        return;
    }

    try {
        const updatedData = {
            nombre,
            apellido,
            celular: telefono
        };

        const response = await window.API.put(window.CONSTANTS.API_PATHS.AUTH.PROFILE, updatedData);

        if (response.success) {
            // Update local storage explicitly to ensure UI reflects changes immediately
            // The API returns data in response.data.user
            const updatedUser = response.data && response.data.user ? response.data.user : response.user;

            if (updatedUser) {
                const currentSession = window.StorageUtils.getUser() || {};

                // Ensure we keep the token and expiration, just update user data
                const newSession = {
                    ...currentSession,
                    user: updatedUser
                };

                // If the current session format is just the user (legacy), wrap it
                if (!newSession.user && !newSession.expiresAt) {
                    // This handles case where getUser just returned the user object directly
                    window.StorageUtils.setUser({ user: updatedUser });
                } else {
                    window.StorageUtils.setUser(newSession);
                }

                renderUserData(updatedUser);
            } else {
                await loadUserProfile();
            }

            alert('Perfil actualizado correctamente.');
            cancelEdit();
        } else {
            alert(response.message || 'Error al actualizar perfil');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error de conexión al actualizar el perfil.');
    }
}

async function handlePasswordChange(e) {
    if (e) e.preventDefault();

    const currentPassword = document.getElementById('current_password').value;
    const newPassword = document.getElementById('new_password').value;

    if (!newPassword || newPassword.length < 6) {
        alert('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
        const response = await window.API.post(window.CONSTANTS.API_PATHS.AUTH.CHANGE_PASSWORD, {
            currentPassword,
            newPassword
        });

        if (response.success) {
            alert('Contraseña actualizada correctamente.');
            e.target.reset();
        } else {
            alert(response.message || 'Error al cambiar contraseña');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('Error al cambiar la contraseña. Verifica tus datos.');
    }
}
