/**
 * Configuración Centralizada de la Aplicación
 * Administra variables de entorno y configuraciones globales
 */

require('dotenv').config();

const config = {
    // Configuración del servidor
    server: {
        port: parseInt(process.env.PORT) || 3000,
        env: process.env.NODE_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || '/api/v1',
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV === 'development'
    },

    // Configuración de base de datos
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME || 'ceveco_db',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
        idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
        connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000
    },

    // Configuración de autenticación
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
        cookieName: 'jwt_token',
        bcryptRounds: 12,
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
    },

    // Configuración de cookies
    cookies: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    },

    // Configuración de CORS
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
        optionsSuccessStatus: 200
    },

    // Configuración de archivos
    files: {
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
        allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
    },

    // Configuración de rate limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000,
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100
    },

    // Configuración de paginación
    pagination: {
        defaultPage: 1,
        defaultLimit: 12,
        maxLimit: 100
    },

    // URLs y dominios
    urls: {
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        backendUrl: process.env.BACKEND_URL || 'http://localhost:3000',
        apiUrl: process.env.API_URL || 'http://localhost:3000/api/v1'
    },

    // Servicios externos
    external: {
        wompi: {
            publicKey: process.env.WOMPI_PUBLIC_KEY,
            privateKey: process.env.WOMPI_PRIVATE_KEY,
            eventsSecret: process.env.WOMPI_EVENTS_SECRET,
            webhookUrl: process.env.WOMPI_WEBHOOK_URL
        },
        email: {
            service: process.env.EMAIL_SERVICE || 'gmail',
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASSWORD,
            from: process.env.EMAIL_FROM || 'noreply@ceveco.com'
        }
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    }
};

/**
 * Validar configuraciones críticas
 * Lanza error si faltan configuraciones esenciales en producción
 */
const validateConfig = () => {
    const errors = [];

    // JWT Secret es obligatorio
    if (!config.auth.jwtSecret) {
        errors.push('JWT_SECRET no está definido en las variables de entorno');
    }

    // En producción, verificar configuraciones críticas
    if (config.server.isProduction) {
        if (!config.database.password) {
            errors.push('DB_PASSWORD es requerida en producción');
        }
        if (config.cors.origin === '*') {
            errors.push('CORS_ORIGIN debe ser configurado en producción');
        }
    }

    if (errors.length > 0) {
        console.error('❌ Errores de configuración:');
        errors.forEach(err => console.error(`   - ${err}`));
        throw new Error('Configuración inválida. Revisa las variables de entorno.');
    }
};

// Validar configuración al cargar el módulo
validateConfig();

module.exports = config;
