const EmailService = require('../services/email.service');

class ContactController {

    /**
     * Manejar envío del formulario de contacto
     */
    static async sendContactEmail(req, res) {
        try {
            const { nombre, email, asunto, mensaje, telefono } = req.body;

            // Validaciones básicas
            if (!nombre || !email || !mensaje) {
                return res.status(400).json({
                    success: false,
                    message: 'Por favor completa los campos obligatorios (Nombre, Email, Mensaje)'
                });
            }

            // Validar formato de email simple
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'El formato del correo electrónico no es válido'
                });
            }

            // Enviar el correo
            const success = await EmailService.sendContactForm({
                nombre,
                email,
                asunto: asunto || 'Consulta General',
                mensaje,
                telefono
            });

            if (success) {
                res.status(200).json({
                    success: true,
                    message: '¡Gracias! Tu mensaje ha sido enviado correctamente.'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Hubo un problema técnico al enviar el correo. Por favor intenta más tarde o contáctanos por teléfono.'
                });
            }

        } catch (error) {
            console.error('Error en ContactController:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = ContactController;
