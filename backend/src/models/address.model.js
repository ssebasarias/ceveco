const { query } = require('../config/db');

class AddressModel {

    /**
     * Crear una nueva dirección
     */
    static async create(userId, addressData) {
        const {
            nombre_destinatario,
            telefono_contacto,
            departamento,
            ciudad,
            direccion_linea1,
            direccion_linea2,
            codigo_postal,
            barrio,
            referencias,
            es_principal,
            tipo
        } = addressData;

        // Si es principal, marcar las otras como no principales
        if (es_principal) {
            await query(
                'UPDATE direcciones SET es_principal = FALSE WHERE id_usuario = $1',
                [userId]
            );
        }

        const queryText = `
            INSERT INTO direcciones (
                id_usuario, nombre_destinatario, telefono_contacto,
                departamento, ciudad, direccion_linea1, direccion_linea2,
                codigo_postal, barrio, referencias, es_principal, tipo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `;

        const values = [
            userId, nombre_destinatario, telefono_contacto,
            departamento, ciudad, direccion_linea1, direccion_linea2,
            codigo_postal, barrio, referencias, es_principal || false, tipo || 'casa'
        ];

        const result = await query(queryText, values);
        return result.rows[0];
    }

    /**
     * Obtener todas las direcciones de un usuario
     */
    static async getByUserId(userId) {
        const queryText = `
            SELECT * FROM direcciones 
            WHERE id_usuario = $1 
            ORDER BY es_principal DESC, fecha_creacion DESC
        `;
        const result = await query(queryText, [userId]);
        return result.rows;
    }

    /**
     * Eliminar dirección
     */
    static async delete(userId, addressId) {
        // Verificar que pertenezca al usuario
        const result = await query(
            'DELETE FROM direcciones WHERE id_direccion = $1 AND id_usuario = $2 RETURNING id_direccion',
            [addressId, userId]
        );
        return result.rowCount > 0;
    }
}

module.exports = AddressModel;
