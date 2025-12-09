const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productos.controller');
const { authMiddleware, requireAdmin } = require('../middleware');
const { query, param, body } = require('express-validator');

/**
 * @route   GET /api/v1/productos
 * @desc    Obtener todos los productos con filtros y paginación
 * @access  Public
 * @query   {string} categoria - Slug de la categoría
 * @query   {number} marca - ID de la marca
 * @query   {number} precioMin - Precio mínimo
 * @query   {number} precioMax - Precio máximo
 * @query   {boolean} destacado - Solo productos destacados
 * @query   {string} busqueda - Término de búsqueda
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Productos por página (default: 12)
 * @query   {string} orderBy - Campo de ordenamiento (default: fecha_creacion)
 * @query   {string} orderDir - Dirección de ordenamiento ASC/DESC (default: DESC)
 */
router.get('/',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
        query('precioMin').optional().isFloat({ min: 0 }).withMessage('Precio mínimo debe ser mayor o igual a 0'),
        query('precioMax').optional().isFloat({ min: 0 }).withMessage('Precio máximo debe ser mayor o igual a 0'),
        query('marca').optional().isInt().withMessage('ID de marca debe ser un número'),
        query('orderBy').optional().isIn(['precio_actual', 'nombre', 'fecha_creacion', 'calificacion_promedio', 'ventas_totales'])
            .withMessage('Campo de ordenamiento inválido'),
        query('orderDir').optional().isIn(['ASC', 'DESC']).withMessage('Dirección de ordenamiento debe ser ASC o DESC')
    ],
    ProductoController.getAll
);

/**
 * @route   GET /api/v1/productos/destacados
 * @desc    Obtener productos destacados
 * @access  Public
 * @query   {number} limit - Número de productos (default: 8)
 */
router.get('/destacados',
    [
        query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Límite debe estar entre 1 y 50')
    ],
    ProductoController.getDestacados
);

/**
 * @route   GET /api/v1/productos/buscar
 * @desc    Buscar productos por término
 * @access  Public
 * @query   {string} q - Término de búsqueda (requerido)
 * @query   {number} page - Número de página
 * @query   {number} limit - Productos por página
 */
router.get('/buscar',
    [
        query('q').notEmpty().withMessage('Término de búsqueda requerido'),
        query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100')
    ],
    ProductoController.buscar
);

/**
 * @route   GET /api/v1/productos/filtros
 * @desc    Obtener filtros por categoría
 * @access  Public
 * @query   {string} categoria - Slug de la categoría
 */
router.get('/filtros',
    [
        query('categoria').notEmpty().withMessage('Categoría requerida')
    ],
    ProductoController.getFilters
);

/**
 * @route   GET /api/v1/productos/:id
 * @desc    Obtener un producto por ID
 * @access  Public
 * @param   {number} id - ID del producto
 */
router.get('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')
    ],
    ProductoController.getById
);

/**
 * @route   GET /api/v1/productos/:id/relacionados
 * @desc    Obtener productos relacionados
 * @access  Public
 * @param   {number} id - ID del producto
 * @query   {number} limit - Número de productos (default: 4)
 */
router.get('/:id/relacionados',
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Límite debe estar entre 1 y 20')
    ],
    ProductoController.getRelacionados
);

/**
 * @route   GET /api/v1/productos/:id/stock
 * @desc    Verificar disponibilidad de stock
 * @access  Public
 * @param   {number} id - ID del producto
 * @query   {number} cantidad - Cantidad a verificar (default: 1)
 */
router.get('/:id/stock',
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        query('cantidad').optional().isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
    ],
    ProductoController.verificarStock
);

// ============================================
// RUTAS ADMINISTRATIVAS (Requieren Auth + Admin Role)
// ============================================

/**
 * @route   POST /api/v1/productos
 * @desc    Crear nuevo producto
 * @access  Private (Admin only)
 */
router.post('/',
    authMiddleware,
    requireAdmin,
    [
        body('nombre').notEmpty().withMessage('Nombre es requerido'),
        body('descripcion').optional().isString(),
        body('precio_actual').isFloat({ min: 0 }).withMessage('Precio debe ser un número positivo'),
        body('precio_anterior').optional().isFloat({ min: 0 }),
        body('id_categoria').isInt().withMessage('Categoría es requerida'),
        body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número positivo'),
        body('id_marca').optional().isInt(),
        body('sku').optional().isString(),
        body('badge').optional().isString()
    ],
    ProductoController.create
);

/**
 * @route   PUT /api/v1/productos/:id
 * @desc    Actualizar producto existente
 * @access  Private (Admin only)
 */
router.put('/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('nombre').optional().isString(),
        body('descripcion').optional().isString(),
        body('precio_actual').optional().isFloat({ min: 0 }),
        body('precio_anterior').optional().isFloat({ min: 0 }),
        body('stock').optional().isInt({ min: 0 }),
        body('activo').optional().isBoolean(),
        body('destacado').optional().isBoolean(),
        body('badge').optional().isString()
    ],
    ProductoController.update
);

/**
 * @route   DELETE /api/v1/productos/:id
 * @desc    Eliminar producto (soft delete - marca como inactivo)
 * @access  Private (Admin only)
 */
router.delete('/:id',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido')
    ],
    ProductoController.delete
);

/**
 * @route   PATCH /api/v1/productos/:id/stock
 * @desc    Actualizar solo el stock del producto
 * @access  Private (Admin only)
 */
router.patch('/:id/stock',
    authMiddleware,
    requireAdmin,
    [
        param('id').isInt({ min: 1 }).withMessage('ID debe ser un número válido'),
        body('stock').isInt({ min: 0 }).withMessage('Stock debe ser un número positivo'),
        body('operacion').optional().isIn(['set', 'increment', 'decrement']).withMessage('Operación debe ser set, increment o decrement')
    ],
    ProductoController.updateStock
);

module.exports = router;
