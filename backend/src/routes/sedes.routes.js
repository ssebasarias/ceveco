const express = require('express');
const router = express.Router();
const SedeController = require('../controllers/sedes.controller');

router.get('/', SedeController.getAll);
router.get('/:id', SedeController.getById);

module.exports = router;
