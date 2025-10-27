const BaseController = require('./BaseController');
const Docente = require('../models/Docente');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class DocenteController extends BaseController {
    constructor() {
        super(new Docente());
    }

    // Obtener docentes activos
    async getActive(req, res) {
        try {
            const docentes = await this.model.findActive();
            
            res.json({
                success: true,
                data: docentes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener docentes activos',
                error: error.message
            });
        }
    }

    // Buscar docente por número de empleado
    async getByNumEmpleado(req, res) {
        try {
            const { numEmpleado } = req.params;
            const docente = await this.model.findByNumEmpleado(numEmpleado);
            
            if (!docente) {
                return res.status(404).json({
                    success: false,
                    message: 'Docente no encontrado'
                });
            }

            res.json({
                success: true,
                data: docente
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar docente por número de empleado',
                error: error.message
            });
        }
    }

    // Obtener grupos asignados a un docente
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
                message: 'Error al obtener grupos del docente',
                error: error.message
            });
        }
    }

    // Obtener calificaciones registradas por un docente
    async getCalificacionesRegistradas(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.getCalificacionesRegistradas(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones registradas',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de un docente
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
                message: 'Error al obtener estadísticas del docente',
                error: error.message
            });
        }
    }

    // Obtener docentes por especialidad
    async getByEspecialidad(req, res) {
        try {
            const { especialidad } = req.params;
            const docentes = await this.model.findByEspecialidad(especialidad);
            
            res.json({
                success: true,
                data: docentes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar docentes por especialidad',
                error: error.message
            });
        }
    }

    // Crear docente con validaciones específicas
    async create(req, res) {
        try {
            const { num_empleado, email } = req.body;

            // Validar que el número de empleado no exista
            const existingDocente = await this.model.findByNumEmpleado(num_empleado);
            if (existingDocente) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un docente con este número de empleado'
                });
            }

            const newDocente = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Docente creado exitosamente',
                data: newDocente
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar docente
    async update(req, res) {
        try {
            const { id } = req.params;
            const { num_empleado } = req.body;

            // Si se está cambiando el número de empleado, verificar que no exista
            if (num_empleado) {
                const existingDocente = await this.model.findByNumEmpleado(num_empleado);
                if (existingDocente && existingDocente.id_docente != id) {
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un docente con este número de empleado'
                    });
                }
            }

            const updatedDocente = await this.model.update(id, req.body);
            
            if (!updatedDocente) {
                return res.status(404).json({
                    success: false,
                    message: 'Docente no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Docente actualizado exitosamente',
                data: updatedDocente
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Autenticar docente por email
    async loginByEmail(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            const docente = await this.model.authenticateByEmail(email, password);

            if (!docente) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    id_docente: docente.id_docente,
                    email: docente.email,
                    nombre: docente.nombre,
                    apellido_paterno: docente.apellido_paterno
                },
                process.env.JWT_SECRET || 'itt-tasd-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Autenticación exitosa',
                data: {
                    docente: {
                        id_docente: docente.id_docente,
                        nombre: docente.nombre,
                        apellido_paterno: docente.apellido_paterno,
                        apellido_materno: docente.apellido_materno,
                        email: docente.email,
                        especialidad: docente.especialidad,
                        grado_academico: docente.grado_academico
                    },
                    token: token
                }
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Autenticar docente por número de empleado
    async loginByNumEmpleado(req, res) {
        try {
            const { numEmpleado, password } = req.body;

            if (!numEmpleado || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Número de empleado y contraseña son requeridos'
                });
            }

            const docente = await this.model.authenticateByNumEmpleado(numEmpleado, password);

            if (!docente) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    id_docente: docente.id_docente,
                    email: docente.email,
                    nombre: docente.nombre,
                    apellido_paterno: docente.apellido_paterno
                },
                process.env.JWT_SECRET || 'itt-tasd-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Autenticación exitosa',
                data: {
                    docente: {
                        id_docente: docente.id_docente,
                        nombre: docente.nombre,
                        apellido_paterno: docente.apellido_paterno,
                        apellido_materno: docente.apellido_materno,
                        email: docente.email,
                        especialidad: docente.especialidad,
                        grado_academico: docente.grado_academico
                    },
                    token: token
                }
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Crear docente con contraseña
    async createWithPassword(req, res) {
        try {
            const { password, ...docenteData } = req.body;

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña es requerida'
                });
            }

            const docente = await this.model.createWithPassword(docenteData, password);

            res.status(201).json({
                success: true,
                message: 'Docente creado exitosamente',
                data: docente
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar contraseña
    async updatePassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Nueva contraseña es requerida'
                });
            }

            const updated = await this.model.updatePassword(id, newPassword);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Docente no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = DocenteController;
