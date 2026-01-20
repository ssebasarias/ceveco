const express = require('express');
const router = express.Router();
const { controller: UploadController, uploadSingle } = require('../controllers/upload.controller');
const { authMiddleware, requireAdmin } = require('../middleware');

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

module.exports = router;
