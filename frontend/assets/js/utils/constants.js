/**
 * Constantes del Frontend
 * Valores constantes utilizados en toda la aplicación frontend
 * ⚠️ Sincronizado con backend/src/utils/constants.js
 */

// Estados de pedidos (sincronizado con backend)
const ORDER_STATUS = {
    PENDIENTE: 'pendiente',
    PROCESANDO: 'procesando',
    ENVIADO: 'enviado',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado',
    REEMBOLSADO: 'reembolsado'
};

// Estados de pedidos - Labels para UI
const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDIENTE]: 'Pendiente',
    [ORDER_STATUS.PROCESANDO]: 'Procesando',
    [ORDER_STATUS.ENVIADO]: 'Enviado',
    [ORDER_STATUS.ENTREGADO]: 'Entregado',
    [ORDER_STATUS.CANCELADO]: 'Cancelado',
    [ORDER_STATUS.REEMBOLSADO]: 'Reembolsado'
};

// Estados de pedidos - Colores para UI
const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDIENTE]: 'yellow',
    [ORDER_STATUS.PROCESANDO]: 'blue',
    [ORDER_STATUS.ENVIADO]: 'purple',
    [ORDER_STATUS.ENTREGADO]: 'green',
    [ORDER_STATUS.CANCELADO]: 'red',
    [ORDER_STATUS.REEMBOLSADO]: 'gray'
};

// Roles de usuario (sincronizado con backend)
const USER_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    CLIENTE: 'cliente',
    VENDEDOR: 'vendedor'
};

// Métodos de autenticación
const AUTH_METHODS = {
    LOCAL: 'local',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github'
};

// Métodos de pago
const PAYMENT_METHODS = {
    CARD: 'card',
    PSE: 'pse',
    NEQUI: 'nequi',
    BANCOLOMBIA: 'bancolombia',
    CASH: 'cash'
};

// Métodos de pago - Labels para UI
const PAYMENT_METHOD_LABELS = {
    [PAYMENT_METHODS.CARD]: 'Tarjeta de Crédito/Débito',
    [PAYMENT_METHODS.PSE]: 'PSE',
    [PAYMENT_METHODS.NEQUI]: 'Nequi',
    [PAYMENT_METHODS.BANCOLOMBIA]: 'Bancolombia',
    [PAYMENT_METHODS.CASH]: 'Efectivo'
};

// Tipos de documento
const DOCUMENT_TYPES = {
    CC: 'CC',
    CE: 'CE',
    TI: 'TI',
    NIT: 'NIT',
    PASSPORT: 'PASSPORT'
};

// Estados de pago
const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    DECLINED: 'DECLINED',
    VOIDED: 'VOIDED',
    ERROR: 'ERROR'
};

// Límites de paginación
const PAGINATION_LIMITS = {
    DEFAULT: 12,
    MAX: 100,
    MIN: 1
};

// Mensajes de error comunes
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Error de conexión. Por favor verifica tu conexión a internet.',
    SERVER_ERROR: 'Error del servidor. Por favor intenta de nuevo más tarde.',
    UNAUTHORIZED: 'Debes iniciar sesión para realizar esta acción.',
    FORBIDDEN: 'No tienes permiso para realizar esta acción.',
    NOT_FOUND: 'El recurso solicitado no fue encontrado.',
    VALIDATION_ERROR: 'Por favor verifica los datos ingresados.',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.'
};

// Mensajes de éxito comunes
const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: '¡Bienvenido!',
    LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
    REGISTER_SUCCESS: 'Registro exitoso. ¡Bienvenido a Ceveco!',
    PROFILE_UPDATED: 'Perfil actualizado correctamente',
    PASSWORD_CHANGED: 'Contraseña cambiada correctamente',
    ITEM_ADDED_CART: 'Producto agregado al carrito',
    ITEM_REMOVED_CART: 'Producto eliminado del carrito',
    ITEM_ADDED_FAVORITES: 'Agregado a favoritos',
    ITEM_REMOVED_FAVORITES: 'Eliminado de favoritos',
    ORDER_CREATED: 'Pedido creado exitosamente'
};

// Regex patterns para validaciones
const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^.{6,}$/, // Mínimo 6 caracteres
    PHONE: /^[\d\s\-\+\(\)]+$/,
    NUMBER: /^\d+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/
};

// Configuración de archivos
const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

// Tiempos (en milisegundos)
const TIMEOUTS = {
    TOAST_DURATION: 3000,
    DEBOUNCE_SEARCH: 300,
    API_TIMEOUT: 10000,
    SESSION_CHECK_INTERVAL: 60000 // 1 minuto
};

// Keys de localStorage
const STORAGE_KEYS = {
    CART: 'ceveco_cart',
    FAVORITES: 'ceveco_favorites',
    USER_SESSION: 'ceveco_user_session',
    THEME: 'ceveco_theme',
    FILTERS: 'ceveco_filters'
};

// Eventos personalizados
const CUSTOM_EVENTS = {
    CART_UPDATED: 'cart:updated',
    FAVORITES_UPDATED: 'favorites:updated',
    USER_LOGGED_IN: 'user:loggedIn',
    USER_LOGGED_OUT: 'user:loggedOut',
    PROFILE_UPDATED: 'profile:updated'
};

// Endpoints de API (complementa config.js)
const API_PATHS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        VERIFY: '/auth/verify',
        PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        OAUTH: '/auth/oauth'
    },
    PRODUCTS: {
        LIST: '/productos',
        DETAIL: (id) => `/productos/${id}`,
        FEATURED: '/productos/destacados',
        RELATED: (id) => `/productos/${id}/relacionados`,
        SEARCH: '/productos/buscar',
        STOCK: (id) => `/productos/${id}/stock`,
        FILTERS: '/productos/filtros'
    },
    FAVORITES: {
        LIST: '/favoritos',
        IDS: '/favoritos/ids',
        TOGGLE: '/favoritos/toggle'
    },
    ORDERS: {
        LIST: '/orders',
        CREATE: '/orders',
        DETAIL: (id) => `/orders/${id}`
    },
    MARCAS: {
        LIST: '/marcas'
    }
};

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CONSTANTS = {
        ORDER_STATUS,
        ORDER_STATUS_LABELS,
        ORDER_STATUS_COLORS,
        USER_ROLES,
        AUTH_METHODS,
        PAYMENT_METHODS,
        PAYMENT_METHOD_LABELS,
        DOCUMENT_TYPES,
        PAYMENT_STATUS,
        PAGINATION_LIMITS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        PATTERNS,
        FILE_CONFIG,
        TIMEOUTS,
        STORAGE_KEYS,
        CUSTOM_EVENTS,
        API_PATHS,
        SEDES_CONTACT: [
            { nombre: 'RIOSUCIO', telefono: '6068592032', whatsapp: '576068592032', ciudad: 'Riosucio, Caldas' },
            { nombre: 'SUPIA', telefono: '3127449591', whatsapp: '573127449591', ciudad: 'Supía, Caldas' },
            { nombre: 'ANSERMA', telefono: '3128859141', whatsapp: '573128859141', ciudad: 'Anserma, Caldas' },
            { nombre: 'LA PINTADA', telefono: '3146302935', whatsapp: '573146302935', ciudad: 'La Pintada, Antioquia' },
            { nombre: 'LA VIRGINIA', telefono: '3105348479', whatsapp: '573105348479', ciudad: 'La Virginia, Risaralda' }
        ]
    };
}
