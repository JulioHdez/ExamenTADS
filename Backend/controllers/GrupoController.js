const BaseController = require('./BaseController');
const Grupo = require('../models/Grupo');

class GrupoController extends BaseController {
    constructor() {
        super(new Grupo());
    }

    // Obtener grupos con información completa
    async getAllWithDetails(req, res) {
        try {
            const { page = 1, limit = 10, orderBy, orderDirection = 'ASC', ...filters } = req.query;
            
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
                message: 'Error al obtener grupos con detalles',
                error: error.message
            });
        }
    }

    // Obtener grupos por docente
    async getByDocente(req, res) {
        try {
            const { id } = req.params;
            const grupos = await this.model.findByDocente(id);
            
            res.json({
                success: true,
                data: grupos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupos del docente',
                error: error.message
            });
        }
    }

    // Obtener grupos por estudiante
    async getByEstudiante(req, res) {
        try {
            const { id } = req.params;
            const grupos = await this.model.findByEstudiante(id);
            
            res.json({
                success: true,
                data: grupos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupos del estudiante',
                error: error.message
            });
        }
    }

    // Obtener grupos por materia
    async getByMateria(req, res) {
        try {
            const { id } = req.params;
            const grupos = await this.model.findByMateria(id);
            
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

    // Obtener grupos por semestre y año
    async getBySemestreAnio(req, res) {
        try {
            const { semestre, anio } = req.params;
            const grupos = await this.model.findBySemestreAnio(semestre, anio);
            
            res.json({
                success: true,
                data: grupos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener grupos por semestre y año',
                error: error.message
            });
        }
    }

    // Crear grupo con validaciones específicas
    async create(req, res) {
        try {
            const { id_materia, id_docente, id_estudiante, semestre, anio, periodo } = req.body;

            // Validar que no exista un grupo con los mismos datos
            const existsGroup = await this.model.existsGroup(
                id_materia, id_docente, id_estudiante, semestre, anio, periodo
            );
            
            if (existsGroup) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un grupo con estos datos'
                });
            }

            // Validar año
            const currentYear = new Date().getFullYear();
            if (anio < currentYear - 5 || anio > currentYear + 2) {
                return res.status(400).json({
                    success: false,
                    message: 'El año debe estar entre ' + (currentYear - 5) + ' y ' + (currentYear + 2)
                });
            }

            // Validar período
            const periodosValidos = ['1', '2', 'Verano'];
            if (!periodosValidos.includes(periodo)) {
                return res.status(400).json({
                    success: false,
                    message: 'El período debe ser: 1, 2 o Verano'
                });
            }

            const newGrupo = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Grupo creado exitosamente',
                data: newGrupo
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar grupo
    async update(req, res) {
        try {
            const { id } = req.params;
            const { id_materia, id_docente, id_estudiante, semestre, anio, periodo } = req.body;

            // Si se están cambiando datos únicos, verificar que no exista otro grupo
            if (id_materia && id_docente && id_estudiante && semestre && anio && periodo) {
                const existsGroup = await this.model.existsGroup(
                    id_materia, id_docente, id_estudiante, semestre, anio, periodo
                );
                
                if (existsGroup) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un grupo con estos datos'
                    });
                }
            }

            // Validar año si se está actualizando
            if (anio) {
                const currentYear = new Date().getFullYear();
                if (anio < currentYear - 5 || anio > currentYear + 2) {
                    return res.status(400).json({
                        success: false,
                        message: 'El año debe estar entre ' + (currentYear - 5) + ' y ' + (currentYear + 2)
                    });
                }
            }

            // Validar período si se está actualizando
            if (periodo) {
                const periodosValidos = ['1', '2', 'Verano'];
                if (!periodosValidos.includes(periodo)) {
                    return res.status(400).json({
                        success: false,
                        message: 'El período debe ser: 1, 2 o Verano'
                    });
                }
            }

            const updatedGrupo = await this.model.update(id, req.body);
            
            if (!updatedGrupo) {
                return res.status(404).json({
                    success: false,
                    message: 'Grupo no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Grupo actualizado exitosamente',
                data: updatedGrupo
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = GrupoController;
