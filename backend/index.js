require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { testConnection } = require('./src/config/db');

// Importar rutas
const productosRoutes = require('./src/routes/productos.routes');
const authRoutes = require('./src/routes/auth.routes');

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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://unpkg.com", "https://checkout.wompi.co", "https://accounts.google.com", "https://apis.google.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Keeping unsafe-inline for styles is often necessary for frameworks unless using strict nonce/hash
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://via.placeholder.com", "https://ceveco.com.co", "https://lh3.googleusercontent.com"], // Added Google for avatars
            connectSrc: ["'self'", "https://accounts.google.com", "https://oauth2.googleapis.com", "https://unpkg.com", "https://*.google.com", "https://maps.googleapis.com"], // Allow connecting to Google OAuth & Maps & Unpkg
            frameSrc: ["'self'", "https://checkout.wompi.co", "https://accounts.google.com", "https://maps.google.com", "https://www.google.com"],
            upgradeInsecureRequests: null
        },
    },
}));

// CORS - Configuración para permitir peticiones desde el frontend

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origen (como apps móviles, curl o postman)
        if (!origin) return callback(null, true);
        callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Servir imágenes de productos desde backend/public
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Servir frontend
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../frontend/pages')));

const fs = require('fs');

// Endpoint para obtener banners dinámicos
app.get('/api/v1/hero-banners', (req, res) => {
    const bannersDir = path.join(__dirname, '../frontend/assets/img/banner-hero');

    fs.readdir(bannersDir, (err, files) => {
        if (err) {
            console.error('Error reading banner directory:', err);
            return res.status(500).json({ success: false, message: 'Error reading banners' });
        }

        // Filtrar solo imágenes
        const images = files.filter(file =>
            /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
        ).map(file => `../assets/img/banner-hero/${file}`);

        res.json({ success: true, data: images });
    });
});

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

// Endpoint de Configuración Pública (Para frontend)
app.get(`${API_PREFIX}/config`, (req, res) => {
    res.json({
        success: true,
        data: {
            wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || 'pub_test_Q5yDA9xoKdePzhSGeVe9HAez7HgGORGf',
            googleClientId: process.env.GOOGLE_CLIENT_ID || 'PENDING_GOOGLE_CLIENT_ID'
        }
    });
});

// Rutas de la API
app.use(`${API_PREFIX}/productos`, productosRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/favoritos`, require('./src/routes/favoritos.routes'));
app.use(`${API_PREFIX}/marcas`, require('./src/routes/marcas.routes'));
app.use(`${API_PREFIX}/orders`, require('./src/routes/orders.routes'));
app.use(`${API_PREFIX}/pagos`, require('./src/routes/webhook.routes'));
app.use(`${API_PREFIX}/direcciones`, require('./src/routes/address.routes'));
app.use(`${API_PREFIX}/contacto`, require('./src/routes/contact.routes'));
app.use(`${API_PREFIX}/sedes`, require('./src/routes/sedes.routes'));

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
            console.log(`🔐 Auth: http://localhost:${PORT}${API_PREFIX}/auth`);
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

// Iniciar el servidor solo si este archivo se ejecuta directamente
if (require.main === module) {
    startServer();
}

module.exports = app;
