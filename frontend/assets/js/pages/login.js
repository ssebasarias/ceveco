document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos Lucide
    if (window.lucide) lucide.createIcons();

    // Toggle password visibility (login page)
    window.togglePasswordLogin = function (inputId) {
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

    // Replace onclick attributes with listeners for better CSP
    const toggleButtons = document.querySelectorAll('button[onclick^="togglePasswordLogin"]');
    toggleButtons.forEach(btn => {
        const onclickVal = btn.getAttribute('onclick');
        if (onclickVal) {
            const match = onclickVal.match(/togglePasswordLogin\('(.+)'\)/);
            if (match && match[1]) {
                const inputId = match[1];
                btn.removeAttribute('onclick');
                btn.addEventListener('click', () => window.togglePasswordLogin(inputId));
            }
        }
    });

    // Handle form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                remember: document.getElementById('remember').checked
            };

            try {
                // Ensure auth methods are available
                if (window.handleLogin) {
                    const result = await window.handleLogin(formData);
                    if (result.success) {
                        alert('¡Bienvenido de nuevo!');
                        const redirectUrl = sessionStorage.getItem('redirect_after_login');
                        if (redirectUrl) {
                            sessionStorage.removeItem('redirect_after_login');
                            window.location.href = redirectUrl;
                        } else {
                            window.location.href = 'index.html';
                        }
                    }
                } else if (window.AuthService && window.AuthService.login) {
                    // Fallback if handleLogin wrapper is missing but service exists
                    const response = await window.AuthService.login(formData);
                    if (response.success || response.token) {
                        alert('¡Bienvenido de nuevo!');
                        window.location.href = 'index.html';
                    }
                } else {
                    console.error('Login method not found');
                }
            } catch (error) {
                console.error('Error en login:', error);
                alert('Email o contraseña incorrectos. Por favor intenta nuevamente.');
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
