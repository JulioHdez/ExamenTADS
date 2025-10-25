const BaseController = require('./BaseController');
const Estudiante = require('../models/Estudiante');

class EstudianteController extends BaseController {
    constructor() {
        super(new Estudiante());
    }

    // Obtener estudiantes activos
    async getActive(req, res) {
        try {
            const estudiantes = await this.model.findActive();
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes activos',
                error: error.message
            });
        }
    }

    // Buscar estudiante por número de control
    async getByNumControl(req, res) {
        try {
            const { numControl } = req.params;
            const estudiante = await this.model.findByNumControl(numControl);
            
            if (!estudiante) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            res.json({
                success: true,
                data: estudiante
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar estudiante por número de control',
                error: error.message
            });
        }
    }

    // Obtener estudiantes por carrera
    async getByCarrera(req, res) {
        try {
            const { idCarrera } = req.params;
            const estudiantes = await this.model.findByCarrera(idCarrera);
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes por carrera',
                error: error.message
            });
        }
    }

    // Obtener estudiantes por semestre
    async getBySemestre(req, res) {
        try {
            const { semestre } = req.params;
            const estudiantes = await this.model.findBySemestre(semestre);
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes por semestre',
                error: error.message
            });
        }
    }

    // Obtener calificaciones de un estudiante
    async getCalificaciones(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.getCalificaciones(id);
            
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

    // Obtener factores de riesgo de un estudiante
    async getFactores(req, res) {
        try {
            const { id } = req.params;
            const factores = await this.model.getFactores(id);
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores del estudiante',
                error: error.message
            });
        }
    }

    // Calcular promedio general del estudiante
    async calcularPromedio(req, res) {
        try {
            const { id } = req.params;
            const promedio = await this.model.calcularPromedio(id);
            
            res.json({
                success: true,
                message: 'Promedio calculado exitosamente',
                data: { promedio }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al calcular promedio del estudiante',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de estudiantes
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
                message: 'Error al obtener estadísticas de estudiantes',
                error: error.message
            });
        }
    }

    // Crear estudiante con validaciones específicas
    async create(req, res) {
        try {
            const { num_control, email, id_carrera, semestre_actual } = req.body;

            // Validar que el número de control no exista
            const existingEstudiante = await this.model.findByNumControl(num_control);
            if (existingEstudiante) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un estudiante con este número de control'
                });
            }

            // Validar semestre
            if (semestre_actual < 1 || semestre_actual > 12) {
                return res.status(400).json({
                    success: false,
                    message: 'El semestre debe estar entre 1 y 12'
                });
            }

            const newEstudiante = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Estudiante creado exitosamente',
                data: newEstudiante
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar estudiante
    async update(req, res) {
        try {
            const { id } = req.params;
            const { num_control, semestre_actual } = req.body;

            // Si se está cambiando el número de control, verificar que no exista
            if (num_control) {
                const existingEstudiante = await this.model.findByNumControl(num_control);
                if (existingEstudiante && existingEstudiante.id_estudiante != id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un estudiante con este número de control'
                    });
                }
            }

            // Validar semestre si se está actualizando
            if (semestre_actual && (semestre_actual < 1 || semestre_actual > 12)) {
                return res.status(400).json({
                    success: false,
                    message: 'El semestre debe estar entre 1 y 12'
                });
            }

            const updatedEstudiante = await this.model.update(id, req.body);
            
            if (!updatedEstudiante) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Estudiante actualizado exitosamente',
                data: updatedEstudiante
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = EstudianteController;
