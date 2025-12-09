/**
 * Config Central Export
 * Punto único de importación para todas las configuraciones
 */

const config = require('./config');
const { testConnection, query, getClient, pool } = require('./db');
const { helmetConfig, getCorsConfig, securityHeaders } = require('./security.config');

module.exports = {
    // Configuración general
    config,

    // Base de datos
    db: {
        testConnection,
        query,
        getClient,
        pool
    },

    // Seguridad
    security: {
        helmetConfig,
        getCorsConfig,
        securityHeaders
    }
};
