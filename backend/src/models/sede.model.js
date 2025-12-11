const { query } = require('../config/db');

class SedeModel {
    static async findAll() {
        // Query to get all active sedes
        const queryText = `
            SELECT * FROM sedes 
            WHERE activo = TRUE 
            ORDER BY es_principal DESC, nombre ASC
        `;
        const result = await query(queryText);
        return result.rows;
    }

    static async findById(id) {
        const queryText = `SELECT * FROM sedes WHERE id_sede = $1 AND activo = TRUE`;
        const result = await query(queryText, [id]);
        return result.rows[0];
    }
}

module.exports = SedeModel;
