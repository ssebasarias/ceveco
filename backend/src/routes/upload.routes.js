const express = require('express');
const router = express.Router();
const { controller: UploadController, productoController: ProductoImageController, uploadSingle, uploadProductoSingle } = require('../controllers/upload.controller');
const { authMiddleware, requireAdmin } = require('../middleware');
const { param } = require('express-validator');

/**
 * @route   POST /api/v1/admin/upload/image
 * @desc    Subir imagen de producto
 * @access  Private (Admin only)
 */
router.post('/image',
    authMiddleware,
    requireAdmin,
    (req, res, next) => {
        uploadSingle(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error al subir archivo'
                });
            }
            next();
        });
    },
    UploadController.uploadImage
);

/**
 * @route   POST /api/v1/admin/upload/producto/:id
 * @desc    Subir imagen de producto (sharp: webp + jpg + thumb)
 * @access  Private (Admin only)
 */
router.post('/producto/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')
    ],
    (req, res, next) => {
        uploadProductoSingle(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error al subir archivo'
                });
            }
            next();
        });
    },
    ProductoImageController.uploadProductoImage.bind(ProductoImageController)
);

module.exports = router;
