class MockController {
    constructor() {
        this.data = {
            carreras: [
                { id: 1, nombre: 'Ingeniería en Sistemas', codigo: 'IS' },
                { id: 2, nombre: 'Ingeniería en Informática', codigo: 'II' }
            ],
            estudiantes: [
                { id: 1, nombre: 'Juan Pérez', matricula: '2021001', carrera_id: 1 },
                { id: 2, nombre: 'María García', matricula: '2021002', carrera_id: 1 }
            ],
            docentes: [
                { id: 1, nombre: 'Dr. Carlos López', email: 'carlos@universidad.edu' },
                { id: 2, nombre: 'Dra. Ana Martínez', email: 'ana@universidad.edu' }
            ],
            materias: [
                { id: 1, nombre: 'Programación I', codigo: 'PROG1', creditos: 4 },
                { id: 2, nombre: 'Base de Datos', codigo: 'BD', creditos: 3 }
            ],
            grupos: [
                { id: 1, nombre: 'Grupo A', materia_id: 1, docente_id: 1 },
                { id: 2, nombre: 'Grupo B', materia_id: 2, docente_id: 2 }
            ],
            calificaciones: [
                { id: 1, estudiante_id: 1, grupo_id: 1, calificacion: 85, fecha: '2024-01-15' },
                { id: 2, estudiante_id: 2, grupo_id: 1, calificacion: 92, fecha: '2024-01-15' }
            ],
            factores: [
                { id: 1, nombre: 'Examen Parcial', porcentaje: 40 },
                { id: 2, nombre: 'Tareas', porcentaje: 30 },
                { id: 3, nombre: 'Proyecto', porcentaje: 30 }
            ]
        };
    }

    // Métodos genéricos
    async getAll(req, res) {
        try {
            const entity = req.route.path.split('/')[2];
            const items = this.data[entity] || [];
            res.json({
                success: true,
                data: items,
                count: items.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async getById(req, res) {
        try {
            const entity = req.route.path.split('/')[2];
            const id = parseInt(req.params.id);
            const items = this.data[entity] || [];
            const item = items.find(item => item.id === id);
            
            if (!item) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }
            
            res.json({
                success: true,
                data: item
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async create(req, res) {
        try {
            const entity = req.route.path.split('/')[2];
            const newItem = {
                id: Date.now(), // ID temporal
                ...req.body,
                created_at: new Date().toISOString()
            };
            
            this.data[entity].push(newItem);
            
            res.status(201).json({
                success: true,
                message: 'Registro creado exitosamente',
                data: newItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const entity = req.route.path.split('/')[2];
            const id = parseInt(req.params.id);
            const items = this.data[entity] || [];
            const index = items.findIndex(item => item.id === id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }
            
            items[index] = {
                ...items[index],
                ...req.body,
                updated_at: new Date().toISOString()
            };
            
            res.json({
                success: true,
                message: 'Registro actualizado exitosamente',
                data: items[index]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const entity = req.route.path.split('/')[2];
            const id = parseInt(req.params.id);
            const items = this.data[entity] || [];
            const index = items.findIndex(item => item.id === id);
            
            if (index === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Registro no encontrado'
                });
            }
            
            const deletedItem = items.splice(index, 1)[0];
            
            res.json({
                success: true,
                message: 'Registro eliminado exitosamente',
                data: deletedItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: error.message
            });
        }
    }
}

module.exports = MockController;
