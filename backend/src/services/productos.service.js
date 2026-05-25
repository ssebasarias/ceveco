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

        // Resolve sort shortcut → orderBy/orderDir
        let orderBy = filters.orderBy || 'fecha_creacion';
        let orderDir = filters.orderDir || 'DESC';
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':  orderBy = 'precio_actual'; orderDir = 'ASC';  break;
                case 'price_desc': orderBy = 'precio_actual'; orderDir = 'DESC'; break;
                case 'name_asc':   orderBy = 'nombre';        orderDir = 'ASC';  break;
                case 'newest':     orderBy = 'fecha_creacion'; orderDir = 'DESC'; break;
                case 'relevance':  orderBy = 'fecha_creacion'; orderDir = 'DESC'; break;
            }
        }

        // Precio: accept both precio_min/precio_max (new) and precioMin/precioMax (legacy)
        const precioMin = filters.precio_min != null ? parseFloat(filters.precio_min)
                        : filters.precioMin != null  ? parseFloat(filters.precioMin)
                        : undefined;
        const precioMax = filters.precio_max != null ? parseFloat(filters.precio_max)
                        : filters.precioMax != null  ? parseFloat(filters.precioMax)
                        : undefined;

        // Marca: accept CSV "1,5,12" or single id
        let marcaIds;
        const rawMarca = filters.marca;
        if (rawMarca) {
            if (String(rawMarca).includes(',')) {
                marcaIds = String(rawMarca).split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
            } else {
                const single = parseInt(rawMarca);
                if (!isNaN(single)) marcaIds = [single];
            }
        }

        // Preparar filtros
        const queryFilters = {
            categoria: filters.categoria,
            subcategoria: filters.subcategoria,
            marca: marcaIds,           // now an array or undefined
            precioMin,
            precioMax,
            destacado: filters.destacado === 'true' ? true : filters.destacado === 'false' ? false : undefined,
            busqueda: filters.q || filters.busqueda,
            stock: filters.stock === '1' || filters.stock === 1 ? true : undefined,
            rating: filters.rating ? parseFloat(filters.rating) : undefined,
            orderBy,
            orderDir,
            atributos: filters.atributos,
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
     * Obtener filtros completos: marcas con count, subcategorías con count, rango de precio
     * @param {string} categoriaSlug - Slug de categoría (opcional)
     * @returns {Promise<Object>}
     */
    async getFullFilters(categoriaSlug) {
        const params = categoriaSlug ? [categoriaSlug] : [];
        const catFilter = categoriaSlug ? `AND c.slug = $1` : '';

        const marcasSQL = `
            SELECT m.id_marca, m.nombre, COUNT(p.id_producto)::int AS count
            FROM marcas m
            JOIN productos p ON p.id_marca = m.id_marca AND p.activo = TRUE
            JOIN categorias c ON c.id_categoria = p.id_categoria
            WHERE 1=1 ${catFilter}
            GROUP BY m.id_marca, m.nombre
            HAVING COUNT(p.id_producto) > 0
            ORDER BY COUNT(p.id_producto) DESC, m.nombre ASC
        `;

        const subcategoriasSQL = `
            SELECT sc.id_subcategoria, sc.nombre, COUNT(p.id_producto)::int AS count
            FROM subcategorias sc
            JOIN productos p ON p.id_subcategoria = sc.id_subcategoria AND p.activo = TRUE
            JOIN categorias c ON c.id_categoria = p.id_categoria
            WHERE 1=1 ${catFilter}
            GROUP BY sc.id_subcategoria, sc.nombre
            HAVING COUNT(p.id_producto) > 0
            ORDER BY COUNT(p.id_producto) DESC, sc.nombre ASC
        `;

        const precioSQL = `
            SELECT MIN(p.precio_actual)::numeric AS min, MAX(p.precio_actual)::numeric AS max
            FROM productos p
            JOIN categorias c ON c.id_categoria = p.id_categoria
            WHERE p.activo = TRUE AND p.precio_actual IS NOT NULL
            ${catFilter}
        `;

        const [marcasResult, subcatsResult, precioResult] = await Promise.all([
            pool.query(marcasSQL, params),
            pool.query(subcategoriasSQL, params),
            pool.query(precioSQL, params)
        ]);

        const precio = precioResult.rows[0] || {};

        return {
            success: true,
            data: {
                marcas: marcasResult.rows,
                subcategorias: subcatsResult.rows,
                rango_precio: {
                    min: precio.min ? parseFloat(precio.min) : 0,
                    max: precio.max ? parseFloat(precio.max) : 100000000
                }
            }
        };
    }

    /**
     * Obtener filtros de atributos por categoría (legacy)
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
