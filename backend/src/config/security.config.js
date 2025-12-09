/**
 * Configuración de Seguridad (Helmet y CSP)
 * Políticas de seguridad HTTP centralizadas
 */

const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // TODO: Remover en producción y usar nonces
                "https://cdn.tailwindcss.com",
                "https://unpkg.com",
                "https://checkout.wompi.co",
                "https://accounts.google.com",
                "https://apis.google.com"
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // TODO: Remover en producción y usar nonces
                "https://fonts.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https://via.placeholder.com",
                "https://ceveco.com.co",
                "https://lh3.googleusercontent.com"
            ],
            connectSrc: [
                "'self'",
                "https://accounts.google.com",
                "https://oauth2.googleapis.com"
            ],
            frameSrc: [
                "'self'",
                "https://checkout.wompi.co",
                "https://accounts.google.com"
            ],
            upgradeInsecureRequests: null
        },
    },
    crossOriginEmbedderPolicy: false, // Deshabilitado por compatibilidad con CDNs
    crossOriginResourcePolicy: { policy: "cross-origin" }
};

/**
 * Configuración de CORS personalizada
 * @param {string} allowedOrigins - Orígenes permitidos separados por coma
 */
const getCorsConfig = (allowedOrigins = '*') => {
    // Si es '*', permitir todos los orígenes
    if (allowedOrigins === '*') {
        return {
            origin: function (origin, callback) {
                // Permitir requests sin origen (apps móviles, curl, postman)
                if (!origin) return callback(null, true);
                callback(null, true);
            },
            credentials: true,
            optionsSuccessStatus: 200
        };
    }

    // Si hay orígenes específicos, validarlos
    const whitelist = allowedOrigins.split(',').map(o => o.trim());

    return {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);

            if (whitelist.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200
    };
};

/**
 * Headers de seguridad adicionales
 */
const securityHeaders = (req, res, next) => {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');

    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection (legacy pero útil)
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions Policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
};

module.exports = {
    helmetConfig,
    getCorsConfig,
    securityHeaders
};
