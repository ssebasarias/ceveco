require('dotenv').config({ path: require('path').join(__dirname, '../../../backend/.env') });
const { Pool } = require('pg');

class DatabaseConnection {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5433,
            database: process.env.DB_NAME || 'ceveco_db',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres'
        });
    }

    async query(text, params) {
        return this.pool.query(text, params);
    }

    async end() {
        await this.pool.end();
    }
}

module.exports = new DatabaseConnection();
