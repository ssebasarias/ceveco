/**
 * Helpers y Utilidades Frontend
 * Funciones reutilizables para el frontend
 */

/**
 * Formatear precio en formato colombiano
 */
const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0
    }).format(price);
};

/**
 * Formatear fecha
 */
const formatDate = (date, options = {}) => {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };

    return new Date(date).toLocaleDateString('es-CO', defaultOptions);
};

/**
 * Formatear fecha relativa (hace X tiempo)
 */
const formatRelativeDate = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
        return formatDate(date);
    } else if (days > 0) {
        return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
        return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else {
        return 'Hace un momento';
    }
};

/**
 * Calcular porcentaje de descuento
 */
const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
        return 0;
    }

    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Truncar texto
 */
const truncate = (text, maxLength = 100, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Capitalizar primera letra
 */
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Validar email
 */
const isValidEmail = (email) => {
    return window.CONSTANTS.PATTERNS.EMAIL.test(email);
};

/**
 * Validar teléfono
 */
const isValidPhone = (phone) => {
    return window.CONSTANTS.PATTERNS.PHONE.test(phone);
};

/**
 * Sanitizar HTML básico
 */
const sanitizeHtml = (html) => {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
};

/**
 * Debounce function
 */
const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function
 */
const throttle = (func, limit = 300) => {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Parsear query string
 */
const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString || window.location.search);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
};

/**
 * Construir query string desde objeto
 */
const buildQueryString = (params) => {
    const filtered = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return filtered ? `?${filtered}` : '';
};

/**
 * Copiar texto al portapapeles
 */
const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error al copiar:', err);
        return false;
    }
};

/**
 * Generar ID único simple
 */
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Agrupar array por propiedad
 */
const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

/**
 * Ordenar array con función de comparación segura
 */
const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Remover duplicados de array
 */
const unique = (array, key = null) => {
    if (!key) return [...new Set(array)];

    const seen = new Set();
    return array.filter(item => {
        const k = item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
};

/**
 * Scroll suave a elemento
 */
const scrollToElement = (element, offset = 0) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    if (!element) return;

    const y = element.getBoundingClientRect().top + window.pageYOffset + offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
};

/**
 * Scroll al top de la página
 */
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Verificar si elemento está visible en viewport
 */
const isInViewport = (element) => {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }

    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

/**
 * Formatear número de teléfono
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return '';

    // Remover todo excepto números
    const cleaned = phone.replace(/\D/g, '');

    // Formatear según longitud
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    return phone;
};

/**
 * Validar archivo de imagen
 */
const isValidImageFile = (file) => {
    if (!file) return false;

    const { ALLOWED_IMAGE_TYPES, MAX_SIZE } = window.CONSTANTS.FILE_CONFIG;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { valid: false, error: 'Tipo de archivo no permitido' };
    }

    if (file.size > MAX_SIZE) {
        return { valid: false, error: 'El archivo es demasiado grande (máx. 5MB)' };
    }

    return { valid: true };
};

/**
 * Convertir archivo a base64
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Helpers = {
        formatPrice,
        formatDate,
        formatRelativeDate,
        calculateDiscount,
        truncate,
        capitalize,
        isValidEmail,
        isValidPhone,
        sanitizeHtml,
        debounce,
        throttle,
        parseQueryString,
        buildQueryString,
        copyToClipboard,
        generateId,
        groupBy,
        sortBy,
        unique,
        scrollToElement,
        scrollToTop,
        isInViewport,
        formatPhoneNumber,
        isValidImageFile,
        fileToBase64
    };
}
