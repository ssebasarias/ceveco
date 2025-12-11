const express = require('express');
const router = express.Router();
const AddressController = require('../controllers/address.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', AddressController.getAddresses);
router.post('/', AddressController.createAddress);
router.put('/:id', AddressController.updateAddress);
router.delete('/:id', AddressController.deleteAddress);

module.exports = router;
