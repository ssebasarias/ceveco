const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/admin.controller');
const { authMiddleware, requireAdmin } = require('../middleware');
const { param, body } = require('express-validator');

/**
 * @route   POST /api/v1/admin/backup
 * @desc    Generar backup de la base de datos
 * @access  Private (Admin only)
 */
router.post('/backup',
    authMiddleware,
    requireAdmin,
    AdminController.generateBackup
);

/**
 * @route   GET /api/v1/admin/backups
 * @desc    Listar backups disponibles
 * @access  Private (Admin only)
 */
router.get('/backups',
    authMiddleware,
    requireAdmin,
    AdminController.listBackups
);

/**
 * @route   PATCH /api/v1/admin/productos/:id/destacado
 * @desc    Marcar/desmarcar producto como destacado
 * @access  Private (Admin only)
 */
router.patch('/productos/:id/destacado',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('destacado').isBoolean().withMessage('El campo destacado debe ser un booleano')
    ],
    AdminController.toggleDestacado
);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Obtener estadísticas del sistema
 * @access  Private (Admin only)
 */
router.get('/stats',
    authMiddleware,
    requireAdmin,
    AdminController.getStats
);

// ============================================
// IMÁGENES DE PRODUCTO (admin)
// ============================================

/**
 * @route   GET /api/v1/admin/productos/:id/imagenes
 * @desc    Listar imágenes de un producto (ordenadas: principal primero, luego por `orden`)
 * @access  Private (Admin only)
 */
router.get('/productos/:id/imagenes',
    authMiddleware,
    requireAdmin,
    [param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')],
    AdminController.listImagenes.bind(AdminController)
);

/**
 * @route   POST /api/v1/admin/productos/:id/imagenes
 * @desc    Subir una imagen para el producto. Campo multipart: "imagen".
 *          La primera imagen del producto se marca automáticamente como principal.
 * @access  Private (Admin only)
 */
router.post('/productos/:id/imagenes',
    authMiddleware,
    requireAdmin,
    [param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')],
    (req, res, next) => {
        AdminController.productImageUpload.single('imagen')(req, res, (err) => {
            if (err) {
                // Mapear errores de multer a mensajes amigables para administradores no técnicos
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'El archivo es muy grande (máx 5 MB).'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error al subir el archivo'
                });
            }
            next();
        });
    },
    AdminController.uploadImagen.bind(AdminController)
);

/**
 * @route   DELETE /api/v1/admin/productos/:id/imagenes/:imageId
 * @desc    Eliminar una imagen de un producto. Si era principal, se promueve la siguiente.
 * @access  Private (Admin only)
 */
router.delete('/productos/:id/imagenes/:imageId',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        param('imageId').isInt({ min: 1 }).withMessage('ID de imagen inválido')
    ],
    AdminController.deleteImagen.bind(AdminController)
);

/**
 * @route   PATCH /api/v1/admin/productos/:id/imagen-principal
 * @desc    Marcar una imagen como principal para un producto
 * @access  Private (Admin only)
 */
router.patch('/productos/:id/imagen-principal',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('imagen_id').isInt({ min: 1 }).withMessage('imagen_id debe ser un entero válido')
    ],
    AdminController.setImagenPrincipal.bind(AdminController)
);

/**
 * @route   PATCH /api/v1/admin/productos/:id/imagenes/orden
 * @desc    Reordenar la galería de imágenes
 * @body    { orden: [id_imagen, ...] }
 * @access  Private (Admin only)
 */
router.patch('/productos/:id/imagenes/orden',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('orden').isArray({ min: 1 }).withMessage('orden debe ser un array no vacío')
    ],
    AdminController.reordenarImagenes.bind(AdminController)
);

/**
 * @route   POST /api/v1/admin/productos/:id/scrape
 * @desc    Disparar scraping puntual de un producto. Responde 202 inmediato y procesa en background.
 *          Depende del script `scripts/scraping/fetch-product-data.js` (Pista A).
 * @access  Private (Admin only)
 */
router.post('/productos/:id/scrape',
    authMiddleware,
    requireAdmin,
    [param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')],
    AdminController.scrapeProducto.bind(AdminController)
);

module.exports = router;
