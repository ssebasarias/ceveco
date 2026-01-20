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

module.exports = router;
