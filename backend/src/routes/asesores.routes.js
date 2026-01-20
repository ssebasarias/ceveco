const express = require('express');
const router = express.Router();
const AsesorController = require('../controllers/asesor.controller');

// GET /api/v1/asesores - Obtener todos los asesores
router.get('/', AsesorController.getAll);

// GET /api/v1/asesores/random - Obtener un asesor aleatorio
router.get('/random', AsesorController.getRandom);

// GET /api/v1/asesores/:id - Obtener un asesor por ID
router.get('/:id', AsesorController.getById);

module.exports = router;
