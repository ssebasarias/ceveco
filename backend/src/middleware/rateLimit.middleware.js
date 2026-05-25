const rateLimit = require('express-rate-limit');

// Global API limiter — 200 requests per minute per IP
const globalApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas peticiones. Esperá unos segundos.' }
});

module.exports = { globalApiLimiter };
