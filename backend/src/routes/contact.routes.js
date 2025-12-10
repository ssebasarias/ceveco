const express = require('express');
const router = express.Router();
const ContactController = require('../controllers/contact.controller');

// Rate Limiter simple para evitar spam (opcional, recomendado para prod)
const rateLimit = require('express-rate-limit');
const contactLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: { success: false, message: 'Has enviado demasiados mensajes. Intenta de nuevo más tarde.' }
});

router.post('/', contactLimiter, ContactController.sendContactEmail);

module.exports = router;
