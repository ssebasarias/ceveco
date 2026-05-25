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
 * @query   {string} marca - ID(s) de marca, puede ser CSV: "1,5,12"
 * @query   {number} precio_min - Precio mínimo
 * @query   {number} precio_max - Precio máximo
 * @query   {number} subcategoria - ID de subcategoría
 * @query   {boolean} destacado - Solo productos destacados
 * @query   {string} q - Término de búsqueda
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Productos por página (default: 12)
 * @query   {string} sort - relevance|price_asc|price_desc|name_asc
 * @query   {number} stock - 1 = solo con stock disponible
 * @query   {number} rating - calificación mínima
 */
router.get('/',
    [
        query('page').optional().isInt({ min: 1 }).withMessage('Página debe ser un número mayor a 0'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite debe estar entre 1 y 100'),
        query('precio_min').optional().isFloat({ min: 0 }).withMessage('Precio mínimo debe ser mayor o igual a 0'),
        query('precio_max').optional().isFloat({ min: 0 }).withMessage('Precio máximo debe ser mayor o igual a 0'),
        // Legacy param names (keep for backwards compat)
        query('precioMin').optional().isFloat({ min: 0 }),
        query('precioMax').optional().isFloat({ min: 0 }),
        query('sort').optional().isIn(['relevance', 'price_asc', 'price_desc', 'name_asc', 'newest']).withMessage('Sort inválido'),
        query('stock').optional().isIn(['0', '1']).withMessage('stock debe ser 0 o 1'),
        query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('rating debe estar entre 0 y 5'),
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
 * @route   GET /api/v1/productos/filters
 * @route   GET /api/v1/productos/filtros  (legacy alias)
 * @desc    Obtener filtros completos: marcas, subcategorías, rango de precio
 * @access  Public
 * @query   {string} categoria - Slug de la categoría (opcional)
 */
router.get('/filters', ProductoController.getFilters);
router.get('/filtros', ProductoController.getFilters);

/**
 * @route   GET /api/v1/productos/admin/all
 * @desc    Obtener todos los productos con campos completos para el panel admin
 * @access  Private (Admin only - JWT cookie)
 * @query   {number} page - Número de página (default: 1)
 * @query   {number} limit - Productos por página (default: 25)
 * @query   {string} q - Búsqueda por nombre o SKU
 * @query   {boolean} activo - Filtrar por estado activo
 * @query   {boolean} destacado - Filtrar por destacado
 * @query   {string} categoria - Slug de categoría
 * @query   {string} marca - Slug de marca
 */
router.get(
    '/admin/all',
    authMiddleware,
    requireAdmin,
    [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('q').optional().isString().trim(),
        query('activo').optional().isIn(['true', 'false']),
        query('destacado').optional().isIn(['true', 'false']),
        query('categoria').optional().isString().trim(),
        query('marca').optional().isString().trim()
    ],
    ProductoController.getAllForAdmin
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
 * @route   POST /api/v1/productos/admin/bulk-action
 * @desc    Acción masiva sobre productos
 * @access  Private (Admin only)
 */
router.post(
    '/admin/bulk-action',
    authMiddleware,
    requireAdmin,
    [
        body('action')
            .isIn(['activate', 'deactivate', 'destacar', 'undestacar', 'delete'])
            .withMessage('Acción debe ser activate, deactivate, destacar, undestacar o delete'),
        body('ids')
            .isArray({ min: 1 })
            .withMessage('Se requiere un array de IDs con al menos un elemento'),
        body('ids.*')
            .isInt({ min: 1 })
            .withMessage('Cada ID debe ser un entero positivo')
    ],
    ProductoController.bulkAction
);

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
        body('sku').optional().isString(),
        body('descripcion_corta').optional().isString(),
        body('descripcion_larga').optional().isString(),
        body('precio_actual').optional().isFloat({ min: 0 }),
        body('precio_anterior').optional().isFloat({ min: 0 }),
        body('stock').optional().isInt({ min: 0 }),
        body('id_categoria').optional().isInt({ min: 1 }),
        body('id_subcategoria').optional().isInt({ min: 1 }),
        body('id_marca').optional().isInt({ min: 1 }),
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
