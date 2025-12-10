const crypto = require('crypto');
const OrderModel = require('../models/order.model');

class WebhookController {

    /**
     * Manejar eventos de Wompi
     * Endpoint público para recibir notificaciones de transacciones
     */
    static async handleWompiEvent(req, res) {
        try {
            const { event, data, signature, timestamp, environment } = req.body;

            console.log('📨 Webhook Wompi Recibido:', event);

            // 1. Validar integridad de la firma (Seguridad)
            // Wompi envía una firma para asegurar que el mensaje es legítimo
            // Formula: SHA256(data.transaction.id + data.transaction.status + data.transaction.amount_in_cents + timestamp + SECRET)
            const wompiSecret = process.env.WOMPI_EVENTS_SECRET;

            if (wompiSecret && signature && data && data.transaction) {
                const transaction = data.transaction;
                const chain = `${transaction.id}${transaction.status}${transaction.amount_in_cents}${timestamp}${wompiSecret}`;
                const calculatedChecksum = crypto.createHash('sha256').update(chain).digest('hex');

                if (calculatedChecksum !== signature.checksum) {
                    console.error('❌ Error de seguridad: Firma Webhook inválida');
                    return res.status(400).json({ success: false, message: 'Invalid signature' });
                }
            } else {
                console.warn('⚠️ Alerta: Webhook recibido sin validación de firma (Configurar WOMPI_EVENTS_SECRET en .env)');
            }

            // 2. Procesar solo eventos de actualización de transacción
            if (event === 'transaction.updated') {
                const transaction = data.transaction;
                const reference = transaction.reference;
                const status = transaction.status; // 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'

                console.log(`📦 Procesando Orden: ${reference} | Estado Wompi: ${status}`);

                // Mapear estado Wompi a estado interno
                let paymentStatus = 'pendiente';
                if (status === 'APPROVED') paymentStatus = 'pagado';
                else if (status === 'DECLINED') paymentStatus = 'fallido';
                else if (status === 'VOIDED') paymentStatus = 'anulado';
                else if (status === 'ERROR') paymentStatus = 'fallido';

                // 3. Actualizar la orden en la Base de Datos
                // Nota: La orden debe existir previamente.
                try {
                    const updatedOrder = await OrderModel.updatePaymentStatus(reference, paymentStatus);

                    if (updatedOrder) {
                        console.log(`✅ Orden ${reference} actualizada a ${paymentStatus}`);
                    } else {
                        console.warn(`⚠️ Orden ${reference} no encontrada en la BD (Posible retraso en creación o referencia incorrecta)`);
                        // Aquí podríamos implementar lógica para crear la orden si viene toda la data, 
                        // pero por reglas de negocio usualmemte se requiere el carrito del usuario.
                    }
                } catch (dbError) {
                    console.error(`❌ Error al actualizar BD para orden ${reference}:`, dbError.message);
                    // No retornamos error 500 para que Wompi no reintente infinitamente si es error lógico,
                    // pero sí si es error de conexión.
                }
            }

            // Siempre responder 200 OK a Wompi lo más rápido posible
            res.status(200).json({ success: true });

        } catch (error) {
            console.error('❌ Error fatal en Webhook:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    }
}

module.exports = WebhookController;
