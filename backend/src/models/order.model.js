const { query, getClient } = require('../config/db');

class OrderModel {
    /**
     * Crear un nuevo pedido con transacción
     * @param {number} userId - ID del usuario
     * @param {Object} orderData - Datos del pedido (items, direccion, contacto)
     * @returns {Promise<Object>} Pedido creado
     */
    static async create(userId, orderData) {
        const client = await getClient();

        try {
            await client.query('BEGIN');

            // 1. Crear o reutilizar dirección (Simplificado: Siempre creamos una nueva para este historial)
            // Ajustar campos según tabla 'direcciones' en bd.sql
            const addressQuery = `
        INSERT INTO direcciones (
          id_usuario, nombre_destinatario, telefono_contacto,
          departamento, ciudad, direccion_linea1, codigo_postal, tipo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'casa')
        RETURNING id_direccion
      `;
            const addressValues = [
                userId,
                `${orderData.shippingAddress.firstName} ${orderData.shippingAddress.lastName}`,
                orderData.contact.phone,
                orderData.shippingAddress.department,
                orderData.shippingAddress.city,
                orderData.shippingAddress.address,
                orderData.shippingAddress.zip || null
            ];

            const addressResult = await client.query(addressQuery, addressValues);
            const addressId = addressResult.rows[0].id_direccion;

            // 2. Crear Pedido
            // Generar numero de pedido único (ej: ORD-TIMESTAMP-RANDOM)
            const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const orderQuery = `
        INSERT INTO pedidos (
          numero_pedido, id_usuario, id_direccion_envio,
          email_contacto, telefono_contacto,
          subtotal, costo_envio, total,
          metodo_pago, estado, estado_pago,
          empresa_envio, fecha_entrega
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'wompi', 'procesando', 'pagado', 'Coordinadora', CURRENT_DATE + INTERVAL '3 days')
        RETURNING id_pedido, numero_pedido, fecha_pedido
      `;

            const orderValues = [
                orderNumber,
                userId,
                addressId,
                orderData.contact.email,
                orderData.contact.phone,
                orderData.totals.subtotal,
                orderData.totals.shipping || 0,
                orderData.totals.total
            ];

            const orderResult = await client.query(orderQuery, orderValues);
            const newOrder = orderResult.rows[0];

            // 3. Insertar Items
            for (const item of orderData.items) {
                const itemQuery = `
          INSERT INTO pedido_items (
            id_pedido, id_producto, cantidad, precio_unitario, subtotal, total
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `;
                const itemTotal = item.price * item.quantity;
                await client.query(itemQuery, [
                    newOrder.id_pedido,
                    item.id,
                    item.quantity,
                    item.price,
                    itemTotal,
                    itemTotal // Asumiendo sin descuento por ahora
                ]);

                // (Opcional) Actualizar Stock
                // await client.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [item.quantity, item.id]);
            }

            await client.query('COMMIT');
            return newOrder;

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating order transaction:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Obtener pedidos de un usuario
     * @param {number} userId 
     */
    static async findByUser(userId) {
        const queryText = `
      SELECT 
        p.id_pedido,
        p.numero_pedido,
        p.fecha_pedido,
        p.estado,
        p.total,
        count(pi.id_item) as items_count,
        (
            SELECT url_imagen 
            FROM producto_imagenes pi2 
            JOIN pedido_items pit ON pi2.id_producto = pit.id_producto 
            WHERE pit.id_pedido = p.id_pedido AND pi2.es_principal = TRUE 
            LIMIT 1
        ) as imagen_preview
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id_pedido = pi.id_pedido
      WHERE p.id_usuario = $1
      GROUP BY p.id_pedido
      ORDER BY p.fecha_pedido DESC
    `;

        const result = await query(queryText, [userId]);
        return result.rows;
    }
}

module.exports = OrderModel;
