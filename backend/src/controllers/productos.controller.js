const ProductoService = require('../services/productos.service');
const { validationResult } = require('express-validator');

class ProductoController {
    /**
     * Obtener todos los productos con filtros
     * GET /api/v1/productos
     */
    async getAll(req, res) {
        try {
            // Validar errores de validación
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const result = await ProductoService.getProductos(req.query);
            res.json(result);
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtener un producto por ID
     * GET /api/v1/productos/:id
     */
    async getById(req, res) {
        try {
            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const result = await ProductoService.getProductoById(parseInt(id));
            res.json(result);
        } catch (error) {
            console.error('Error en getById:', error);

            if (error.message === 'Producto no encontrado') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al obtener el producto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtener productos destacados
     * GET /api/v1/productos/destacados
     */
    async getDestacados(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 8;
            const result = await ProductoService.getProductosDestacados(limit);
            res.json(result);
        } catch (error) {
            console.error('Error en getDestacados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos destacados',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obtener productos relacionados
     * GET /api/v1/productos/:id/relacionados
     */
    async getRelacionados(req, res) {
        try {
            const { id } = req.params;
            const limit = parseInt(req.query.limit) || 4;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const result = await ProductoService.getProductosRelacionados(parseInt(id), limit);
            res.json(result);
        } catch (error) {
            console.error('Error en getRelacionados:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener productos relacionados',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Buscar productos
     * GET /api/v1/productos/buscar?q=termino
     */
    async buscar(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Término de búsqueda requerido'
                });
            }

            const result = await ProductoService.buscarProductos(q, req.query);
            res.json(result);
        } catch (error) {
            console.error('Error en buscar:', error);
            res.status(500).json({
                success: false,
                message: 'Error al buscar productos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Verificar stock de un producto
     * GET /api/v1/productos/:id/stock?cantidad=5
     */
    async verificarStock(req, res) {
        try {
            const { id } = req.params;
            const cantidad = parseInt(req.query.cantidad) || 1;

            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            if (cantidad < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Cantidad debe ser mayor a 0'
                });
            }

            const result = await ProductoService.verificarStock(parseInt(id), cantidad);
            res.json(result);
        } catch (error) {
            console.error('Error en verificarStock:', error);
            res.status(500).json({
                success: false,
                message: 'Error al verificar stock',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    /**
     * Obtener atributos para filtros
     * GET /api/v1/productos/filtros?categoria=slug
     */
    async getFilters(req, res) {
        try {
            const { categoria } = req.query;
            if (!categoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Categoría requerida'
                });
            }

            const result = await ProductoService.getAttributes(categoria);
            res.json(result);
        } catch (error) {
            console.error('Error en getFilters:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener filtros',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new ProductoController();
