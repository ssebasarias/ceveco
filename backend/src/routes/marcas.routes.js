const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const MarcasController = require('../controllers/marcas.controller');
const { authMiddleware, requireAdmin } = require('../middleware');

// ── Public ─────────────────────────────────────────────────
// GET /api/v1/marcas
router.get('/', MarcasController.getActivas);

// ── Admin ──────────────────────────────────────────────────
const adminValidations = {
    list: [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('q').optional().isString().trim()
    ],
    create: [
        body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
        body('logo_url').optional({ nullable: true }).isString(),
        body('descripcion').optional({ nullable: true }).isString(),
        body('sitio_web').optional({ nullable: true }).isString(),
        body('activo').optional().isBoolean()
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID inválido'),
        body('nombre').optional().notEmpty().trim(),
        body('logo_url').optional({ nullable: true }).isString(),
        body('descripcion').optional({ nullable: true }).isString(),
        body('sitio_web').optional({ nullable: true }).isString(),
        body('activo').optional().isBoolean()
    ],
    id: [param('id').isInt({ min: 1 }).withMessage('ID inválido')]
};

router.get('/admin/all', authMiddleware, requireAdmin, adminValidations.list, MarcasController.adminList);
router.get('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, MarcasController.adminGetById);
router.post('/admin', authMiddleware, requireAdmin, adminValidations.create, MarcasController.adminCreate);
router.put('/admin/:id', authMiddleware, requireAdmin, adminValidations.update, MarcasController.adminUpdate);
router.delete('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, MarcasController.adminDelete);

module.exports = router;
