#!/usr/bin/env node

/**
 * Script maestro para cargar todos los JSONL normalizados
 * Ejecuta cada loader en secuencia
 */

const SuzukiLoader = require('./load-suzuki');
const MaximueblesLoader = require('./load-maximuebles');
const ComodisimosLoader = require('./load-comodisimos');
const HondaLoader = require('./load-honda');
const CorbetaLoader = require('./load-corbeta');
const HacebLoader = require('./load-haceb');
const LGLoader = require('./load-lg');
const LYLLoader = require('./load-lyl');
const InvalLoader = require('./load-inval');
const HyundaiLoader = require('./load-hyundai');
const STIHLLoader = require('./load-stihl');

const loaders = [
    {
        name: 'Suzuki',
        loader: new SuzukiLoader({
            filePath: 'scrapers/resultados/suzuki_con_precios.jsonl',
            defaultBrand: 'Suzuki',
            defaultCategory: 'Motos'
        })
    },
    {
        name: 'Maximuebles',
        loader: new MaximueblesLoader({
            filePath: 'scrapers/resultados/maximuebles.jsonl',
            defaultBrand: 'Maximuebles',
            defaultCategory: 'Muebles y Organización'
        })
    },
    {
        name: 'Comodisimos',
        loader: new ComodisimosLoader({
            filePath: 'scrapers/resultados/comodisimos.jsonl',
            defaultBrand: 'Comodisimos',
            defaultCategory: 'Muebles y Organización'
        })
    },
    {
        name: 'Honda',
        loader: new HondaLoader({
            filePath: 'scrapers/resultados/honda.jsonl',
            defaultBrand: 'Honda',
            defaultCategory: 'Motos'
        })
    },
    {
        name: 'Corbeta',
        loader: new CorbetaLoader({
            filePath: 'scrapers/resultados/corbeta_enrich.jsonl',
            defaultBrand: 'Kalley',
            defaultCategory: 'Electrohogar'
        })
    },
    {
        name: 'Haceb',
        loader: new HacebLoader({
            filePath: 'scrapers/resultados/haceb.jsonl',
            defaultBrand: 'Haceb',
            defaultCategory: 'Electrohogar'
        })
    },
    {
        name: 'LG',
        loader: new LGLoader({
            filePath: 'scrapers/resultados/LG.jsonl',
            defaultBrand: 'LG',
            defaultCategory: 'Electrohogar'
        })
    },
    {
        name: 'L&L',
        loader: new LYLLoader({
            filePath: 'scrapers/resultados/LYL.jsonl',
            defaultBrand: 'L&L',
            defaultCategory: 'Muebles y Organización'
        })
    },
    {
        name: 'Inval',
        loader: new InvalLoader({
            filePath: 'scrapers/resultados/inval.jsonl',
            defaultBrand: 'Inval',
            defaultCategory: 'Muebles y Organización'
        })
    },
    {
        name: 'Hyundai',
        loader: new HyundaiLoader({
            filePath: 'scrapers/resultados/hyundai_final.jsonl',
            defaultBrand: 'Hyundai',
            defaultCategory: 'Electrohogar'
        })
    },
    {
        name: 'STIHL',
        loader: new STIHLLoader({
            filePath: 'scrapers/resultados/stihl_enrich_fixed.jsonl',
            defaultBrand: 'STIHL',
            defaultCategory: 'Herramientas'
        })
    }
];

async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 INICIANDO CARGA MASIVA DE PRODUCTOS NORMALIZADA');
    console.log('='.repeat(60));
    
    const totalStats = {
        processed: 0,
        inserted: 0,
        updated: 0,
        imagesInserted: 0,
        errors: 0
    };
    
    for (const { name, loader } of loaders) {
        try {
            console.log(`\n📦 Procesando: ${name}`);
            await loader.execute();
            
            // Acumular estadísticas
            totalStats.processed += loader.stats.processed;
            totalStats.inserted += loader.stats.inserted;
            totalStats.updated += loader.stats.updated;
            totalStats.imagesInserted += loader.stats.imagesInserted;
            totalStats.errors += loader.stats.errors;
            
        } catch (err) {
            console.error(`❌ Error procesando ${name}:`, err.message);
            totalStats.errors++;
        }
    }
    
    // Cerrar conexión
    await loaders[0].loader.close();
    
    // Mostrar resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`Total procesados: ${totalStats.processed}`);
    console.log(`Total insertados: ${totalStats.inserted}`);
    console.log(`Total actualizados: ${totalStats.updated}`);
    console.log(`Total imágenes insertadas: ${totalStats.imagesInserted}`);
    console.log(`Total errores: ${totalStats.errors}`);
    console.log('='.repeat(60) + '\n');
}

main().catch(err => {
    console.error('ERROR FATAL:', err);
    process.exit(1);
});
