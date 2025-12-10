const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/address.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.createAddress);
router.delete('/:id', AddressController.deleteAddress);

module.exports = router;
