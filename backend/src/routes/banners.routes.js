const express = require('express');
const router = express.Router();
const { controller: BannersController, uploadBannerImageMiddleware } = require('../controllers/banners.controller');
const { authMiddleware, requireAdmin } = require('../middleware');
const { query, param, body } = require('express-validator');

// ============================================
// RUTAS ADMINISTRATIVAS (Requieren Auth + Admin Role)
// IMPORTANTE: Las rutas específicas deben estar ANTES de las rutas con parámetros
// ============================================

/**
 * @route   GET /api/v1/admin/banners
 * @desc    Obtener todos los banners (admin)
 * @access  Private (Admin only)
 * @query   {string} posicion - Filtrar por posición
 * @query   {boolean} activo - Filtrar por estado activo
 */
router.get('/',
    authMiddleware,
    requireAdmin,
    [
        query('posicion').optional().isIn(['hero', 'sidebar', 'footer', 'popup']),
        query('activo').optional().isBoolean()
    ],
    BannersController.getAll
);

// Crear un sub-router para las rutas de imágenes para evitar conflictos con /:posicion
const imagesRouter = express.Router();

/**
 * @route   GET /api/v1/admin/banners/images
 * @desc    Obtener lista de imágenes de banner-hero
 * @access  Private (Admin only)
 */
imagesRouter.get('/',
    authMiddleware,
    requireAdmin,
    BannersController.getBannerImages
);

/**
 * @route   POST /api/v1/admin/banners/images/upload
 * @desc    Subir imagen a banner-hero
 * @access  Private (Admin only)
 */
imagesRouter.post('/upload',
    authMiddleware,
    requireAdmin,
    (req, res, next) => {
        uploadBannerImageMiddleware(req, res, (err) => {
            if (err) {
                console.error('❌ Error en multer middleware:', err);
                console.error('   Mensaje:', err.message);
                console.error('   Stack:', err.stack);
                return res.status(400).json({
                    success: false,
                    message: err.message || 'Error al subir archivo',
                    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
                });
            }
            // Verificar que el archivo se guardó correctamente antes de continuar
            if (req.file) {
                console.log('✅ Archivo procesado por multer:', req.file.filename);
                console.log('   Ruta:', req.file.path);
            } else {
                console.warn('⚠️ Multer no procesó ningún archivo');
            }
            next();
        });
    },
    BannersController.uploadBannerImage
);

/**
 * @route   DELETE /api/v1/admin/banners/images/:filename
 * @desc    Eliminar imagen de banner-hero
 * @access  Private (Admin only)
 */
imagesRouter.delete('/:filename',
    authMiddleware,
    requireAdmin,
    [
        param('filename').notEmpty().withMessage('Nombre de archivo es requerido')
    ],
    BannersController.deleteBannerImage
);

// Montar el sub-router de imágenes ANTES de las rutas con parámetros
router.use('/images', imagesRouter);

/**
 * @route   GET /api/v1/admin/banners/:id
 * @desc    Obtener un banner por ID (admin)
 * @access  Private (Admin only)
 * NOTA: Esta ruta debe estar ANTES de /:posicion para evitar conflictos
 */
router.get('/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')
    ],
    BannersController.getById
);

/**
 * @route   GET /api/v1/banners/:posicion
 * @desc    Obtener banners activos por posición (público)
 * @access  Public
 * @param   {string} posicion - Posición del banner (hero, sidebar, footer, popup)
 * NOTA: Esta ruta debe estar AL FINAL, después de todas las rutas específicas y admin
 */
router.get('/:posicion',
    [
        param('posicion').isIn(['hero', 'sidebar', 'footer', 'popup']).withMessage('Posición inválida')
    ],
    BannersController.getActiveByPosition
);

/**
 * @route   POST /api/v1/admin/banners
 * @desc    Crear nuevo banner
 * @access  Private (Admin only)
 */
router.post('/',
    authMiddleware,
    requireAdmin,
    [
        body('titulo').notEmpty().withMessage('Título es requerido'),
        body('imagen_url').notEmpty().withMessage('URL de imagen es requerida'),
        body('posicion').optional().isIn(['hero', 'sidebar', 'footer', 'popup']),
        body('orden').optional().isInt({ min: 0 }),
        body('activo').optional().isBoolean(),
        body('fecha_inicio').optional().isISO8601(),
        body('fecha_fin').optional().isISO8601()
    ],
    BannersController.create
);

/**
 * @route   PUT /api/v1/admin/banners/:id
 * @desc    Actualizar banner existente
 * @access  Private (Admin only)
 */
router.put('/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('titulo').optional().isString(),
        body('imagen_url').optional().isString(),
        body('posicion').optional().isIn(['hero', 'sidebar', 'footer', 'popup']),
        body('orden').optional().isInt({ min: 0 }),
        body('activo').optional().isBoolean()
    ],
    BannersController.update
);

/**
 * @route   DELETE /api/v1/admin/banners/:id
 * @desc    Eliminar banner (soft delete por defecto)
 * @access  Private (Admin only)
 * @query   {boolean} permanent - Si es true, elimina permanentemente
 */
router.delete('/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')
    ],
    BannersController.delete
);

module.exports = router;
