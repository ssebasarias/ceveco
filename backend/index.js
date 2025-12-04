require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { testConnection } = require('./src/config/db');

// Importar rutas
const productosRoutes = require('./src/routes/productos.routes');

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad con Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://via.placeholder.com", "https://ceveco.com.co"],
            connectSrc: ["'self'"],
        },
    },
}));

// CORS - Configuración para permitir peticiones desde el frontend
// CORS - Configuración para permitir peticiones desde el frontend
const corsOptions = {
    origin: '*', // Permitir todo para desarrollo y acceso local (file://)
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones HTTP (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ============================================
// ARCHIVOS ESTÁTICOS
// ============================================
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

// ============================================
// RUTAS
// ============================================

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Ceveco funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Rutas de la API
app.use(`${API_PREFIX}/productos`, productosRoutes);

// Ruta 404 - No encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
});

// ============================================
// MANEJO DE ERRORES GLOBAL
// ============================================

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
    try {
        // Probar conexión a la base de datos
        console.log('🔍 Verificando conexión a PostgreSQL...');
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ No se pudo conectar a la base de datos');
            console.error('⚠️  Verifica las credenciales en el archivo .env');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════╗');
            console.log('║                                            ║');
            console.log('║     🚀 SERVIDOR CEVECO INICIADO 🚀        ║');
            console.log('║                                            ║');
            console.log('╚════════════════════════════════════════════╝');
            console.log('');
            console.log(`📡 Servidor corriendo en: http://localhost:${PORT}`);
            console.log(`🌐 API disponible en: http://localhost:${PORT}${API_PREFIX}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            console.log(`📦 Productos: http://localhost:${PORT}${API_PREFIX}/productos`);
            console.log(`🏠 Frontend: http://localhost:${PORT}/`);
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log('');
            console.log('💡 Presiona CTRL+C para detener el servidor');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de señales de terminación
process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n⚠️  SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app;
