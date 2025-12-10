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

      // 1. Validar productos y calcular totales desde la BD (SEGURIDAD)
      // NO confíamos en los precios enviados por el frontend
      let calculatedSubtotal = 0;
      const validatedItems = [];

      for (const item of orderData.items) {
        // Consultar precio real en la base de datos
        const productQuery = 'SELECT precio_actual, stock, nombre FROM productos WHERE id_producto = $1 AND activo = TRUE';
        const productResult = await client.query(productQuery, [item.id]);

        if (productResult.rowCount === 0) {
          throw new Error(`Producto con ID ${item.id} no encontrado o inactivo`);
        }

        const product = productResult.rows[0];
        const quantity = parseInt(item.quantity);

        if (quantity <= 0) {
          throw new Error(`Cantidad inválida para el producto ${product.nombre}`);
        }

        // Opcional: Validar stock
        // if (product.stock < quantity) {
        //    throw new Error(`Stock insuficiente para ${product.nombre}`);
        // }

        const realPrice = parseFloat(product.precio_actual);
        const itemSubtotal = realPrice * quantity;

        calculatedSubtotal += itemSubtotal;

        validatedItems.push({
          id_producto: item.id,
          cantidad: quantity,
          precio_unitario: realPrice,
          subtotal: itemSubtotal
        });
      }

      // Usamos costo de envío del frontend por ahora, pero el subtotal de productos es seguro
      const shippingCost = parseFloat(orderData.totals.shipping) || 0;
      const calculatedTotal = calculatedSubtotal + shippingCost;

      // 2. Crear o reutilizar dirección (Simplificado)
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

      // 3. Crear Pedido con los totales calculados
      // Si el frontend envía una referencia (ej: para Wompi), la usamos. Si no, generamos una.
      const orderNumber = orderData.reference || `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const orderQuery = `
                INSERT INTO pedidos (
                  numero_pedido, id_usuario, id_direccion_envio,
                  email_contacto, telefono_contacto,
                  subtotal, costo_envio, total,
                  metodo_pago, estado, estado_pago,
                  empresa_envio, fecha_entrega
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'wompi', 'pendiente', 'pendiente', NULL, NULL)
                RETURNING id_pedido, numero_pedido, fecha_pedido
            `;

      const orderValues = [
        orderNumber,
        userId,
        addressId,
        orderData.contact.email,
        orderData.contact.phone,
        calculatedSubtotal, // Precio calculado del backend
        shippingCost,
        calculatedTotal     // Total seguro
      ];

      const orderResult = await client.query(orderQuery, orderValues);
      const newOrder = orderResult.rows[0];

      // 4. Insertar Items validados
      for (const item of validatedItems) {
        const itemQuery = `
                  INSERT INTO pedido_items (
                    id_pedido, id_producto, cantidad, precio_unitario, subtotal, total
                  ) VALUES ($1, $2, $3, $4, $5, $6)
                `;
        await client.query(itemQuery, [
          newOrder.id_pedido,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
          item.subtotal
        ]);

        // Actualizar stock (opcional)
        // await client.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [item.cantidad, item.id_producto]);
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

  /**
   * Obtener detalle completo de un pedido por ID y Usuario (Seguridad)
   * @param {number} orderId 
   * @param {number} userId 
   */
  static async findById(orderId, userId) {
    const queryText = `
      SELECT 
        p.*,
        to_json(d.*) as direccion_envio,
        json_agg(
          json_build_object(
            'id_producto', pi.id_producto,
            'nombre', pr.nombre,
            'cantidad', pi.cantidad,
            'precio_unitario', pi.precio_unitario,
            'subtotal', pi.subtotal,
            'imagen', (
                SELECT url_imagen 
                FROM producto_imagenes img 
                WHERE img.id_producto = pr.id_producto AND img.es_principal = TRUE 
                LIMIT 1
            )
          )
        ) as items
      FROM pedidos p
      LEFT JOIN direcciones d ON p.id_direccion_envio = d.id_direccion
      JOIN pedido_items pi ON p.id_pedido = pi.id_pedido
      JOIN productos pr ON pi.id_producto = pr.id_producto
      WHERE p.id_pedido = $1 AND p.id_usuario = $2
      GROUP BY p.id_pedido, d.id_direccion
    `;

    const result = await query(queryText, [orderId, userId]);
    return result.rows[0];
  }

  /**
   * Actualizar estado de pago del pedido
   * @param {string} orderNumber - Número de pedido (ej: ORD-123...)
   * @param {string} status - Nuevo estado (pagado, fallido, pendiente)
   */
  static async updatePaymentStatus(orderNumber, status) {
    // Validar estado permitido
    const validStatuses = ['pendiente', 'pagado', 'fallido', 'reembolsado'];
    if (!validStatuses.includes(status)) {
      throw new Error('Estado de pago no válido');
    }

    const queryText = `
        UPDATE pedidos 
        SET 
            estado_pago = $1,
            estado = CASE 
                WHEN $1 = 'pagado' THEN 'procesando'::estado_pedido_enum
                WHEN $1 = 'fallido' THEN 'cancelado'::estado_pedido_enum
                ELSE estado 
            END,
            fecha_actualizacion = CURRENT_TIMESTAMP
        WHERE numero_pedido = $2
        RETURNING id_pedido, estado_pago, estado
    `;

    const result = await query(queryText, [status, orderNumber]);
    return result.rows[0];
  }
}

module.exports = OrderModel;
