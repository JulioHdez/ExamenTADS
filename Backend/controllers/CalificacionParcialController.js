const BaseController = require('./BaseController');
const CalificacionParcial = require('../models/CalificacionParcial');

class CalificacionParcialController extends BaseController {
    constructor() {
        super(new CalificacionParcial());
    }

    // Obtener calificaciones con información completa
    async getAllWithDetails(req, res) {
        try {
            const { page = 1, limit = 10, orderBy, orderDirection = 'DESC', ...filters } = req.query;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy,
                orderDirection,
                where: filters
            };

            const result = await this.model.findAllWithDetails(options);
            
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones con detalles',
                error: error.message
            });
        }
    }

    // Obtener calificaciones por grupo
    async getByGrupo(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.findByGrupo(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones del grupo',
                error: error.message
            });
        }
    }

    // Obtener calificaciones por estudiante
    async getByEstudiante(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.findByEstudiante(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones del estudiante',
                error: error.message
            });
        }
    }

    // Obtener calificaciones por docente
    async getByDocente(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.findByDocente(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones del docente',
                error: error.message
            });
        }
    }

    // Obtener calificaciones por materia
    async getByMateria(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.findByMateria(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones de la materia',
                error: error.message
            });
        }
    }

    // Obtener calificaciones por unidad
    async getByUnidad(req, res) {
        try {
            const { numUnidad } = req.params;
            const calificaciones = await this.model.findByUnidad(numUnidad);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones por unidad',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de calificaciones
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
                message: 'Error al obtener estadísticas de calificaciones',
                error: error.message
            });
        }
    }

    // Crear calificación con validaciones específicas
    async create(req, res) {
        try {
            const { id_grupo, num_unidad, calificacion, asistencia } = req.body;

            // Validar que no exista una calificación para el grupo y unidad
            const existsCalificacion = await this.model.existsCalificacion(id_grupo, num_unidad);
            if (existsCalificacion) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una calificación para este grupo y unidad'
                });
            }

            // Validar calificación
            if (calificacion < 0 || calificacion > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'La calificación debe estar entre 0 y 100'
                });
            }

            // Validar asistencia
            if (asistencia < 0 || asistencia > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'La asistencia debe estar entre 0 y 100'
                });
            }

            // Validar unidad
            if (num_unidad < 1 || num_unidad > 3) {
                return res.status(400).json({
                    success: false,
                    message: 'La unidad debe estar entre 1 y 3'
                });
            }

            const newCalificacion = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Calificación creada exitosamente',
                data: newCalificacion
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar calificación
    async update(req, res) {
        try {
            const { id } = req.params;
            const { calificacion, asistencia } = req.body;

            // Validar calificación si se está actualizando
            if (calificacion !== undefined) {
                if (calificacion < 0 || calificacion > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'La calificación debe estar entre 0 y 100'
                    });
                }
            }

            // Validar asistencia si se está actualizando
            if (asistencia !== undefined) {
                if (asistencia < 0 || asistencia > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'La asistencia debe estar entre 0 y 100'
                    });
                }
            }

            const updatedCalificacion = await this.model.update(id, req.body);
            
            if (!updatedCalificacion) {
                return res.status(404).json({
                    success: false,
                    message: 'Calificación no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Calificación actualizada exitosamente',
                data: updatedCalificacion
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = CalificacionParcialController;
