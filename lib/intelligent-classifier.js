/**
 * 🤖 Clasificador Inteligente con IA
 * Aprende de ejemplos y consulta la BD para clasificar productos
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Pool } = require('pg');

class IntelligentClassifier {
    constructor(apiKey, dbConfig) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        this.pool = new Pool(dbConfig);

        // Cache de categorías y subcategorías existentes
        this.categoriesCache = null;
        this.subcategoriesCache = null;
    }

    /**
     * Cargar categorías y subcategorías existentes de la BD
     */
    async loadExistingCategories() {
        const client = await this.pool.connect();

        try {
            // Cargar las 4 categorías principales
            const categoriesResult = await client.query(`
        SELECT id_categoria, nombre, descripcion 
        FROM categorias 
        ORDER BY id_categoria
      `);

            // Cargar todas las subcategorías existentes
            const subcategoriesResult = await client.query(`
        SELECT s.id_subcategoria, s.id_categoria, s.nombre, s.descripcion, c.nombre as categoria_nombre
        FROM subcategorias s
        JOIN categorias c ON s.id_categoria = c.id_categoria
        ORDER BY s.id_categoria, s.id_subcategoria
      `);

            // Cargar marcas existentes
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
     * Clasificar producto usando IA + BD
     */
    async classifyProduct(productData) {
        // Asegurar que tenemos los datos de la BD
        if (!this.categoriesCache) {
            await this.loadExistingCategories();
        }

        const prompt = `
Eres un experto en clasificación de productos para e-commerce. Tu tarea es clasificar un producto en la estructura de categorías correcta.

REGLAS ESTRICTAS:
1. Solo existen 4 CATEGORÍAS PRINCIPALES (FIJAS):
   ${this.categoriesCache.map(c => `- ${c.nombre} (ID: ${c.id_categoria})`).join('\n   ')}

2. SUBCATEGORÍAS EXISTENTES en la base de datos:
${this.subcategoriesCache.map(s => `   - ${s.categoria_nombre} → ${s.nombre} (ID: ${s.id_subcategoria})`).join('\n')}

3. MARCAS EXISTENTES:
${this.brandsCache.map(b => `   - ${b.nombre} (ID: ${b.id_marca})`).join('\n')}

PRODUCTO A CLASIFICAR:
- Referencia: ${productData.ref}
- Nombre/Descripción: ${productData.nombre}
- Categoría del Excel: ${productData.categoria}
- Archivo origen: ${productData.archivo}

TAREA:
1. Determina a cuál de las 4 CATEGORÍAS PRINCIPALES pertenece
2. Busca si existe una SUBCATEGORÍA apropiada en la lista
3. Si NO existe subcategoría apropiada, sugiere crear una nueva (con nombre descriptivo)
4. Detecta la MARCA del producto
5. Si la marca no existe, sugiere crearla
6. Identifica ATRIBUTOS clave (NO confundir con categorías)

EJEMPLOS DE CLASIFICACIÓN:

Ejemplo 1 - Colchón:
Entrada: "SEMIORTOPEDICO CSO 90 - 15 cm"
Salida:
- Categoría: "Muebles y Organización" (ID: 2)
- Subcategoría: "Colchones" (crear si no existe)
- Marca: "Comodisimos" (crear si no existe)
- Atributos: [
    {"nombre": "Tipo", "valor": "Semiortopédico"},
    {"nombre": "Medida", "valor": "90 x 15 cm"}
  ]

Ejemplo 2 - Moto:
Entrada: "WAVE 110S CBS Modelo 2026"
Salida:
- Categoría: "Motos" (ID: 3)
- Subcategoría: "Motos Urbanas" (usar existente o crear)
- Marca: "Honda" (usar existente)
- Atributos: [
    {"nombre": "Modelo", "valor": "Wave 110S CBS"},
    {"nombre": "Año", "valor": "2026"},
    {"nombre": "Cilindraje", "valor": "110cc"}
  ]

Ejemplo 3 - TV:
Entrada: "TV LG 32" HD Smart TV WebOS"
Salida:
- Categoría: "Electro Hogar" (ID: 1)
- Subcategoría: "Televisores" (usar existente ID: 4)
- Marca: "LG" (usar existente ID: 5)
- Atributos: [
    {"nombre": "Tamaño de Pantalla", "valor": "32", "unidad": "pulgadas"},
    {"nombre": "Resolución", "valor": "HD"},
    {"nombre": "Smart TV", "valor": "Sí"},
    {"nombre": "Sistema Operativo", "valor": "webOS"}
  ]

IMPORTANTE:
- Si la subcategoría existe, usa su ID
- Si no existe, indica "crear" y sugiere un nombre apropiado
- Los atributos como "Semiortopédico" NO son categorías ni subcategorías
- Para motos, la referencia suele ser el nombre del modelo

FORMATO DE RESPUESTA (JSON):
{
  "categoria": {
    "nombre": "...",
    "id": X,
    "confianza": 0.95
  },
  "subcategoria": {
    "nombre": "...",
    "id": X o null,
    "accion": "usar_existente" o "crear_nueva",
    "razon": "..."
  },
  "marca": {
    "nombre": "...",
    "id": X o null,
    "accion": "usar_existente" o "crear_nueva"
  },
  "atributos": [
    {"nombre": "...", "valor": "...", "unidad": "..."}
  ],
  "nombre_sugerido": "Nombre completo y descriptivo del producto"
}
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extraer JSON de la respuesta
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const classification = JSON.parse(jsonMatch[0]);

                // Si necesita crear subcategoría, hacerlo
                if (classification.subcategoria.accion === 'crear_nueva') {
                    classification.subcategoria.id = await this.createSubcategory(
                        classification.categoria.id,
                        classification.subcategoria.nombre
                    );
                }

                // Si necesita crear marca, hacerlo
                if (classification.marca.accion === 'crear_nueva') {
                    classification.marca.id = await this.createBrand(
                        classification.marca.nombre
                    );
                }

                return classification;
            }

            throw new Error('No se pudo parsear la respuesta de la IA');

        } catch (error) {
            console.error('Error en clasificación:', error.message);

            // Fallback: clasificación básica
            return {
                categoria: { nombre: 'Electro Hogar', id: 1, confianza: 0.5 },
                subcategoria: { nombre: null, id: null, accion: 'ninguna', razon: 'Error en IA' },
                marca: { nombre: 'Genérica', id: 1, accion: 'usar_existente' },
                atributos: [],
                nombre_sugerido: productData.nombre
            };
        }
    }

    /**
     * Crear nueva subcategoría si no existe
     */
    async createSubcategory(id_categoria, nombre) {
        const client = await this.pool.connect();

        try {
            // Verificar si ya existe (por si acaso)
            const existing = await client.query(
                'SELECT id_subcategoria FROM subcategorias WHERE nombre ILIKE $1 AND id_categoria = $2',
                [nombre, id_categoria]
            );

            if (existing.rows.length > 0) {
                console.log(`  ℹ️  Subcategoría "${nombre}" ya existe (ID: ${existing.rows[0].id_subcategoria})`);
                return existing.rows[0].id_subcategoria;
            }

            // Crear nueva
            const result = await client.query(
                'INSERT INTO subcategorias (id_categoria, nombre, activo) VALUES ($1, $2, true) RETURNING id_subcategoria',
                [id_categoria, nombre]
            );

            const newId = result.rows[0].id_subcategoria;
            console.log(`  ✅ Nueva subcategoría creada: "${nombre}" (ID: ${newId})`);

            // Actualizar cache
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

    /**
     * Crear nueva marca si no existe
     */
    async createBrand(nombre) {
        const client = await this.pool.connect();

        try {
            // Verificar si ya existe
            const existing = await client.query(
                'SELECT id_marca FROM marcas WHERE nombre ILIKE $1',
                [nombre]
            );

            if (existing.rows.length > 0) {
                console.log(`  ℹ️  Marca "${nombre}" ya existe (ID: ${existing.rows[0].id_marca})`);
                return existing.rows[0].id_marca;
            }

            // Crear nueva
            const result = await client.query(
                'INSERT INTO marcas (nombre, activo) VALUES ($1, true) RETURNING id_marca',
                [nombre]
            );

            const newId = result.rows[0].id_marca;
            console.log(`  ✅ Nueva marca creada: "${nombre}" (ID: ${newId})`);

            // Actualizar cache
            this.brandsCache.push({ id_marca: newId, nombre });

            return newId;

        } finally {
            client.release();
        }
    }

    /**
     * Cerrar conexiones
     */
    async close() {
        await this.pool.end();
    }
}

module.exports = IntelligentClassifier;
