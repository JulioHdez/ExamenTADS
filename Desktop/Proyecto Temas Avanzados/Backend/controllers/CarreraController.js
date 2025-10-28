const BaseController = require('./BaseController');
const Carrera = require('../models/Carrera');

class CarreraController extends BaseController {
    constructor() {
        super(new Carrera());
    }

    // Obtener todas las carreras
    async getAll(req, res) {
        try {
            console.log('Obteniendo todas las carreras...');
            const carreras = await this.model.findAll();
            console.log('Carreras encontradas:', carreras.length);
            
            res.json({
                success: true,
                data: carreras.data || carreras,
                message: 'Carreras obtenidas exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener carreras:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Obtener carrera por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const carrera = await this.model.findById(id);
            
            if (!carrera) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada'
                });
            }
            
            res.json({
                success: true,
                data: carrera,
                message: 'Carrera obtenida exitosamente'
            });
        } catch (error) {
            console.error('Error al obtener carrera:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Crear nueva carrera
    async create(req, res) {
        try {
            const carrera = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                data: carrera,
                message: 'Carrera creada exitosamente'
            });
        } catch (error) {
            console.error('Error al crear carrera:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Actualizar carrera
    async update(req, res) {
        try {
            const { id } = req.params;
            const carrera = await this.model.update(id, req.body);
            
            if (!carrera) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada'
                });
            }
            
            res.json({
                success: true,
                data: carrera,
                message: 'Carrera actualizada exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar carrera:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Eliminar carrera
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.model.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Carrera no encontrada'
                });
            }
            
            res.json({
                success: true,
                message: 'Carrera eliminada exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar carrera:', error);
            this.handleDatabaseError(error, res);
        }
    }
}

module.exports = CarreraController;