/**
 * Utilidades Generales
 * Funciones helper reutilizables en toda la aplicación
 */

const crypto = require('crypto');

/**
 * Generar ID único
 */
const generateId = () => {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * Generar token seguro
 */
const generateSecureToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Esperar tiempo específico (útil para delays en tests o retry logic)
 */
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Capitalizar primera letra de un string
 */
const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Generar slug desde texto
 */
const generateSlug = (text) => {
    if (!text) return '';

    return text
        .toString()
        .toLowerCase()
        .normalize('NFD') // Descomponer caracteres unicode
        .replace(/[\u0300-\u036f]/g, '') // Remover diacríticos
        .trim()
        .replace(/\s+/g, '-') // Espacios a guiones
        .replace(/[^\w\-]+/g, '') // Remover caracteres no alfanuméricos
        .replace(/\-\-+/g, '-') // Múltiples guiones a uno solo
        .replace(/^-+/, '') // Remover guiones al inicio
        .replace(/-+$/, ''); // Remover guiones al final
};

/**
 * Formatear precio
 */
const formatPrice = (price, currency = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 0
    }).format(price);
};

/**
 * Parsear query string a objeto
 */
const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};

    for (const [key, value] of params) {
        result[key] = value;
    }

    return result;
};

/**
 * Validar email
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Sanitizar HTML (básico)
 */
const sanitizeHtml = (html) => {
    if (!html) return '';

    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Truncar texto
 */
const truncate = (text, maxLength = 100, suffix = '...') => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + suffix;
};

/**
 * Remover valores nulos/undefined de objeto
 */
const removeNullish = (obj) => {
    const cleaned = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== '') {
            cleaned[key] = value;
        }
    }

    return cleaned;
};

/**
 * Deep clone de objeto
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Generar código alfanumérico aleatorio
 */
const generateCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
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
 * Formatear fecha a string legible
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
 * Verificar si es objeto vacío
 */
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0;
};

/**
 * Generar hash de string
 */
const hashString = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Retry con backoff exponencial
 */
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;

            const delay = baseDelay * Math.pow(2, i);
            await sleep(delay);
        }
    }
};

module.exports = {
    generateId,
    generateSecureToken,
    sleep,
    capitalize,
    generateSlug,
    formatPrice,
    parseQueryString,
    isValidEmail,
    sanitizeHtml,
    truncate,
    removeNullish,
    deepClone,
    generateCode,
    calculateDiscount,
    groupBy,
    formatDate,
    isEmptyObject,
    hashString,
    retryWithBackoff
};
