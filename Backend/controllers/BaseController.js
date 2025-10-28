class BaseController {
    constructor(model) {
        this.model = model;
    }

    // Obtener todos los registros
    async getAll(req, res) {
        try {
            const { page = 1, limit = 10, orderBy, orderDirection = 'ASC', ...filters } = req.query;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy,
                orderDirection,
                where: filters
            };

            const result = await this.model.findAll(options);
            
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener registros',
                error: error.message
            });
        }
    }

    // Obtener un registro por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const record = await this.model.findById(id);
            
            if (!record) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }

            res.json({
                success: true,
                data: record
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener registro',
                error: error.message
            });
        }
    }

    // Crear un nuevo registro
    async create(req, res) {
        try {
            const data = req.body;
            const newRecord = await this.model.create(data);
            
            res.status(201).json({
                success: true,
                message: 'Registro creado exitosamente',
                data: newRecord
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear registro',
                error: error.message
            });
        }
    }

    // Actualizar un registro
    async update(req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            
            const updatedRecord = await this.model.update(id, data);
            
            if (!updatedRecord) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Registro actualizado exitosamente',
                data: updatedRecord
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar registro',
                error: error.message
            });
        }
    }

    // Eliminar un registro
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await this.model.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Registro eliminado exitosamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar registro',
                error: error.message
            });
        }
    }

    // Método para manejar errores de validación
    handleValidationError(error, res) {
        const errors = error.errors.map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));

        res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }

    // Método para manejar errores de base de datos
    handleDatabaseError(error, res) {
        let message = 'Error en la base de datos';
        let statusCode = 500;

        if (error.code === 'ER_DUP_ENTRY') {
            message = 'El registro ya existe';
            statusCode = 409;
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            message = 'Referencia a registro inexistente';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = BaseController;
