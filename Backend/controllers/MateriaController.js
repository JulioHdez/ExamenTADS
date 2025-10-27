const BaseController = require('./BaseController');
const Materia = require('../models/Materia');

class MateriaController extends BaseController {
    constructor() {
        super(new Materia());
    }

    // Obtener materias activas
    async getActive(req, res) {
        try {
            const materias = await this.model.findActive();
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener materias activas',
                error: error.message
            });
        }
    }

    // Buscar materia por clave
    async getByClave(req, res) {
        try {
            const { clave } = req.params;
            const materia = await this.model.findByClave(clave);
            
            if (!materia) {
                return res.status(404).json({
                    success: false,
                    message: 'Materia no encontrada'
                });
            }

            res.json({
                success: true,
                data: materia
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar materia por clave',
                error: error.message
            });
        }
    }

    // Obtener grupos de una materia
    async getGrupos(req, res) {
        try {
            const { id } = req.params;
            const grupos = await this.model.getGrupos(id);
            
            res.json({
                success: true,
                data: grupos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupos de la materia',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de una materia
    async getStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await this.model.getStats(id);
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de la materia',
                error: error.message
            });
        }
    }

    // Obtener materias por carrera
    async getByCarrera(req, res) {
        try {
            const { carreraId } = req.params;
            const materias = await this.model.findByCarrera(carreraId);
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener materias por carrera',
                error: error.message
            });
        }
    }

    // Obtener materias básicas comunes
    async getBasicas(req, res) {
        try {
            const materias = await this.model.findBasicas();
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener materias básicas',
                error: error.message
            });
        }
    }

    // Buscar materias por nombre
    async searchByNombre(req, res) {
        try {
            const { nombre } = req.query;
            const materias = await this.model.searchByNombre(nombre);
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar materias por nombre',
                error: error.message
            });
        }
    }

    // Obtener materias por créditos
    async getByCreditos(req, res) {
        try {
            const { creditos } = req.params;
            const materias = await this.model.findByCreditos(creditos);
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar materias por créditos',
                error: error.message
            });
        }
    }

    // Crear materia con validaciones específicas
    async create(req, res) {
        try {
            const { clave_materia, creditos, horas_teoria, horas_practica } = req.body;

            // Validar que la clave no exista
            const existingMateria = await this.model.findByClave(clave_materia);
            if (existingMateria) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe una materia con esta clave'
                });
            }

            // Validar créditos
            if (creditos < 1 || creditos > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Los créditos deben estar entre 1 y 20'
                });
            }

            // Validar horas si se proporcionan
            if (horas_teoria && (horas_teoria < 0 || horas_teoria > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Las horas de teoría deben estar entre 0 y 100'
                });
            }

            if (horas_practica && (horas_practica < 0 || horas_practica > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Las horas de práctica deben estar entre 0 y 100'
                });
            }

            const newMateria = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Materia creada exitosamente',
                data: newMateria
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar materia
    async update(req, res) {
        try {
            const { id } = req.params;
            const { clave_materia, creditos, horas_teoria, horas_practica } = req.body;

            // Si se está cambiando la clave, verificar que no exista
            if (clave_materia) {
                const existingMateria = await this.model.findByClave(clave_materia);
                if (existingMateria && existingMateria.id_materia != id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe una materia con esta clave'
                    });
                }
            }

            // Validar créditos si se están actualizando
            if (creditos && (creditos < 1 || creditos > 20)) {
                return res.status(400).json({
                    success: false,
                    message: 'Los créditos deben estar entre 1 y 20'
                });
            }

            // Validar horas si se están actualizando
            if (horas_teoria && (horas_teoria < 0 || horas_teoria > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Las horas de teoría deben estar entre 0 y 100'
                });
            }

            if (horas_practica && (horas_practica < 0 || horas_practica > 100)) {
                return res.status(400).json({
                    success: false,
                    message: 'Las horas de práctica deben estar entre 0 y 100'
                });
            }

            const updatedMateria = await this.model.update(id, req.body);
            
            if (!updatedMateria) {
                return res.status(404).json({
                    success: false,
                    message: 'Materia no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Materia actualizada exitosamente',
                data: updatedMateria
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = MateriaController;
