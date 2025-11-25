const BaseController = require('./BaseController');
const PreferenciaAccesibilidad = require('../models/PreferenciaAccesibilidad');

class PreferenciaAccesibilidadController extends BaseController {
    constructor() {
        super(new PreferenciaAccesibilidad());
    }

    // Obtener preferencias del usuario autenticado
    async getMyPreferences(req, res) {
        try {
            const user = req.user;
            if (!user || (!user.id_docente && !user.id_profesor)) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const idUsuario = user.id_docente || user.id_profesor;
            const tipoUsuario = user.id_docente ? 'docente' : 'profesor';

            const preferencias = await this.model.findByUsuario(idUsuario, tipoUsuario);

            // Si no hay preferencias guardadas, retornar null en lugar de valores por defecto
            // Esto permite que el frontend mantenga los valores actuales
            res.json({
                success: true,
                data: preferencias || null
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener preferencias',
                error: error.message
            });
        }
    }

    // Guardar preferencias del usuario autenticado
    async saveMyPreferences(req, res) {
        try {
            const user = req.user;
            if (!user || (!user.id_docente && !user.id_profesor)) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const idUsuario = user.id_docente || user.id_profesor;
            const tipoUsuario = user.id_docente ? 'docente' : 'profesor';

            const preferencias = {
                id_usuario: idUsuario,
                tipo_usuario: tipoUsuario,
                ...req.body
            };

            const resultado = await this.model.saveOrUpdate(preferencias);

            res.json({
                success: true,
                message: 'Preferencias guardadas correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al guardar preferencias',
                error: error.message
            });
        }
    }

    // Actualizar una preferencia específica
    async updatePreferencia(req, res) {
        try {
            const user = req.user;
            if (!user || (!user.id_docente && !user.id_profesor)) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const idUsuario = user.id_docente || user.id_profesor;
            const tipoUsuario = user.id_docente ? 'docente' : 'profesor';
            const { campo, valor } = req.body;

            if (!campo) {
                return res.status(400).json({
                    success: false,
                    message: 'Campo requerido'
                });
            }

            const resultado = await this.model.updatePreferencia(idUsuario, tipoUsuario, campo, valor);

            res.json({
                success: true,
                message: 'Preferencia actualizada correctamente',
                data: resultado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar preferencia',
                error: error.message
            });
        }
    }
}

module.exports = PreferenciaAccesibilidadController;

