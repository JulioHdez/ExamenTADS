const BaseController = require('./BaseController');
const Carrera = require('../models/Carrera');

class CarreraController extends BaseController {
    constructor() {
        super(new Carrera());
    }

    // Obtener carreras activas
    async getActive(req, res) {
        try {
            const carreras = await this.model.findActive();
            
            res.json({
                success: true,
                data: carreras
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener carreras activas',
                error: error.message
            });
        }
    }

    // Buscar carrera por clave
    async getByClave(req, res) {
        try {
            const { clave } = req.params;
            const carrera = await this.model.findByClave(clave);
            
            if (!carrera) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada'
                });
            }

            res.json({
                success: true,
                data: carrera
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar carrera por clave',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de carreras
    async getStats(req, res) {
        try {
            const stats = await this.model.getStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de carreras',
                error: error.message
            });
        }
    }

    // Crear carrera con validaciones específicas
    async create(req, res) {
        try {
            const { clave_carrera, nombre_carrera, duracion_semestres } = req.body;

            // Validar que la clave no exista
            const existingCarrera = await this.model.findByClave(clave_carrera);
            if (existingCarrera) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una carrera con esta clave'
                });
            }

            // Validar duración de semestres
            if (duracion_semestres < 1 || duracion_semestres > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'La duración debe estar entre 1 y 20 semestres'
                });
            }

            const newCarrera = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Carrera creada exitosamente',
                data: newCarrera
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar carrera
    async update(req, res) {
        try {
            const { id } = req.params;
            const { clave_carrera } = req.body;

            // Si se está cambiando la clave, verificar que no exista
            if (clave_carrera) {
                const existingCarrera = await this.model.findByClave(clave_carrera);
                if (existingCarrera && existingCarrera.id_carrera != id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe una carrera con esta clave'
                    });
                }
            }

            const updatedCarrera = await this.model.update(id, req.body);
            
            if (!updatedCarrera) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Carrera actualizada exitosamente',
                data: updatedCarrera
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = CarreraController;
