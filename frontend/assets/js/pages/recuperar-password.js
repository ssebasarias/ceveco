document.addEventListener('DOMContentLoaded', () => {
    // Initialize icons if not already done by core
    if (window.lucide) {
        window.lucide.createIcons();
    }

    const form = document.getElementById('forgot-form');
    const btn = document.getElementById('btn-submit');
    const successMsg = document.getElementById('success-message');
    const emailInput = document.getElementById('email');

    if (!form || !btn || !successMsg || !emailInput) {
        console.error('Critical: Forgot password elements missing');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value;
        if (!email) return;

        // Loading State
        btn.disabled = true;
        btn.innerHTML = '<div class="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div> Enviando...';

        try {
            await AuthService.forgotPassword(email);

            // Siempre mostrar éxito por seguridad (User Enumeration Prevention)
            form.classList.add('hidden');
            successMsg.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
            // Even if it fails, for security we might want to act vague, but for real errors (network), alert is okay.
            alert('Ocurrió un error al intentar enviar el correo. Por favor intenta de nuevo.');

            // Reset button state
            btn.disabled = false;
            btn.innerHTML = '<span>Enviar Instrucciones</span><i data-lucide="arrow-right" class="w-4 h-4"></i>';
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    });
});
