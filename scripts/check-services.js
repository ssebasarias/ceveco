/**
 * Script de Verificación de Servicios
 * Verifica que todos los servicios del backend y frontend estén funcionando correctamente
 */

const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer peticiones HTTP
function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${path}`;
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        status: res.statusCode,
                        data: json,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        success: res.statusCode >= 200 && res.statusCode < 300
                    });
                }
            });
        }).on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
                reject(new Error(`No se pudo conectar al servidor. Asegúrate de que esté corriendo en el puerto ${PORT}`));
            } else {
                reject(err);
            }
        });
    });
}

// Endpoints a verificar
const endpoints = [
    {
        name: 'Health Check',
        path: '/health',
        expectedStatus: 200
    },
    {
        name: 'Config Pública',
        path: '/api/v1/config',
        expectedStatus: 200
    },
    {
        name: 'Hero Banners',
        path: '/api/v1/hero-banners',
        expectedStatus: 200
    },
    {
        name: 'Productos (Lista)',
        path: '/api/v1/productos?limit=1',
        expectedStatus: 200
    },
    {
        name: 'Marcas',
        path: '/api/v1/marcas',
        expectedStatus: 200
    },
    {
        name: 'Sedes',
        path: '/api/v1/sedes',
        expectedStatus: 200
    }
];

async function checkServices() {
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║   🔍 VERIFICACIÓN DE SERVICIOS CEVECO 🔍   ║', 'cyan');
    log('╚════════════════════════════════════════════╝\n', 'cyan');

    log(`📍 Verificando servicios en: ${BASE_URL}\n`, 'blue');

    let passed = 0;
    let failed = 0;
    const errors = [];

    for (const endpoint of endpoints) {
        try {
            log(`⏳ Verificando: ${endpoint.name}...`, 'yellow');
            const result = await makeRequest(endpoint.path);

            if (result.success && result.status === endpoint.expectedStatus) {
                log(`   ✅ ${endpoint.name}: OK (${result.status})`, 'green');
                passed++;
            } else {
                log(`   ❌ ${endpoint.name}: FALLÓ (Status: ${result.status}, Esperado: ${endpoint.expectedStatus})`, 'red');
                failed++;
                errors.push({
                    endpoint: endpoint.name,
                    path: endpoint.path,
                    status: result.status,
                    expected: endpoint.expectedStatus,
                    data: result.data
                });
            }
        } catch (error) {
            log(`   ❌ ${endpoint.name}: ERROR - ${error.message}`, 'red');
            failed++;
            errors.push({
                endpoint: endpoint.name,
                path: endpoint.path,
                error: error.message
            });
        }
    }

    // Resumen
    log('\n╔════════════════════════════════════════════╗', 'cyan');
    log('║              📊 RESUMEN                    ║', 'cyan');
    log('╚════════════════════════════════════════════╝\n', 'cyan');

    log(`✅ Exitosos: ${passed}`, 'green');
    log(`❌ Fallidos: ${failed}`, failed > 0 ? 'red' : 'green');
    log(`📊 Total: ${endpoints.length}\n`, 'blue');

    if (failed > 0) {
        log('⚠️  ERRORES ENCONTRADOS:\n', 'yellow');
        errors.forEach((error, index) => {
            log(`${index + 1}. ${error.endpoint}`, 'red');
            log(`   Path: ${error.path}`, 'yellow');
            if (error.status) {
                log(`   Status: ${error.status} (Esperado: ${error.expected})`, 'yellow');
            }
            if (error.error) {
                log(`   Error: ${error.error}`, 'yellow');
            }
            if (error.data && typeof error.data === 'object') {
                log(`   Respuesta: ${JSON.stringify(error.data).substring(0, 100)}...`, 'yellow');
            }
            log('');
        });
        process.exit(1);
    } else {
        log('🎉 ¡Todos los servicios están funcionando correctamente!', 'green');
        process.exit(0);
    }
}

// Verificar si el servidor está corriendo antes de empezar
async function checkServerRunning() {
    try {
        await makeRequest('/health');
        return true;
    } catch (error) {
        log('\n❌ El servidor no está corriendo o no está accesible', 'red');
        log(`\n💡 Para iniciar el servidor, ejecuta:`, 'yellow');
        log('   cd backend', 'cyan');
        log('   npm start', 'cyan');
        log('\n   O en modo desarrollo:', 'yellow');
        log('   npm run dev', 'cyan');
        return false;
    }
}
}

// Ejecutar verificación
(async () => {
    const serverRunning = await checkServerRunning();
    if (!serverRunning) {
        process.exit(1);
    }
    await checkServices();
})().catch((error) => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
});
