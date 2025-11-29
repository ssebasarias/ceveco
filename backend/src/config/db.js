const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'ceveco_db',
    max: 20, // Número máximo de clientes en el pool
    idleTimeoutMillis: 30000, // Tiempo antes de cerrar conexiones inactivas
    connectionTimeoutMillis: 2000, // Tiempo de espera para obtener una conexión
});

// Evento cuando se conecta un cliente
pool.on('connect', () => {
    console.log('✅ Nueva conexión establecida con PostgreSQL');
});

// Evento cuando hay un error en el pool
pool.on('error', (err) => {
    console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('🔌 Conexión a PostgreSQL exitosa:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con PostgreSQL:', error.message);
        return false;
    }
};

// Función helper para ejecutar queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query ejecutada', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
};

// Función para obtener un cliente del pool (para transacciones)
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Timeout para liberar el cliente automáticamente
    const timeout = setTimeout(() => {
        console.error('⚠️ Cliente no liberado después de 5 segundos');
        client.release();
    }, 5000);

    // Override del método release para limpiar el timeout
    client.release = () => {
        clearTimeout(timeout);
        return release();
    };

    return client;
};

module.exports = {
    pool,
    query,
    getClient,
    testConnection
};
