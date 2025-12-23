/**
 * 🔧 Sistema de Atributos Normalizados
 * - Consulta BD para atributos existentes
 * - Normaliza nombres para evitar duplicados
 * - Reutiliza atributos cuando es posible
 * - Solo crea nuevos cuando es necesario
 */

const { Pool } = require('pg');

class AttributeManager {
    constructor(dbConfig) {
        this.pool = new Pool(dbConfig);
        this.attributesCache = null;
        this.attributeTypesCache = null;
    }

    /**
     * Cargar atributos existentes de la BD
     */
    async loadExistingAttributes() {
        const client = await this.pool.connect();

        try {
            // Cargar todos los atributos únicos (nombre + tipo)
            const result = await client.query(`
        SELECT DISTINCT 
          nombre, 
          tipo,
          COUNT(*) as uso_count
        FROM producto_atributos
        GROUP BY nombre, tipo
        ORDER BY uso_count DESC, nombre
      `);

            this.attributesCache = result.rows;

            // Crear índice por nombre normalizado para búsqueda rápida
            this.attributeIndex = {};
            this.attributesCache.forEach(attr => {
                const normalized = this.normalizeAttributeName(attr.nombre);
                if (!this.attributeIndex[normalized]) {
                    this.attributeIndex[normalized] = [];
                }
                this.attributeIndex[normalized].push(attr);
            });

            console.log(`✅ Cargados ${this.attributesCache.length} atributos únicos de la BD`);

            // Mostrar los más usados
            if (this.attributesCache.length > 0) {
                console.log(`\n📊 Atributos más usados:`);
                this.attributesCache.slice(0, 10).forEach(attr => {
                    console.log(`   ${attr.nombre} [${attr.tipo}] - usado ${attr.uso_count} veces`);
                });
            }

        } finally {
            client.release();
        }
    }

    /**
     * Normalizar nombre de atributo para comparación
     */
    normalizeAttributeName(name) {
        return name
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Quitar acentos
            .replace(/[^a-z0-9]+/g, '_') // Reemplazar espacios y caracteres especiales
            .replace(/^_+|_+$/g, ''); // Quitar guiones al inicio/fin
    }

    /**
     * Buscar atributo existente o sugerir normalización
     */
    findOrNormalizeAttribute(nombre, tipo) {
        if (!this.attributesCache) {
            throw new Error('Debe cargar atributos primero con loadExistingAttributes()');
        }

        const normalized = this.normalizeAttributeName(nombre);

        // Buscar coincidencia exacta normalizada
        const matches = this.attributeIndex[normalized] || [];

        // Si hay coincidencias, usar la más común (más usada)
        if (matches.length > 0) {
            // Preferir la del mismo tipo
            const sameType = matches.find(m => m.tipo === tipo);
            if (sameType) {
                return {
                    action: 'use_existing',
                    nombre: sameType.nombre,
                    tipo: sameType.tipo,
                    original: nombre,
                    reason: `Normalizado de "${nombre}" a "${sameType.nombre}" (usado ${sameType.uso_count} veces)`
                };
            }

            // Si no hay del mismo tipo, usar el más común
            const mostUsed = matches[0];
            return {
                action: 'use_existing',
                nombre: mostUsed.nombre,
                tipo: tipo, // Mantener el tipo sugerido
                original: nombre,
                reason: `Normalizado de "${nombre}" a "${mostUsed.nombre}" (usado ${mostUsed.uso_count} veces)`
            };
        }

        // No existe, crear nuevo con nombre normalizado
        const normalizedName = this.capitalizeAttributeName(nombre);
        return {
            action: 'create_new',
            nombre: normalizedName,
            tipo: tipo,
            original: nombre,
            reason: `Nuevo atributo: "${normalizedName}"`
        };
    }

    /**
     * Capitalizar nombre de atributo correctamente
     */
    capitalizeAttributeName(name) {
        // Palabras que deben ir en mayúsculas
        const uppercase = ['TV', 'HD', 'USB', 'HDMI', 'LED', 'LCD', 'GPS', 'ABS', 'CBS'];

        return name
            .split(' ')
            .map(word => {
                const upper = word.toUpperCase();
                if (uppercase.includes(upper)) {
                    return upper;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');
    }

    /**
     * Normalizar valor de atributo
     */
    normalizeAttributeValue(nombre, valor, unidad) {
        // Normalizar valores comunes
        const normalized = {
            nombre,
            valor: valor.toString().trim(),
            unidad: unidad ? unidad.trim() : null
        };

        // Casos especiales
        if (nombre.toLowerCase().includes('smart tv') || nombre.toLowerCase().includes('bluetooth')) {
            // Normalizar Sí/No
            if (['si', 'sí', 'yes', 'true', '1'].includes(valor.toLowerCase())) {
                normalized.valor = 'Sí';
            } else if (['no', 'false', '0'].includes(valor.toLowerCase())) {
                normalized.valor = 'No';
            }
        }

        // Normalizar unidades
        if (unidad) {
            const unidadMap = {
                'pulgada': 'pulgadas',
                'pulg': 'pulgadas',
                '"': 'pulgadas',
                'cm': 'cm',
                'centimetro': 'cm',
                'centímetro': 'cm',
                'metro': 'metros',
                'm': 'metros',
                'kg': 'kg',
                'kilo': 'kg',
                'kilogramo': 'kg',
                'gramo': 'gramos',
                'g': 'gramos',
                'litro': 'litros',
                'l': 'litros',
                'watt': 'W',
                'watts': 'W',
                'w': 'W',
                'cc': 'cc',
                'año': 'años',
                'anos': 'años'
            };

            const normalizedUnit = unidadMap[unidad.toLowerCase()] || unidad;
            normalized.unidad = normalizedUnit;
        }

        return normalized;
    }

    /**
     * Procesar lista de atributos
     */
    async processAttributes(attributes) {
        if (!this.attributesCache) {
            await this.loadExistingAttributes();
        }

        const processed = [];
        const stats = {
            existing: 0,
            new: 0,
            normalized: 0
        };

        for (const attr of attributes) {
            // Buscar o normalizar
            const result = this.findOrNormalizeAttribute(attr.nombre, attr.tipo);

            // Normalizar valor y unidad
            const normalized = this.normalizeAttributeValue(
                result.nombre,
                attr.valor,
                attr.unidad
            );

            processed.push({
                nombre: result.nombre,
                valor: normalized.valor,
                unidad: normalized.unidad,
                tipo: result.tipo,
                action: result.action,
                reason: result.reason
            });

            // Estadísticas
            if (result.action === 'use_existing') {
                stats.existing++;
                if (result.nombre !== attr.nombre) {
                    stats.normalized++;
                }
            } else {
                stats.new++;
            }
        }

        return { processed, stats };
    }

    async close() {
        await this.pool.end();
    }
}

// Prueba del sistema
async function testAttributeManager() {
    console.log('\n' + '='.repeat(100));
    console.log('🔧 PRUEBA DEL SISTEMA DE ATRIBUTOS NORMALIZADOS');
    console.log('='.repeat(100) + '\n');

    const manager = new AttributeManager({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5433,
        database: process.env.DB_NAME || 'ceveco_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    });

    // Cargar atributos existentes
    console.log('📥 Cargando atributos existentes de la BD...\n');
    await manager.loadExistingAttributes();

    // Atributos de prueba (con variaciones)
    const testAttributes = [
        { nombre: 'Tamaño de Pantalla', valor: '32', unidad: 'pulgadas', tipo: 'dimension' },
        { nombre: 'tamaño pantalla', valor: '43', unidad: 'pulg', tipo: 'dimension' }, // Variación
        { nombre: 'TAMAÑO DE PANTALLA', valor: '50', unidad: '"', tipo: 'dimension' }, // Variación
        { nombre: 'Resolución', valor: 'Full HD', unidad: null, tipo: 'video' },
        { nombre: 'resolucion', valor: '4K', unidad: null, tipo: 'video' }, // Variación
        { nombre: 'Smart TV', valor: 'si', unidad: null, tipo: 'conectividad' },
        { nombre: 'smart tv', valor: 'Sí', unidad: null, tipo: 'conectividad' }, // Variación
        { nombre: 'Cilindraje', valor: '110', unidad: 'cc', tipo: 'motor' },
        { nombre: 'Nuevo Atributo', valor: 'valor', unidad: null, tipo: 'general' } // Nuevo
    ];

    console.log('\n' + '─'.repeat(100));
    console.log('📋 Procesando atributos de prueba...\n');

    const result = await manager.processAttributes(testAttributes);

    console.log('✅ Atributos procesados:\n');
    result.processed.forEach((attr, idx) => {
        const original = testAttributes[idx];
        console.log(`${idx + 1}. ${attr.nombre}: ${attr.valor}${attr.unidad ? ' ' + attr.unidad : ''} [${attr.tipo}]`);
        console.log(`   Acción: ${attr.action === 'use_existing' ? '♻️  Reutilizar existente' : '🆕 Crear nuevo'}`);
        console.log(`   Razón: ${attr.reason}`);
        if (original.nombre !== attr.nombre) {
            console.log(`   Original: "${original.nombre}" → Normalizado: "${attr.nombre}"`);
        }
        console.log('');
    });

    console.log('─'.repeat(100));
    console.log('📊 ESTADÍSTICAS:\n');
    console.log(`   Atributos existentes reutilizados: ${result.stats.existing}`);
    console.log(`   Atributos normalizados: ${result.stats.normalized}`);
    console.log(`   Atributos nuevos a crear: ${result.stats.new}`);
    console.log(`   Total procesados: ${result.processed.length}`);

    const reuseRate = (result.stats.existing / result.processed.length * 100).toFixed(0);
    console.log(`\n   Tasa de reutilización: ${reuseRate}%`);

    console.log('\n' + '='.repeat(100));
    console.log('✅ PRUEBA COMPLETADA');
    console.log('='.repeat(100));
    console.log('\n💡 BENEFICIOS:');
    console.log('   • Evita duplicados (Tamaño Pantalla vs Tamaño de Pantalla)');
    console.log('   • Normaliza valores (si → Sí, pulg → pulgadas)');
    console.log('   • Reutiliza atributos existentes');
    console.log('   • Mantiene consistencia en la BD');
    console.log('   • Facilita búsquedas y filtros en el frontend\n');

    await manager.close();
}

// Exportar para uso en otros scripts
module.exports = AttributeManager;

// Ejecutar prueba si se corre directamente
if (require.main === module) {
    require('dotenv').config({ path: './backend/.env' });
    testAttributeManager().catch(error => {
        console.error('\n❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    });
}
