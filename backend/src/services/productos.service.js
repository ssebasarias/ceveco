const ProductoModel = require('../models/producto.model');
const { pool } = require('../config/db');

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
            subcategoria: filters.subcategoria,
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
     * @returns {Promise<Object>} Lista de atributos y subcategorías
     */
    async getAttributes(categorySlug) {
        // Obtener atributos y subcategorías en paralelo
        const [attributes, subcategories] = await Promise.all([
            ProductoModel.findAttributesByCategory(categorySlug),
            ProductoModel.findSubcategoriesByCategory(categorySlug)
        ]);

        // Filter out attributes with no values (optional, but good UX)
        const activeAttributes = attributes.filter(attr => attr.valores && attr.valores.length > 0);

        return {
            success: true,
            data: {
                subcategorias: subcategories,
                atributos: activeAttributes
            }
        };
    }

    /**
     * Crear un nuevo producto
     * @param {Object} productData - Datos del producto
     * @returns {Promise<Object>} Resultado con el producto creado
     */
    async createProducto(productData) {
        try {
            // Validar SKU único
            const existingProduct = await ProductoModel.findBySku(productData.sku);
            if (existingProduct) {
                throw new Error('El SKU ya existe');
            }

            const producto = await ProductoModel.create(productData);

            // Agregar imágenes si se proporcionan
            if (productData.imagenes && Array.isArray(productData.imagenes) && productData.imagenes.length > 0) {
                for (let i = 0; i < productData.imagenes.length; i++) {
                    const imagenUrl = productData.imagenes[i];
                    if (imagenUrl && imagenUrl.trim()) {
                        await ProductoModel.addImage(
                            producto.id_producto,
                            imagenUrl.trim(),
                            i === 0, // Primera imagen es principal
                            i
                        );
                    }
                }
            }

            return {
                success: true,
                data: producto,
                message: 'Producto creado exitosamente'
            };
        } catch (error) {
            console.error('Error en createProducto:', error);
            throw error;
        }
    }

    /**
     * Actualizar un producto
     * @param {number} id - ID del producto
     * @param {Object} productData - Datos a actualizar
     * @returns {Promise<Object>} Resultado con el producto actualizado
     */
    async updateProducto(id, productData) {
        try {
            // Verificar que el producto existe
            const existingProduct = await ProductoModel.findById(id);
            if (!existingProduct) {
                throw new Error('Producto no encontrado');
            }

            // Si se cambia el SKU, verificar que no exista
            if (productData.sku && productData.sku !== existingProduct.sku) {
                const skuExists = await ProductoModel.findBySku(productData.sku);
                if (skuExists) {
                    throw new Error('El SKU ya existe');
                }
                // Agregar SKU a los campos a actualizar
                productData.sku = productData.sku;
            }

            const producto = await ProductoModel.update(id, productData);

            // Actualizar imágenes si se proporcionan
            if (productData.imagenes !== undefined) {
                // Eliminar imágenes existentes
                await ProductoModel.deleteImages(id);

                // Agregar nuevas imágenes
                if (Array.isArray(productData.imagenes) && productData.imagenes.length > 0) {
                    for (let i = 0; i < productData.imagenes.length; i++) {
                        const imagenUrl = productData.imagenes[i];
                        if (imagenUrl && imagenUrl.trim()) {
                            await ProductoModel.addImage(
                                id,
                                imagenUrl.trim(),
                                i === 0, // Primera imagen es principal
                                i
                            );
                        }
                    }
                }
            }

            return {
                success: true,
                data: producto,
                message: 'Producto actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error en updateProducto:', error);
            throw error;
        }
    }

    /**
     * Obtener todos los productos para el panel admin con filtros y paginación
     * @param {Object} options - Opciones de filtrado y paginación
     * @returns {Promise<Object>} Filas de productos y total
     */
    async getAllForAdmin({ page, limit, offset, q, activo, destacado, categoria, marca }) {
        const where = [];
        const params = [];

        if (q) {
            params.push(`%${q}%`);
            where.push(`(p.nombre ILIKE $${params.length} OR p.sku ILIKE $${params.length})`);
        }
        if (activo !== undefined) {
            params.push(activo === 'true');
            where.push(`p.activo = $${params.length}`);
        }
        if (destacado !== undefined) {
            params.push(destacado === 'true');
            where.push(`p.destacado = $${params.length}`);
        }
        if (categoria) {
            params.push(categoria);
            where.push(`c.slug = $${params.length}`);
        }
        if (marca) {
            params.push(marca);
            where.push(`m.slug = $${params.length}`);
        }

        const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const sql = `
            SELECT p.id_producto, p.sku, p.nombre, p.precio_actual, p.precio_anterior,
                   p.stock, p.activo, p.destacado, p.badge,
                   p.id_categoria, p.id_marca, p.id_subcategoria,
                   c.nombre AS categoria, m.nombre AS marca,
                   (SELECT url_imagen FROM producto_imagenes
                    WHERE id_producto = p.id_producto AND es_principal LIMIT 1) AS imagen
            FROM productos p
            JOIN categorias c ON c.id_categoria = p.id_categoria
            JOIN marcas m ON m.id_marca = p.id_marca
            ${whereSQL}
            ORDER BY p.id_producto DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countSql = `
            SELECT count(*) FROM productos p
            JOIN categorias c ON c.id_categoria = p.id_categoria
            JOIN marcas m ON m.id_marca = p.id_marca
            ${whereSQL}
        `;

        const [{ rows }, { rows: [{ count }] }] = await Promise.all([
            pool.query(sql, [...params, limit, offset]),
            pool.query(countSql, params)
        ]);

        return { rows, total: parseInt(count, 10) };
    }

    /**
     * Eliminar un producto
     * @param {number} id - ID del producto
     * @returns {Promise<Object>} Resultado de la operación
     */
    async deleteProducto(id) {
        try {
            // Verificar que el producto existe
            const existingProduct = await ProductoModel.findById(id);
            if (!existingProduct) {
                throw new Error('Producto no encontrado');
            }

            await ProductoModel.delete(id);

            return {
                success: true,
                message: 'Producto eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error en deleteProducto:', error);
            throw error;
        }
    }
}

module.exports = new ProductoService();
