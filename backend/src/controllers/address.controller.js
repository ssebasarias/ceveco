const AddressModel = require('../models/address.model');

class AddressController {

    static async getAddresses(req, res) {
        try {
            const userId = req.user.id;
            const addresses = await AddressModel.getByUserId(userId);
            res.json({ success: true, data: addresses });
        } catch (error) {
            console.error('Error fetching addresses:', error);
            res.status(500).json({ success: false, message: 'Error recuperando direcciones' });
        }
    }

    static async createAddress(req, res) {
        try {
            const userId = req.user.id;
            const addressData = req.body;

            // Validaciones básicas
            if (!addressData.nombre_destinatario || !addressData.telefono_contacto || !addressData.direccion_linea1) {
                return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
            }

            const newAddress = await AddressModel.create(userId, addressData);
            res.status(201).json({ success: true, data: newAddress, message: 'Dirección agregada' });

        } catch (error) {
            console.error('Error creating address:', error);
            res.status(500).json({ success: false, message: 'Error guardando dirección' });
        }
    }

    static async deleteAddress(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;

            const deleted = await AddressModel.delete(userId, id);

            if (deleted) {
                res.json({ success: true, message: 'Dirección eliminada' });
            } else {
                res.status(404).json({ success: false, message: 'Dirección no encontrada' });
            }

        } catch (error) {
            console.error('Error deleting address:', error);
            res.status(500).json({ success: false, message: 'Error eliminando dirección' });
        }
    }
}

module.exports = AddressController;
