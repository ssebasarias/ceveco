const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const SedeController = require('../controllers/sedes.controller');
const { authMiddleware, requireAdmin } = require('../middleware');

// ── Public ─────────────────────────────────────────────────
router.get('/', SedeController.getAll);
router.get('/:id', SedeController.getById);

// ── Admin ──────────────────────────────────────────────────
const adminValidations = {
    list: [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('q').optional().isString().trim()
    ],
    create: [
        body('nombre').notEmpty().withMessage('El nombre es requerido').trim(),
        body('ciudad').notEmpty().withMessage('La ciudad es requerida').trim(),
        body('direccion').notEmpty().withMessage('La dirección es requerida').trim(),
        body('codigo').optional({ nullable: true }).isString(),
        body('departamento').optional({ nullable: true }).isString(),
        body('telefono').optional({ nullable: true }).isString(),
        body('celular').optional({ nullable: true }).isString(),
        body('email').optional({ nullable: true }).isEmail(),
        body('whatsapp').optional({ nullable: true }).isString(),
        body('latitud').optional({ nullable: true }).isFloat(),
        body('longitud').optional({ nullable: true }).isFloat(),
        body('horario_atencion').optional({ nullable: true }).isString(),
        body('es_principal').optional().isBoolean(),
        body('activo').optional().isBoolean()
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID inválido'),
        body('nombre').optional().notEmpty().trim(),
        body('ciudad').optional().notEmpty().trim(),
        body('direccion').optional().notEmpty().trim(),
        body('codigo').optional({ nullable: true }).isString(),
        body('departamento').optional({ nullable: true }).isString(),
        body('telefono').optional({ nullable: true }).isString(),
        body('celular').optional({ nullable: true }).isString(),
        body('email').optional({ nullable: true }).isEmail(),
        body('whatsapp').optional({ nullable: true }).isString(),
        body('latitud').optional({ nullable: true }).isFloat(),
        body('longitud').optional({ nullable: true }).isFloat(),
        body('horario_atencion').optional({ nullable: true }).isString(),
        body('es_principal').optional().isBoolean(),
        body('activo').optional().isBoolean()
    ],
    id: [param('id').isInt({ min: 1 }).withMessage('ID inválido')]
};

router.get('/admin/all', authMiddleware, requireAdmin, adminValidations.list,
    (req, res) => SedeController.adminList(req, res));
router.get('/admin/:id', authMiddleware, requireAdmin, adminValidations.id,
    (req, res) => SedeController.adminGetById(req, res));
router.post('/admin', authMiddleware, requireAdmin, adminValidations.create,
    (req, res) => SedeController.adminCreate(req, res));
router.put('/admin/:id', authMiddleware, requireAdmin, adminValidations.update,
    (req, res) => SedeController.adminUpdate(req, res));
router.delete('/admin/:id', authMiddleware, requireAdmin, adminValidations.id,
    (req, res) => SedeController.adminDelete(req, res));

module.exports = router;
