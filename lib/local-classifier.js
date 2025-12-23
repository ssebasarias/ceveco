/**
 * 🤖 Clasificador Inteligente con Ollama (100% Gratis, Local)
 * No requiere API keys ni internet
 */

const axios = require('axios');
const { Pool } = require('pg');

class LocalIntelligentClassifier {
    constructor(dbConfig, ollamaUrl = 'http://localhost:11434') {
        this.ollamaUrl = ollamaUrl;
        this.pool = new Pool(dbConfig);
        this.model = 'llama3.1'; // Modelo open source

        this.categoriesCache = null;
        this.subcategoriesCache = null;
        this.brandsCache = null;
    }

    /**
     * Verificar que Ollama esté corriendo
     */
    async checkOllama() {
        try {
            const response = await axios.get(`${this.ollamaUrl}/api/tags`);
            const models = response.data.models || [];
            const hasModel = models.some(m => m.name.includes(this.model));

            if (!hasModel) {
                console.log(`⚠️  Modelo ${this.model} no encontrado`);
                console.log(`   Ejecuta: ollama pull ${this.model}`);
                return false;
            }

            console.log(`✅ Ollama corriendo con modelo ${this.model}`);
            return true;

        } catch (error) {
            console.error('❌ Ollama no está corriendo');
            console.log('   Inicia Ollama primero: https://ollama.ai');
            return false;
        }
    }

    /**
     * Cargar categorías y subcategorías existentes de la BD
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
     * Llamar a Ollama para clasificación
     */
    async callOllama(prompt) {
        try {
            const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
                model: this.model,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: 0.3, // Más determinístico
                    top_p: 0.9
                }
            });

            return response.data.response;

        } catch (error) {
            console.error('Error llamando a Ollama:', error.message);
            throw error;
        }
    }

    /**
     * Clasificar producto usando Ollama local
     */
    async classifyProduct(productData) {
        if (!this.categoriesCache) {
            await this.loadExistingCategories();
        }

        const prompt = `Eres un experto en clasificación de productos. Clasifica el siguiente producto.

CATEGORÍAS PRINCIPALES (solo 4 opciones):
${this.categoriesCache.map(c => `${c.id_categoria}. ${c.nombre}`).join('\n')}

SUBCATEGORÍAS EXISTENTES:
${this.subcategoriesCache.map(s => `- ${s.categoria_nombre} → ${s.nombre} (ID: ${s.id_subcategoria})`).join('\n')}

MARCAS EXISTENTES:
${this.brandsCache.slice(0, 20).map(b => `- ${b.nombre}`).join(', ')}

PRODUCTO:
Referencia: ${productData.ref}
Nombre: ${productData.nombre}
Categoría Excel: ${productData.categoria}

TAREA:
1. Selecciona UNA de las 4 categorías principales
2. Si existe subcategoría apropiada, úsala. Si no, sugiere crear una nueva
3. Detecta la marca
4. Identifica atributos clave

RESPONDE SOLO CON JSON (sin explicaciones):
{
  "categoria_id": 1,
  "categoria_nombre": "Electro Hogar",
  "subcategoria_nombre": "Televisores",
  "subcategoria_id": 4,
  "crear_subcategoria": false,
  "marca_nombre": "LG",
  "crear_marca": false,
  "atributos": [
    {"nombre": "Tamaño", "valor": "32", "unidad": "pulgadas"}
  ],
  "nombre_sugerido": "TV LG 32 pulgadas HD"
}`;

        try {
            const response = await this.callOllama(prompt);

            // Extraer JSON de la respuesta
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No se pudo extraer JSON de la respuesta');
            }

            const classification = JSON.parse(jsonMatch[0]);

            // Crear subcategoría si es necesario
            if (classification.crear_subcategoria) {
                classification.subcategoria_id = await this.createSubcategory(
                    classification.categoria_id,
                    classification.subcategoria_nombre
                );
            }

            // Crear marca si es necesario
            if (classification.crear_marca) {
                const marcaId = await this.createBrand(classification.marca_nombre);
                classification.marca_id = marcaId;
            } else {
                // Buscar ID de marca existente
                const marca = this.brandsCache.find(b =>
                    b.nombre.toLowerCase() === classification.marca_nombre.toLowerCase()
                );
                classification.marca_id = marca ? marca.id_marca : 1;
            }

            return classification;

        } catch (error) {
            console.error('Error en clasificación:', error.message);

            // Fallback: clasificación básica sin IA
            return this.fallbackClassification(productData);
        }
    }

    /**
     * Clasificación de respaldo (sin IA)
     */
    fallbackClassification(productData) {
        const text = `${productData.ref} ${productData.nombre} ${productData.categoria}`.toUpperCase();

        // Detección básica por palabras clave
        let categoria_id = 1;
        let categoria_nombre = 'Electro Hogar';

        if (text.includes('MOTO') || text.includes('WAVE') || text.includes('AX4')) {
            categoria_id = 3;
            categoria_nombre = 'Motos';
        } else if (text.includes('COLCHON') || text.includes('SEMIORTOPEDICO') || text.includes('ESCRITORIO')) {
            categoria_id = 2;
            categoria_nombre = 'Muebles y Organización';
        } else if (text.includes('STIHL') || text.includes('MOTOSIERRA')) {
            categoria_id = 4;
            categoria_nombre = 'Herramientas STIHL';
        }

        return {
            categoria_id,
            categoria_nombre,
            subcategoria_nombre: null,
            subcategoria_id: null,
            crear_subcategoria: false,
            marca_nombre: 'Genérica',
            marca_id: 1,
            crear_marca: false,
            atributos: [],
            nombre_sugerido: productData.nombre
        };
    }

    /**
     * Crear nueva subcategoría
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

            const result = await client.query(
                'INSERT INTO subcategorias (id_categoria, nombre, activo) VALUES ($1, $2, true) RETURNING id_subcategoria',
                [id_categoria, nombre]
            );

            const newId = result.rows[0].id_subcategoria;
            console.log(`  ✅ Nueva subcategoría: "${nombre}" (ID: ${newId})`);

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
     * Crear nueva marca
     */
    async createBrand(nombre) {
        const client = await this.pool.connect();

        try {
            const existing = await client.query(
                'SELECT id_marca FROM marcas WHERE nombre ILIKE $1',
                [nombre]
            );

            if (existing.rows.length > 0) {
                return existing.rows[0].id_marca;
            }

            const result = await client.query(
                'INSERT INTO marcas (nombre, activo) VALUES ($1, true) RETURNING id_marca',
                [nombre]
            );

            const newId = result.rows[0].id_marca;
            console.log(`  ✅ Nueva marca: "${nombre}" (ID: ${newId})`);

            this.brandsCache.push({ id_marca: newId, nombre });

            return newId;

        } finally {
            client.release();
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = LocalIntelligentClassifier;
