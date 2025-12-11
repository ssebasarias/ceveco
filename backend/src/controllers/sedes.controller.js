const SedeModel = require('../models/sede.model');

class SedeController {

    async getAll(req, res) {
        try {
            const sedes = await SedeModel.findAll();
            res.json({
                success: true,
                data: sedes
            });
        } catch (error) {
            console.error('Error getting sedes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener las sedes'
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const sede = await SedeModel.findById(id);

            if (!sede) {
                return res.status(404).json({
                    success: false,
                    message: 'Sede no encontrada'
                });
            }

            res.json({
                success: true,
                data: sede
            });
        } catch (error) {
            console.error('Error getting sede:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la sede'
            });
        }
    }
}

module.exports = new SedeController();
