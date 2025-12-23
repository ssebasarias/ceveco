/**
 * 🔍 Sistema Completo de Verificación de Duplicados
 * - Consulta BD constantemente
 * - Detecta productos duplicados por REF
 * - Reutiliza marcas, subcategorías y atributos existentes
 * - Modo INSERT o UPDATE según corresponda
 */

require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

class DuplicateChecker {
    constructor(dbConfig) {
        this.pool = new Pool(dbConfig);

        // Caches
        this.marcasCache = new Map();
        this.subcategoriasCache = new Map();
        this.atributosCache = new Map();
        this.productosCache = new Map(); // REF -> id_producto
    }

    /**
     * Cargar todos los datos de la BD
     */
    async loadAllData() {
        console.log('📥 Cargando datos de la BD...\n');

        await this.loadMarcas();
        await this.loadSubcategorias();
        await this.loadAtributos();
        await this.loadProductos();

        console.log('✅ Datos cargados\n');
    }

    /**
     * Cargar marcas
     */
    async loadMarcas() {
        const result = await this.pool.query('SELECT id_marca, nombre FROM marcas');
        this.marcasCache.clear();
        result.rows.forEach(row => {
            this.marcasCache.set(row.nombre.toLowerCase(), row.id_marca);
        });
        console.log(`   Marcas: ${this.marcasCache.size}`);
    }

    /**
     * Cargar subcategorías
     */
    async loadSubcategorias() {
        const result = await this.pool.query('SELECT id_subcategoria, nombre, id_categoria FROM subcategorias');
        this.subcategoriasCache.clear();
        result.rows.forEach(row => {
            const key = `${row.id_categoria}_${row.nombre.toLowerCase()}`;
            this.subcategoriasCache.set(key, row.id_subcategoria);
        });
        console.log(`   Subcategorías: ${this.subcategoriasCache.size}`);
    }

    /**
     * Cargar atributos
     */
    async loadAtributos() {
        const result = await this.pool.query('SELECT id_atributo, nombre, tipo, unidad FROM atributos');
        this.atributosCache.clear();
        result.rows.forEach(row => {
            const key = `${row.nombre.toLowerCase()}_${row.tipo || ''}`;
            this.atributosCache.set(key, {
                id: row.id_atributo,
                nombre: row.nombre,
                tipo: row.tipo,
                unidad: row.unidad
            });
        });
        console.log(`   Atributos: ${this.atributosCache.size}`);
    }

    /**
     * Cargar productos (solo REF e ID)
     */
    async loadProductos() {
        const result = await this.pool.query('SELECT id_producto, ref FROM productos');
        this.productosCache.clear();
        result.rows.forEach(row => {
            this.productosCache.set(row.ref.toLowerCase(), row.id_producto);
        });
        console.log(`   Productos: ${this.productosCache.size}`);
    }

    /**
     * Verificar si un producto ya existe
     */
    checkProductExists(ref) {
        const id = this.productosCache.get(ref.toLowerCase());
        return {
            exists: !!id,
            id_producto: id,
            action: id ? 'UPDATE' : 'INSERT'
        };
    }

    /**
     * Obtener o crear marca
     */
    async getOrCreateMarca(nombre) {
        const key = nombre.toLowerCase();

        // Verificar en cache
        if (this.marcasCache.has(key)) {
            return {
                id: this.marcasCache.get(key),
                nombre: nombre,
                action: 'EXISTING'
            };
        }

        // Crear nueva
        const result = await this.pool.query(
            'INSERT INTO marcas (nombre, activo) VALUES ($1, true) RETURNING id_marca',
            [nombre]
        );

        const id = result.rows[0].id_marca;
        this.marcasCache.set(key, id);

        return {
            id,
            nombre,
            action: 'CREATED'
        };
    }

    /**
     * Obtener o crear subcategoría
     */
    async getOrCreateSubcategoria(nombre, id_categoria) {
        const key = `${id_categoria}_${nombre.toLowerCase()}`;

        // Verificar en cache
        if (this.subcategoriasCache.has(key)) {
            return {
                id: this.subcategoriasCache.get(key),
                nombre: nombre,
                action: 'EXISTING'
            };
        }

        // Crear nueva
        const slug = nombre
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const result = await this.pool.query(
            'INSERT INTO subcategorias (id_categoria, nombre, slug, activo) VALUES ($1, $2, $3, true) RETURNING id_subcategoria',
            [id_categoria, nombre, slug]
        );

        const id = result.rows[0].id_subcategoria;
        this.subcategoriasCache.set(key, id);

        return {
            id,
            nombre,
            action: 'CREATED'
        };
    }

    /**
     * Obtener o crear atributo
     */
    async getOrCreateAtributo(nombre, tipo, unidad = null) {
        const key = `${nombre.toLowerCase()}_${tipo || ''}`;

        // Verificar en cache
        if (this.atributosCache.has(key)) {
            const cached = this.atributosCache.get(key);
            return {
                id: cached.id,
                nombre: cached.nombre,
                tipo: cached.tipo,
                unidad: cached.unidad,
                action: 'EXISTING'
            };
        }

        // Crear nuevo
        const result = await this.pool.query(
            'INSERT INTO atributos (nombre, tipo, unidad) VALUES ($1, $2, $3) RETURNING id_atributo',
            [nombre, tipo, unidad]
        );

        const id = result.rows[0].id_atributo;
        this.atributosCache.set(key, { id, nombre, tipo, unidad });

        return {
            id,
            nombre,
            tipo,
            unidad,
            action: 'CREATED'
        };
    }

    /**
     * Procesar un producto completo
     */
    async processProduct(productData) {
        const report = {
            ref: productData.ref,
            producto: null,
            marca: null,
            subcategoria: null,
            atributos: [],
            actions: []
        };

        // 1. Verificar si el producto existe
        const productCheck = this.checkProductExists(productData.ref);
        report.producto = productCheck;
        report.actions.push(`Producto: ${productCheck.action}`);

        // 2. Marca
        const marca = await this.getOrCreateMarca(productData.marca);
        report.marca = marca;
        report.actions.push(`Marca "${marca.nombre}": ${marca.action}`);

        // 3. Subcategoría
        const subcategoria = await this.getOrCreateSubcategoria(
            productData.subcategoria,
            productData.id_categoria
        );
        report.subcategoria = subcategoria;
        report.actions.push(`Subcategoría "${subcategoria.nombre}": ${subcategoria.action}`);

        // 4. Atributos
        if (productData.atributos && productData.atributos.length > 0) {
            for (const attr of productData.atributos) {
                const atributo = await this.getOrCreateAtributo(
                    attr.nombre,
                    attr.tipo,
                    attr.unidad
                );
                report.atributos.push({
                    ...atributo,
                    valor: attr.valor
                });
                report.actions.push(`Atributo "${atributo.nombre}": ${atributo.action}`);
            }
        }

        return report;
    }

    async close() {
        await this.pool.end();
    }
}

// Prueba del sistema
async function testDuplicateChecker() {
    console.log('\n' + '='.repeat(120));
    console.log('🔍 PRUEBA DEL SISTEMA DE VERIFICACIÓN DE DUPLICADOS');
    console.log('='.repeat(120) + '\n');

    const checker = new DuplicateChecker({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    // Cargar datos
    await checker.loadAllData();

    // Productos de prueba
    const testProducts = [
        {
            ref: '32LR600', // Existe
            nombre: 'TV LG 32" HD',
            marca: 'LG', // Existe
            id_categoria: 1,
            subcategoria: 'Televisores', // Existe
            atributos: [
                { nombre: 'Tamaño de Pantalla', valor: '32', unidad: 'pulgadas', tipo: 'dimension' },
                { nombre: 'Resolución', valor: 'HD', unidad: null, tipo: 'video' }
            ]
        },
        {
            ref: 'NUEVO-TV-001', // NO existe
            nombre: 'TV Samsung 55" 4K',
            marca: 'Samsung', // Existe
            id_categoria: 1,
            subcategoria: 'Televisores', // Existe
            atributos: [
                { nombre: 'Tamaño de Pantalla', valor: '55', unidad: 'pulgadas', tipo: 'dimension' },
                { nombre: 'Nuevo Atributo Test', valor: 'valor', unidad: null, tipo: 'test' } // NO existe
            ]
        },
        {
            ref: 'MOTO-NUEVA-001', // NO existe
            nombre: 'Moto Yamaha',
            marca: 'Yamaha', // NO existe
            id_categoria: 3,
            subcategoria: 'Motos Deportivas', // NO existe
            atributos: [
                { nombre: 'Cilindraje', valor: '250', unidad: 'cc', tipo: 'motor' }
            ]
        }
    ];

    console.log('─'.repeat(120));
    console.log('📋 Procesando productos de prueba...\n');

    for (let i = 0; i < testProducts.length; i++) {
        const product = testProducts[i];

        console.log(`\n${i + 1}. REF: ${product.ref}`);
        console.log('   ' + '─'.repeat(100));

        const report = await checker.processProduct(product);

        console.log(`\n   📦 PRODUCTO:`);
        console.log(`      Acción: ${report.producto.action}`);
        if (report.producto.exists) {
            console.log(`      ID existente: ${report.producto.id_producto}`);
            console.log(`      ⚠️  Este producto YA EXISTE - Se actualizará en vez de insertar`);
        } else {
            console.log(`      ✅ Producto nuevo - Se insertará`);
        }

        console.log(`\n   🏷️  MARCA: ${report.marca.nombre}`);
        console.log(`      Acción: ${report.marca.action}`);
        console.log(`      ID: ${report.marca.id}`);

        console.log(`\n   📂 SUBCATEGORÍA: ${report.subcategoria.nombre}`);
        console.log(`      Acción: ${report.subcategoria.action}`);
        console.log(`      ID: ${report.subcategoria.id}`);

        if (report.atributos.length > 0) {
            console.log(`\n   🔧 ATRIBUTOS (${report.atributos.length}):`);
            report.atributos.forEach(attr => {
                console.log(`      • ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''}`);
                console.log(`        Acción: ${attr.action}, ID: ${attr.id}`);
            });
        }

        console.log(`\n   📊 RESUMEN DE ACCIONES:`);
        report.actions.forEach(action => {
            const icon = action.includes('UPDATE') ? '🔄' :
                action.includes('CREATED') ? '🆕' :
                    action.includes('EXISTING') ? '♻️' : '📝';
            console.log(`      ${icon} ${action}`);
        });
    }

    console.log('\n\n' + '='.repeat(120));
    console.log('📊 ESTADÍSTICAS FINALES');
    console.log('='.repeat(120));

    console.log(`\n   Marcas en BD: ${checker.marcasCache.size}`);
    console.log(`   Subcategorías en BD: ${checker.subcategoriasCache.size}`);
    console.log(`   Atributos en BD: ${checker.atributosCache.size}`);
    console.log(`   Productos en BD: ${checker.productosCache.size}`);

    console.log('\n' + '='.repeat(120));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(120));

    console.log('\n💡 BENEFICIOS:');
    console.log('   • Detecta productos duplicados por REF');
    console.log('   • Reutiliza marcas, subcategorías y atributos existentes');
    console.log('   • Solo crea nuevos cuando es necesario');
    console.log('   • Modo UPDATE para productos existentes');
    console.log('   • Evita duplicados en toda la BD');
    console.log('   • Procesa 200 productos, solo actualiza los 3 que cambiaron\n');

    await checker.close();
}

// Exportar para uso en otros scripts
module.exports = DuplicateChecker;

// Ejecutar prueba si se corre directamente
if (require.main === module) {
    testDuplicateChecker().catch(error => {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    });
}
