const BaseController = require('./BaseController');
const Factor = require('../models/Factor');

class FactorController extends BaseController {
    constructor() {
        super(new Factor());
    }

    // Obtener factores activos
    async getActive(req, res) {
        try {
            const factores = await this.model.findActive();
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores activos',
                error: error.message
            });
        }
    }

    // Obtener factores por estudiante
    async getByEstudiante(req, res) {
        try {
            const { id } = req.params;
            const factores = await this.model.findByEstudiante(id);
            
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

    // Obtener factores por tipo
    async getByTipo(req, res) {
        try {
            const { tipo } = req.params;
            const factores = await this.model.findByTipo(tipo);
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores por tipo',
                error: error.message
            });
        }
    }

    // Obtener factores por carrera
    async getByCarrera(req, res) {
        try {
            const { id } = req.params;
            const factores = await this.model.findByCarrera(id);
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores por carrera',
                error: error.message
            });
        }
    }

    // Obtener factores por semestre
    async getBySemestre(req, res) {
        try {
            const { semestre } = req.params;
            const factores = await this.model.findBySemestre(semestre);
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores por semestre',
                error: error.message
            });
        }
    }

    // Obtener factores recientes
    async getRecent(req, res) {
        try {
            const factores = await this.model.findRecent();
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores recientes',
                error: error.message
            });
        }
    }

    // Obtener tipos de factores disponibles
    async getTiposFactores(req, res) {
        try {
            const tipos = await this.model.getTiposFactores();
            
            res.json({
                success: true,
                data: tipos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener tipos de factores',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de factores
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
                message: 'Error al obtener estadísticas de factores',
                error: error.message
            });
        }
    }

    // Crear factor con validaciones específicas
    async create(req, res) {
        try {
            const { nombre_factor } = req.body;

            // Validar que el tipo de factor sea válido
            const tiposValidos = [
                'Motivacional', 'Social', 'Académico', 'Transporte', 
                'Trabajo', 'Salud', 'Familiar', 'Económico'
            ];
            
            if (!tiposValidos.includes(nombre_factor)) {
                return res.status(400).json({
                    success: false,
                    message: 'El tipo de factor debe ser uno de: ' + tiposValidos.join(', ')
                });
            }

            const newFactor = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Factor creado exitosamente',
                data: newFactor
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar factor
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre_factor } = req.body;

            // Validar tipo de factor si se está actualizando
            if (nombre_factor) {
                const tiposValidos = [
                    'Motivacional', 'Social', 'Académico', 'Transporte', 
                    'Trabajo', 'Salud', 'Familiar', 'Económico'
                ];
                
                if (!tiposValidos.includes(nombre_factor)) {
                    return res.status(400).json({
                        success: false,
                        message: 'El tipo de factor debe ser uno de: ' + tiposValidos.join(', ')
                    });
                }
            }

            const updatedFactor = await this.model.update(id, req.body);
            
            if (!updatedFactor) {
                return res.status(404).json({
                    success: false,
                    message: 'Factor no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Factor actualizado exitosamente',
                data: updatedFactor
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Desactivar factor (soft delete)
    async deactivate(req, res) {
        try {
            const { id } = req.params;
            const updatedFactor = await this.model.update(id, { activo: 0 });
            
            if (!updatedFactor) {
                return res.status(404).json({
                    success: false,
                    message: 'Factor no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Factor desactivado exitosamente',
                data: updatedFactor
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al desactivar factor',
                error: error.message
            });
        }
    }

    // Activar factor
    async activate(req, res) {
        try {
            const { id } = req.params;
            const updatedFactor = await this.model.update(id, { activo: 1 });
            
            if (!updatedFactor) {
                return res.status(404).json({
                    success: false,
                    message: 'Factor no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Factor activado exitosamente',
                data: updatedFactor
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al activar factor',
                error: error.message
            });
        }
    }
}

module.exports = FactorController;
