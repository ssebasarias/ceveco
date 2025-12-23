/**
 * 🤖 Clasificador Basado en Reglas Inteligentes
 * No requiere API externa, usa patrones y lógica
 */

const { Pool } = require('pg');

class RuleBasedClassifier {
    constructor(dbConfig) {
        this.pool = new Pool(dbConfig);
        this.categoriesCache = null;
        this.subcategoriesCache = null;
        this.brandsCache = null;
    }

    /**
     * Cargar datos de la BD
     */
    async loadExistingCategories() {
        const client = await this.pool.connect();

        try {
            const categoriesResult = await client.query(`
        SELECT id_categoria, nombre, descripcion 
        FROM categorias 
        ORDER BY id_categoria
      `);

            const subcategoriesResult = await client.query(`
        SELECT s.id_subcategoria, s.id_categoria, s.nombre, s.descripcion, c.nombre as categoria_nombre
        FROM subcategorias s
        JOIN categorias c ON s.id_categoria = c.id_categoria
        ORDER BY s.id_categoria, s.id_subcategoria
      `);

            const brandsResult = await client.query(`
        SELECT id_marca, nombre 
        FROM marcas 
        ORDER BY id_marca
      `);

            this.categoriesCache = categoriesResult.rows;
            this.subcategoriesCache = subcategoriesResult.rows;
            this.brandsCache = brandsResult.rows;

            console.log(`✅ Cargadas: ${this.categoriesCache.length} categorías, ${this.subcategoriesCache.length} subcategorías, ${this.brandsCache.length} marcas`);

        } finally {
            client.release();
        }
    }

    /**
     * Clasificar producto usando reglas
     */
    async classifyProduct(productData) {
        if (!this.categoriesCache) {
            await this.loadExistingCategories();
        }

        const text = `${productData.ref} ${productData.nombre} ${productData.categoria} ${productData.archivo}`.toUpperCase();

        // Detectar categoría principal
        const categoria = this.detectCategory(text);

        // Detectar subcategoría
        const subcategoria = await this.detectSubcategory(text, categoria.id);

        // Detectar marca
        const marca = this.detectBrand(text);

        // Extraer atributos
        const atributos = this.extractAttributes(text, productData);

        // Generar nombre sugerido
        const nombre_sugerido = this.generateProductName(productData, marca.nombre, atributos);

        return {
            categoria,
            subcategoria,
            marca,
            atributos,
            nombre_sugerido
        };
    }

    /**
     * Detectar categoría principal (1 de 4)
     */
    detectCategory(text) {
        // Motos
        if (text.match(/MOTO|WAVE|AX4|CB|XR|HONDA|SUZUKI|YAMAHA|MODELO 202/)) {
            return { nombre: 'Motos', id: 3, confianza: 0.95 };
        }

        // STIHL
        if (text.match(/STIHL|MOTOSIERRA|GUADAÑA|SOPLADOR|DESBROZADORA/)) {
            return { nombre: 'Herramientas STIHL', id: 4, confianza: 0.95 };
        }

        // Muebles
        if (text.match(/COLCHON|SEMIORTOPEDICO|ORTOPEDICO|PILLOW|ESCRITORIO|SILLA|MESA|ARCHIVADOR|CSO|COP|COMODISIMOS|MAXIMUEBLES|INVAL/)) {
            return { nombre: 'Muebles y Organización', id: 2, confianza: 0.9 };
        }

        // Electro Hogar (default)
        return { nombre: 'Electro Hogar', id: 1, confianza: 0.85 };
    }

    /**
     * Detectar subcategoría
     */
    async detectSubcategory(text, id_categoria) {
        let subcategoria_nombre = null;
        let crear = false;

        // Buscar en subcategorías existentes primero
        const existing = this.subcategoriesCache.filter(s => s.id_categoria === id_categoria);

        for (const sub of existing) {
            if (text.includes(sub.nombre.toUpperCase())) {
                return {
                    nombre: sub.nombre,
                    id: sub.id_subcategoria,
                    accion: 'usar_existente',
                    razon: `Subcategoría "${sub.nombre}" encontrada en texto`
                };
            }
        }

        // Si no existe, determinar cuál crear
        if (id_categoria === 1) { // Electro Hogar
            if (text.match(/TV|TELEVISOR|PANTALLA|SMART TV/)) subcategoria_nombre = 'Televisores';
            else if (text.match(/NEVERA|REFRIGERADOR|FRIGOBAR/)) subcategoria_nombre = 'Neveras';
            else if (text.match(/LAVADORA|SECADORA/)) subcategoria_nombre = 'Lavadoras';
            else if (text.match(/ESTUFA|COCINA/)) subcategoria_nombre = 'Estufas';
            else if (text.match(/AIRE|ACONDICIONADO/)) subcategoria_nombre = 'Aires Acondicionados';
            else if (text.match(/CABINA|PARLANTE|SOUND|AUDIO|BOCINA/)) subcategoria_nombre = 'Audio y Sonido';
            else subcategoria_nombre = 'Electrodomésticos';

        } else if (id_categoria === 2) { // Muebles
            if (text.match(/COLCHON|SEMIORTOPEDICO|ORTOPEDICO|CSO|COP/)) subcategoria_nombre = 'Colchones';
            else if (text.match(/ESCRITORIO|DESK/)) subcategoria_nombre = 'Escritorios';
            else if (text.match(/SILLA|ASIENTO/)) subcategoria_nombre = 'Sillas';
            else if (text.match(/ARCHIVADOR|GAVETA/)) subcategoria_nombre = 'Archivadores';
            else subcategoria_nombre = 'Muebles';

        } else if (id_categoria === 3) { // Motos
            if (text.match(/WAVE|110|125|URBAN|CITY/)) subcategoria_nombre = 'Motos Urbanas';
            else if (text.match(/CB|XR|SPORT|150|190/)) subcategoria_nombre = 'Motos Deportivas';
            else subcategoria_nombre = 'Motos';

        } else if (id_categoria === 4) { // STIHL
            if (text.match(/MOTOSIERRA|SIERRA|GTA|MS/)) subcategoria_nombre = 'Motosierras';
            else if (text.match(/GUADAÑA|DESBROZADORA|FS/)) subcategoria_nombre = 'Guadañas';
            else if (text.match(/SOPLADOR|BG|BR/)) subcategoria_nombre = 'Sopladores';
            else subcategoria_nombre = 'Herramientas';
        }

        // Verificar si ya existe con nombre similar
        const similar = existing.find(s =>
            s.nombre.toLowerCase().includes(subcategoria_nombre.toLowerCase()) ||
            subcategoria_nombre.toLowerCase().includes(s.nombre.toLowerCase())
        );

        if (similar) {
            return {
                nombre: similar.nombre,
                id: similar.id_subcategoria,
                accion: 'usar_existente',
                razon: `Subcategoría similar "${similar.nombre}" encontrada`
            };
        }

        // Crear nueva
        const newId = await this.createSubcategory(id_categoria, subcategoria_nombre);

        return {
            nombre: subcategoria_nombre,
            id: newId,
            accion: 'crear_nueva',
            razon: `Nueva subcategoría "${subcategoria_nombre}" creada`
        };
    }

    /**
     * Detectar marca
     */
    detectBrand(text) {
        const brands = [
            { nombre: 'LG', keywords: ['LG', '32LR', '43LM', '50UA'] },
            { nombre: 'Samsung', keywords: ['SAMSUNG', 'UN', 'QN'] },
            { nombre: 'Kalley', keywords: ['KALLEY', 'K-GTV', 'K-LED', 'CORBETA'] },
            { nombre: 'Haceb', keywords: ['HACEB', 'NEV', 'LAV'] },
            { nombre: 'Honda', keywords: ['HONDA', 'WAVE', 'CB', 'XR'] },
            { nombre: 'Suzuki', keywords: ['SUZUKI', 'AX4', 'GN'] },
            { nombre: 'Hyundai', keywords: ['HYUNDAI', 'HYLED'] },
            { nombre: 'STIHL', keywords: ['STIHL', 'MS', 'FS', 'BG', 'GTA'] },
            { nombre: 'Inval', keywords: ['INVAL', 'AR'] },
            { nombre: 'Comodisimos', keywords: ['COMODISIMOS', 'CSO', 'COP', 'SEMIORTOPEDICO', 'ORTOPEDICO'] },
            { nombre: 'Maximuebles', keywords: ['MAXIMUEBLES'] }
        ];

        for (const brand of brands) {
            for (const keyword of brand.keywords) {
                if (text.includes(keyword)) {
                    // Buscar en BD
                    const existing = this.brandsCache.find(b =>
                        b.nombre.toLowerCase() === brand.nombre.toLowerCase()
                    );

                    if (existing) {
                        return {
                            nombre: existing.nombre,
                            id: existing.id_marca,
                            accion: 'usar_existente'
                        };
                    } else {
                        return {
                            nombre: brand.nombre,
                            id: null,
                            accion: 'crear_nueva'
                        };
                    }
                }
            }
        }

        return {
            nombre: 'Genérica',
            id: 1,
            accion: 'usar_existente'
        };
    }

    /**
     * Extraer atributos
     */
    extractAttributes(text, productData) {
        const atributos = [];

        // Tamaño de pantalla
        const sizeMatch = text.match(/(\d+)["'']/);
        if (sizeMatch) {
            atributos.push({
                nombre: 'Tamaño de Pantalla',
                valor: sizeMatch[1],
                unidad: 'pulgadas'
            });
        }

        // Año/Modelo
        const yearMatch = text.match(/202[4-9]/);
        if (yearMatch) {
            atributos.push({
                nombre: 'Año Modelo',
                valor: yearMatch[0]
            });
        }

        // Tipo de colchón
        if (text.includes('SEMIORTOPEDICO')) {
            atributos.push({ nombre: 'Tipo', valor: 'Semiortopédico' });
        } else if (text.includes('ORTOPEDICO')) {
            atributos.push({ nombre: 'Tipo', valor: 'Ortopédico' });
        } else if (text.includes('PILLOW')) {
            atributos.push({ nombre: 'Tipo', valor: 'Pillow Top' });
        }

        // Medidas (colchones)
        const measureMatch = text.match(/(\d+)\s*X\s*(\d+)/);
        if (measureMatch) {
            atributos.push({
                nombre: 'Medida',
                valor: `${measureMatch[1]} x ${measureMatch[2]} cm`
            });
        }

        return atributos;
    }

    /**
     * Generar nombre del producto
     */
    generateProductName(productData, marca, atributos) {
        let nombre = productData.nombre;

        // Si el nombre es solo un año (motos)
        if (nombre.match(/^\d{4}$/) || nombre.match(/^MODELO \d{4}$/i)) {
            nombre = `${marca} ${productData.ref} Modelo ${nombre.replace(/MODELO\s*/i, '')}`;
        }
        return nombre;
    }

    /**
     * Crear subcategoría
     */
    async createSubcategory(id_categoria, nombre) {
        const client = await this.pool.connect();

        try {
            const existing = await client.query(
                'SELECT id_subcategoria FROM subcategorias WHERE nombre ILIKE $1 AND id_categoria = $2',
                [nombre, id_categoria]
            );

            if (existing.rows.length > 0) {
                return existing.rows[0].id_subcategoria;
            }

            // Generar slug
            const slug = nombre
                .toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales
                .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio/fin

            const result = await client.query(
                'INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
                [id_categoria, nombre, slug]
            );

            const newId = result.rows[0].id_subcategoria;
            console.log(`  ✅ Nueva subcategoría: "${nombre}" (ID: ${newId}, slug: ${slug})`);

            this.subcategoriesCache.push({
                id_subcategoria: newId,
                id_categoria,
                nombre,
                categoria_nombre: this.categoriesCache.find(c => c.id_categoria === id_categoria).nombre
            });

            return newId;

        } finally {
            client.release();
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = RuleBasedClassifier;
