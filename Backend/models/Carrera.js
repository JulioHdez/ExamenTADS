const BaseModel = require('./BaseModel');

class Carrera extends BaseModel {
    constructor() {
        super('carreras');
    }

    // Obtener todas las carreras activas
    async findActive() {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            const result = await request.query(`
                SELECT * FROM ${this.tableName} 
                WHERE activo = 1 
                ORDER BY nombre_carrera
            `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener carreras activas: ${error.message}`);
        }
    }

    // Buscar carrera por clave
    async findByClave(clave) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            request.input('clave', mssql.VarChar, clave);
            const result = await request.query(`
                SELECT * FROM ${this.tableName} 
                WHERE clave_carrera = @clave AND activo = 1
            `);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar carrera por clave: ${error.message}`);
        }
    }

    // Obtener estadísticas de carreras
    async getStats() {
        try {
            const query = `
                SELECT 
                    c.id_carrera,
                    c.nombre_carrera,
                    COUNT(e.id_estudiante) as total_estudiantes,
                    COUNT(CASE WHEN e.estatus = 'Activo' THEN 1 END) as estudiantes_activos,
                    AVG(e.promedio_general) as promedio_carrera
                FROM carreras c
                LEFT JOIN estudiantes e ON c.id_carrera = e.id_carrera
                WHERE c.activo = 1
                GROUP BY c.id_carrera, c.nombre_carrera
                ORDER BY total_estudiantes DESC
            `;
            
            return await this.customQuery(query);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de carreras: ${error.message}`);
        }
    }
}

module.exports = Carrera;