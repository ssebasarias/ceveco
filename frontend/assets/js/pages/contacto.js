document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos
    lucide.createIcons();

    const form = document.querySelector('form');
    // Buscar el botón dentro del formulario
    const submitBtn = form.querySelector('button[type="submit"]');

    // Inputs
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const subjectInput = document.getElementById('subject');
    const phoneInput = document.getElementById('phone'); // Asegúrate que tu HTML tenga id="phone" si existe
    const messageInput = document.getElementById('message');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Validar campos básicos
            if (!nameInput.value || !emailInput.value || !messageInput.value) {
                showFeedback('Por favor completa los campos obligatorios.', 'error');
                return;
            }

            // 2. Estado de Carga (Loading)
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                </div>
            `;

            try {
                // 3. Preparar datos
                const formData = {
                    nombre: nameInput.value,
                    email: emailInput.value,
                    asunto: subjectInput ? subjectInput.value : 'Contacto Web',
                    telefono: phoneInput ? phoneInput.value : '',
                    mensaje: messageInput.value
                };

                // 4. Enviar al Backend
                const response = await window.API.post('/api/v1/contacto', formData);

                // 5. Manejar respuesta
                if (response.success) {
                    showFeedback(response.message, 'success');
                    form.reset();
                } else {
                    throw new Error(response.message || 'Error al enviar');
                }

            } catch (error) {
                console.error('Error contacto:', error);
                const msg = error.message || 'Hubo un error al enviar el mensaje. Intenta nuevamente.';
                showFeedback(msg, 'error');
            } finally {
                // Restaurar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                lucide.createIcons(); // Re-renderizar icono si se perdió
            }
        });
    }

    /**
     * Muestra un mensaje flotante (Toast)
     */
    function showFeedback(message, type) {
        // Crear elemento toast si no existe sistema de notificaciones global
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

        toast.className = `fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 translate-y-full z-50 flex items-center gap-3`;
        toast.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" class="w-5 h-5"></i>
            <span class="font-medium">${message}</span>
        `;

        document.body.appendChild(toast);
        lucide.createIcons();

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-full');
        });

        // Eliminar después de 3s
        setTimeout(() => {
            toast.classList.add('translate-y-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
});
