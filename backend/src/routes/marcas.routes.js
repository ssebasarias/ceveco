const express = require('express');
const router = express.Router();
const MarcasController = require('../controllers/marcas.controller');

/**
 * @route   GET /api/v1/marcas
 * @desc    Obtener todas las marcas activas
 * @access  Public
 */
router.get('/', MarcasController.getActivas);

module.exports = router;
