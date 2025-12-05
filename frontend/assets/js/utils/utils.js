/**
 * Utilidades y funciones helper
 */

const Utils = {
    /**
     * Formatear precio en pesos colombianos
     */
    formatPrice(price) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    /**
     * Calcular porcentaje de descuento
     */
    calculateDiscount(precioAnterior, precioActual) {
        if (!precioAnterior || precioAnterior <= precioActual) return 0;
        return Math.round(((precioAnterior - precioActual) / precioAnterior) * 100);
    },

    /**
     * Generar estrellas de calificación
     */
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let html = '';

        // Estrellas llenas
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="star-icon">★</i>';
        }

        // Media estrella
        if (hasHalfStar) {
            html += '<i class="star-icon half">★</i>';
        }

        // Estrellas vacías
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="star-icon empty">☆</i>';
        }

        return html;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Mostrar notificación toast
     */
    showToast(message, type = 'info') {
        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Agregar al DOM
        document.body.appendChild(toast);

        // Mostrar con animación
        setTimeout(() => toast.classList.add('show'), 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Obtener parámetros de URL
     */
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    },

    /**
     * Actualizar parámetros de URL sin recargar
     */
    updateUrlParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key]) {
                url.searchParams.set(key, params[key]);
            } else {
                url.searchParams.delete(key);
            }
        });
        window.history.pushState({}, '', url);
    },

    /**
     * Scroll suave a un elemento
     */
    smoothScroll(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    /**
     * Validar email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Truncar texto
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    /**
     * Generar URL de WhatsApp
     */
    getWhatsAppUrl(phone, message) {
        const cleanPhone = phone.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(message);
        return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    },

    /**
     * Lazy load de imágenes
     */
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    /**
     * Generar ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Hacer Utils disponible globalmente
if (typeof window !== 'undefined') {
    window.Utils = Utils;
    // Alias global para compatibilidad con cart.js
    window.formatPrice = Utils.formatPrice;
}
