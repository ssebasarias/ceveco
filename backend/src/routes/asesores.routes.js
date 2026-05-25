const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const AsesorController = require('../controllers/asesor.controller');
const { authMiddleware, requireAdmin } = require('../middleware');

// ── Public ─────────────────────────────────────────────────
router.get('/', AsesorController.getAll);
router.get('/random', AsesorController.getRandom);
router.get('/:id', AsesorController.getById);

// ── Admin ──────────────────────────────────────────────────
const adminValidations = {
    list: [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('q').optional().isString().trim()
    ],
    create: [
        body('nombre_completo').notEmpty().withMessage('El nombre completo es requerido').trim(),
        body('telefono').optional({ nullable: true }).isString(),
        body('foto_url').optional({ nullable: true }).isString(),
        body('especialidad').optional({ nullable: true }).isString(),
        body('horario_atencion').optional({ nullable: true }).isString(),
        body('orden').optional({ nullable: true }).isInt({ min: 0 }),
        body('activo').optional().isBoolean()
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID inválido'),
        body('nombre_completo').optional().notEmpty().trim(),
        body('telefono').optional({ nullable: true }).isString(),
        body('foto_url').optional({ nullable: true }).isString(),
        body('especialidad').optional({ nullable: true }).isString(),
        body('horario_atencion').optional({ nullable: true }).isString(),
        body('orden').optional({ nullable: true }).isInt({ min: 0 }),
        body('activo').optional().isBoolean()
    ],
    id: [param('id').isInt({ min: 1 }).withMessage('ID inválido')]
};

router.get('/admin/all', authMiddleware, requireAdmin, adminValidations.list, AsesorController.adminList);
router.get('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, AsesorController.adminGetById);
router.post('/admin', authMiddleware, requireAdmin, adminValidations.create, AsesorController.adminCreate);
router.put('/admin/:id', authMiddleware, requireAdmin, adminValidations.update, AsesorController.adminUpdate);
router.delete('/admin/:id', authMiddleware, requireAdmin, adminValidations.id, AsesorController.adminDelete);

module.exports = router;
