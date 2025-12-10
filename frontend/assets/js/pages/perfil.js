document.addEventListener('DOMContentLoaded', () => {
    // Check for window.AuthService first (the preferred way)
    // But since this simple profile page reads from localStorage directly in the original script:
    const session = JSON.parse(localStorage.getItem('ceveco_user_session') || '{}');
    if (session.user) {
        const nameEl = document.querySelector('.user-name');
        const emailEl = document.querySelector('.user-email');
        if (nameEl) nameEl.textContent = session.user.nombre + ' ' + (session.user.apellido || '');
        if (emailEl) emailEl.textContent = session.user.email;
    } else {
        window.location.href = 'login.html';
    }
});
