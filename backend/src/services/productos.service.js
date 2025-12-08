const ProductoModel = require('../models/producto.model');

class ProductoService {
    /**
     * Obtener productos con paginación y filtros
     * @param {Object} filters - Filtros y opciones de paginación
     * @returns {Promise<Object>} Productos y metadata de paginación
     */
    async getProductos(filters = {}) {
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 12;
        const offset = (page - 1) * limit;

        // Preparar filtros
        const queryFilters = {
            categoria: filters.categoria,
            marca: filters.marca ? parseInt(filters.marca) : undefined,
            precioMin: filters.precioMin ? parseFloat(filters.precioMin) : undefined,
            precioMax: filters.precioMax ? parseFloat(filters.precioMax) : undefined,
            destacado: filters.destacado === 'true' ? true : filters.destacado === 'false' ? false : undefined,
            busqueda: filters.busqueda,
            orderBy: filters.orderBy || 'fecha_creacion',
            orderDir: filters.orderDir || 'DESC',
            atributos: filters.atributos, // Pass attributes filter
            limit,
            offset
        };

        // Obtener productos y total
        const [productos, total] = await Promise.all([
            ProductoModel.findAll(queryFilters),
            ProductoModel.count(queryFilters)
        ]);

        // Calcular metadata de paginación
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            success: true,
            data: productos,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        };
    }

    /**
     * Obtener un producto por ID
     * @param {number} id - ID del producto
     * @returns {Promise<Object>} Producto encontrado
     */
    async getProductoById(id) {
        const producto = await ProductoModel.findById(id);

        if (!producto) {
            throw new Error('Producto no encontrado');
        }

        // Incrementar vistas (sin esperar)
        ProductoModel.incrementViews(id).catch(err =>
            console.error('Error al incrementar vistas:', err)
        );

        return {
            success: true,
            data: producto
        };
    }

    /**
     * Obtener productos destacados
     * @param {number} limit - Número de productos
     * @returns {Promise<Object>} Productos destacados
     */
    async getProductosDestacados(limit = 8) {
        const productos = await ProductoModel.findFeatured(limit);

        return {
            success: true,
            data: productos
        };
    }

    /**
     * Obtener productos relacionados
     * @param {number} id - ID del producto
     * @param {number} limit - Número de productos
     * @returns {Promise<Object>} Productos relacionados
     */
    async getProductosRelacionados(id, limit = 4) {
        const productos = await ProductoModel.findRelated(id, limit);

        return {
            success: true,
            data: productos
        };
    }

    /**
     * Buscar productos
     * @param {string} query - Término de búsqueda
     * @param {Object} options - Opciones adicionales
     * @returns {Promise<Object>} Resultados de búsqueda
     */
    async buscarProductos(query, options = {}) {
        const filters = {
            busqueda: query,
            page: options.page || 1,
            limit: options.limit || 12,
            orderBy: options.orderBy || 'fecha_creacion',
            orderDir: options.orderDir || 'DESC'
        };

        return this.getProductos(filters);
    }

    /**
     * Verificar disponibilidad de stock
     * @param {number} id - ID del producto
     * @param {number} cantidad - Cantidad solicitada
     * @returns {Promise<Object>} Disponibilidad de stock
     */
    async verificarStock(id, cantidad) {
        const disponible = await ProductoModel.checkStock(id, cantidad);

        return {
            success: true,
            data: {
                disponible,
                mensaje: disponible
                    ? 'Stock disponible'
                    : 'Stock insuficiente'
            }
        };
    }
    /**
     * Obtener filtros de atributos por categoría
     * @param {string} categorySlug - Slug de categoría
     * @returns {Promise<Object>} Lista de atributos
     */
    async getAttributes(categorySlug) {
        const attributes = await ProductoModel.findAttributesByCategory(categorySlug);
        // Filter out attributes with no values (optional, but good UX)
        const activeAttributes = attributes.filter(attr => attr.valores && attr.valores.length > 0);

        return {
            success: true,
            data: activeAttributes
        };
    }
}

module.exports = new ProductoService();
