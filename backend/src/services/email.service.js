const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Configuración del transporte (Gmail por defecto para pruebas)
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo 
                pass: process.env.EMAIL_PASS  // Tu App Password de Google
            }
        });
    }

    /**
     * Enviar formulario de contacto al administrador
     */
    async sendContactForm({ nombre, email, asunto, mensaje, telefono }) {
        try {
            // Configurar el contenido del correo
            const mailOptions = {
                from: `"Formulario Web Ceveco" <${process.env.EMAIL_USER}>`,
                to: 'sebgameover5@gmail.com', // Destinatario final (Tú)
                replyTo: email, // Para que al dar "Responder" le escribas al cliente
                subject: `Nuevo Mensaje: ${asunto} - [${nombre}]`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2563EB;">Nuevo Mensaje de Contacto</h2>
                        <hr>
                        <p><strong>De:</strong> ${nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${telefono || 'No especificado'}</p>
                        <p><strong>Asunto:</strong> ${asunto}</p>
                        <br>
                        <h3 style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">Mensaje:</h3>
                        <p style="white-space: pre-wrap; background-color: #fff; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">${mensaje}</p>
                        <hr>
                        <p style="font-size: 12px; color: #888;">Este correo fue enviado desde el formulario de contacto de Ceveco.</p>
                    </div>
                `
            };

            // Enviar
            const info = await this.transporter.sendMail(mailOptions);
            console.log('Correo enviado: %s', info.messageId);
            return true;

        } catch (error) {
            console.error('Error enviando correo:', error);
            // No lanzar error para no romper la app, pero retornar false
            return false;
        }
    }
}

module.exports = new EmailService();
