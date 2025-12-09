document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos Lucide
    if (window.lucide) lucide.createIcons();

    // Toggle password visibility (register page)
    window.togglePasswordRegister = function (inputId) {
        const input = document.getElementById(inputId);
        const btn = input.parentElement.querySelector('button');
        const icon = btn ? btn.querySelector('i') : null;

        if (input.type === 'password') {
            input.type = 'text';
            if (icon) icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = 'password';
            if (icon) icon.setAttribute('data-lucide', 'eye');
        }
        // Re‑render Lucide icons only if we have an icon to update
        if (icon && window.lucide) lucide.createIcons();
    };

    // Attach event listeners for toggle buttons
    const toggleButtons = document.querySelectorAll('button[onclick^="togglePasswordRegister"]');
    toggleButtons.forEach(btn => {
        // Remove onclick attribute to be safe against CSP (though listener takes precedence)
        const onclickVal = btn.getAttribute('onclick');
        if (onclickVal) {
            const match = onclickVal.match(/togglePasswordRegister\('(.+)'\)/);
            if (match && match[1]) {
                const inputId = match[1];
                btn.removeAttribute('onclick');
                btn.addEventListener('click', () => window.togglePasswordRegister(inputId));
            }
        }
    });

    // Handle form submission
    const form = document.getElementById('registro-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                nombre: document.getElementById('nombre').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                password: document.getElementById('password').value,
                confirmPassword: document.getElementById('confirm-password').value
            };

            // Validar que las contraseñas coincidan
            if (formData.password !== formData.confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }

            // Validar longitud de contraseña
            if (formData.password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            if (typeof window.handleRegistro === 'function') {
                try {
                    const result = await window.handleRegistro(formData);
                    if (result.success) {
                        alert('¡Registro exitoso! Bienvenido a Ceveco');
                        const redirectUrl = sessionStorage.getItem('redirect_after_login');
                        if (redirectUrl) {
                            sessionStorage.removeItem('redirect_after_login');
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                } catch (error) {
                    console.error('Error en registro:', error);
                    alert('Error al crear la cuenta. Por favor intenta nuevamente.');
                }
            } else {
                console.error('handleRegistro not defined');
            }
        });
    }

    // Google Sign In Button
    const googleBtn = document.querySelector('button[onclick="handleGoogleSignIn()"]');
    if (googleBtn) {
        googleBtn.removeAttribute('onclick');
        googleBtn.addEventListener('click', handleGoogleSignIn);
    }
});

// Google Sign In
function handleGoogleSignIn() {
    if (window.loginWithGoogle) {
        window.loginWithGoogle();
    } else {
        console.error('El módulo de autenticación no se ha cargado correctamente');
        alert('Error al cargar la autenticación. Por favor recarga la página.');
    }
}
