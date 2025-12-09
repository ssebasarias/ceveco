/**
 * Constantes de la Aplicación
 * Valores constantes utilizados en toda la aplicación
 */

// Roles de usuario
const USER_ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    CLIENTE: 'cliente',
    VENDEDOR: 'vendedor'
};

// Estados de pedidos
const ORDER_STATUS = {
    PENDIENTE: 'pendiente',
    PROCESANDO: 'procesando',
    ENVIADO: 'enviado',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado',
    REEMBOLSADO: 'reembolsado'
};

// Métodos de autenticación
const AUTH_METHODS = {
    LOCAL: 'local',
    GOOGLE: 'google',
    FACEBOOK: 'facebook',
    GITHUB: 'github',
    APPLE: 'apple',
    MICROSOFT: 'microsoft'
};

// Métodos de pago
const PAYMENT_METHODS = {
    CARD: 'card',
    PSE: 'pse',
    NEQUI: 'nequi',
    BANCOLOMBIA: 'bancolombia',
    CASH: 'cash'
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

// Tipos de productos
const PRODUCT_TYPES = {
    FISICO: 'fisico',
    DIGITAL: 'digital',
    SERVICIO: 'servicio'
};

// Códigos de error personalizados
const ERROR_CODES = {
    // Autenticación (1xxx)
    NO_TOKEN: 'AUTH_1001',
    TOKEN_INVALID: 'AUTH_1002',
    TOKEN_EXPIRED: 'AUTH_1003',
    INVALID_CREDENTIALS: 'AUTH_1004',
    ACCOUNT_DISABLED: 'AUTH_1005',

    // Autorización (2xxx)
    FORBIDDEN: 'AUTHZ_2001',
    INSUFFICIENT_PERMISSIONS: 'AUTHZ_2002',

    // Validación (3xxx)
    VALIDATION_ERROR: 'VAL_3001',
    INVALID_ID: 'VAL_3002',
    MISSING_FIELDS: 'VAL_3003',

    // Base de datos (4xxx)
    DB_ERROR: 'DB_4001',
    DUPLICATE_ENTRY: 'DB_4002',
    NOT_FOUND: 'DB_4003',
    FOREIGN_KEY_ERROR: 'DB_4004',

    // Rate limiting (5xxx)
    RATE_LIMIT_EXCEEDED: 'RATE_5001',

    // Business logic (6xxx)
    INSUFFICIENT_STOCK: 'BL_6001',
    INVALID_ORDER: 'BL_6002',
    PAYMENT_FAILED: 'BL_6003'
};

// Mensajes de error estándar
const ERROR_MESSAGES = {
    [ERROR_CODES.NO_TOKEN]: 'Token de autenticación no proporcionado',
    [ERROR_CODES.TOKEN_INVALID]: 'Token inválido',
    [ERROR_CODES.TOKEN_EXPIRED]: 'Token expirado',
    [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales inválidas',
    [ERROR_CODES.ACCOUNT_DISABLED]: 'Cuenta desactivada',
    [ERROR_CODES.FORBIDDEN]: 'Acceso denegado',
    [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: 'Permisos insuficientes',
    [ERROR_CODES.VALIDATION_ERROR]: 'Datos de entrada inválidos',
    [ERROR_CODES.INVALID_ID]: 'ID inválido',
    [ERROR_CODES.MISSING_FIELDS]: 'Campos requeridos faltantes',
    [ERROR_CODES.DB_ERROR]: 'Error de base de datos',
    [ERROR_CODES.DUPLICATE_ENTRY]: 'El recurso ya existe',
    [ERROR_CODES.NOT_FOUND]: 'Recurso no encontrado',
    [ERROR_CODES.FOREIGN_KEY_ERROR]: 'Referencia inválida',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Límite de peticiones excedido',
    [ERROR_CODES.INSUFFICIENT_STOCK]: 'Stock insuficiente',
    [ERROR_CODES.INVALID_ORDER]: 'Pedido inválido',
    [ERROR_CODES.PAYMENT_FAILED]: 'Pago fallido'
};

// Límites de paginación
const PAGINATION_LIMITS = {
    DEFAULT: 12,
    MAX: 100,
    MIN: 1
};

// Configuración de archivos
const FILE_CONFIG = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    ALLOWED_IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

// Regex patterns
const PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/, // Min 8 chars, 1 upper, 1 lower, 1 number
    PHONE: /^[\d\s\-\+\(\)]+$/,
    URL: /^https?:\/\/.+/,
    SKU: /^[A-Z0-9\-]+$/,
    HEX_COLOR: /^#[0-9A-F]{6}$/i
};

// Valores por defecto
const DEFAULTS = {
    AVATAR: '/assets/img/default-avatar.png',
    PRODUCT_IMAGE: '/assets/img/default-product.png',
    CURRENCY: 'COP',
    LANGUAGE: 'es',
    TIMEZONE: 'America/Bogota'
};

module.exports = {
    USER_ROLES,
    ORDER_STATUS,
    AUTH_METHODS,
    PAYMENT_METHODS,
    DOCUMENT_TYPES,
    PAYMENT_STATUS,
    PRODUCT_TYPES,
    ERROR_CODES,
    ERROR_MESSAGES,
    PAGINATION_LIMITS,
    FILE_CONFIG,
    PATTERNS,
    DEFAULTS
};
