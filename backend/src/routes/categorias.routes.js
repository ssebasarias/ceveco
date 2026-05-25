const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const CategoriasController = require('../controllers/categorias.controller');
const { authMiddleware, requireAdmin } = require('../middleware');

// ── Public ─────────────────────────────────────────────────
// GET /api/v1/categorias  — active categories only
router.get('/', CategoriasController.getActivas);

// ── Admin ──────────────────────────────────────────────────
const adminValidations = {
    list: [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('q').optional().isString().trim()
    ],
    create: [
        body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
        body('slug').notEmpty().withMessage('El slug es requerido').trim(),
        body('descripcion').optional({ nullable: true }).isString(),
        body('imagen_url').optional({ nullable: true }).isString(),
        body('icono').optional({ nullable: true }).isString(),
        body('orden').optional({ nullable: true }).isInt({ min: 0 }),
        body('activo').optional().isBoolean()
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID inválido'),
        body('nombre').optional().notEmpty().trim(),
        body('slug').optional().notEmpty().trim(),
        body('descripcion').optional({ nullable: true }).isString(),
        body('imagen_url').optional({ nullable: true }).isString(),
        body('icono').optional({ nullable: true }).isString(),
        body('orden').optional({ nullable: true }).isInt({ min: 0 }),
        body('activo').optional().isBoolean()
    ],
    id: [param('id').isInt({ min: 1 }).withMessage('ID inválido')]
};

router.get('/admin/all', authMiddleware, requireAdmin, adminValidations.list, CategoriasController.adminList);
router.get('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, CategoriasController.adminGetById);
router.post('/admin', authMiddleware, requireAdmin, adminValidations.create, CategoriasController.adminCreate);
router.put('/admin/:id', authMiddleware, requireAdmin, adminValidations.update, CategoriasController.adminUpdate);
router.delete('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, CategoriasController.adminDelete);

module.exports = router;
