const AsesorModel = require('../models/asesor.model');

class AsesorController {
    /**
     * Obtener todos los asesores activos
     */
    static async getAll(req, res) {
        try {
            const asesores = await AsesorModel.findAll();

            res.json({
                success: true,
                data: asesores
            });
        } catch (error) {
            console.error('Error obteniendo asesores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener asesores'
            });
        }
    }

    /**
     * Obtener un asesor aleatorio
     */
    static async getRandom(req, res) {
        try {
            const asesor = await AsesorModel.findRandom();

            if (!asesor) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay asesores disponibles'
                });
            }

            res.json({
                success: true,
                data: asesor
            });
        } catch (error) {
            console.error('Error obteniendo asesor aleatorio:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener asesor'
            });
        }
    }

    /**
     * Obtener un asesor por ID
     */
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const asesor = await AsesorModel.findById(id);

            if (!asesor) {
                return res.status(404).json({
                    success: false,
                    message: 'Asesor no encontrado'
                });
            }

            res.json({
                success: true,
                data: asesor
            });
        } catch (error) {
            console.error('Error obteniendo asesor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener asesor'
            });
        }
    }
}

module.exports = AsesorController;
