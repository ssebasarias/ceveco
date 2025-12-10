const express = require('express');
const router = express.Router();
const WebhookController = require('../controllers/webhook.controller');

// Ruta pública para el Webhook de Wompi
// POST /api/v1/pagos/wompi-webhook
router.post('/wompi-webhook', WebhookController.handleWompiEvent);

module.exports = router;
