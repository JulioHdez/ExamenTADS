const BaseController = require('./BaseController');
const Profesor = require('../models/Profesor');
const jwt = require('jsonwebtoken');

class ProfesorController extends BaseController {
    constructor() {
        super(new Profesor());
    }

    // Autenticar profesor por correo
    async loginByCorreo(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Correo y contraseña son requeridos'
                });
            }

            const profesor = await this.model.authenticateByCorreo(email, password);

            if (!profesor) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    id_profesor: profesor.id_profesor,
                    correo: profesor.correo,
                    nombre: profesor.nombre,
                    apellido_paterno: profesor.apellido_paterno,
                    id_rol: profesor.id_rol,
                    nombre_rol: profesor.nombre_rol,
                    id_carrera: profesor.id_carrera,
                    nombre_carrera: profesor.nombre_carrera,
                    tipo: 'profesor'
                },
                process.env.JWT_SECRET || 'itt-tasd-secret-key',
                { expiresIn: '24h' }
            );

            res.json({
                success: true,
                message: 'Autenticación exitosa',
                data: {
                    profesor: {
                        id_profesor: profesor.id_profesor,
                        nombre: profesor.nombre,
                        apellido_paterno: profesor.apellido_paterno,
                        apellido_materno: profesor.apellido_materno,
                        correo: profesor.correo,
                        id_carrera: profesor.id_carrera,
                        nombre_carrera: profesor.nombre_carrera,
                        id_rol: profesor.id_rol,
                        nombre_rol: profesor.nombre_rol
                    },
                    token: token
                }
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Obtener materias del profesor
    async getMaterias(req, res) {
        try {
            const { id } = req.params;
            const materias = await this.model.getMaterias(parseInt(id));
            
            res.json({
                success: true,
                data: materias
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Obtener estudiantes del profesor
    async getEstudiantes(req, res) {
        try {
            const { id } = req.params;
            const estudiantes = await this.model.getEstudiantes(parseInt(id));
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = ProfesorController;

