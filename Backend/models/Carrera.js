const BaseModel = require('./BaseModel');

class Carrera extends BaseModel {
    constructor() {
        super('carreras');
    }

    // Obtener carreras activas
    async findActive() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`SELECT * FROM ${this.tableName} WHERE activo = 1 ORDER BY nombre_carrera`);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener carreras activas: ${error.message}`);
        }
    }

    // Buscar carrera por clave
    async findByClave(clave) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('clave', mssql.VarChar, clave)
                .query(`SELECT * FROM ${this.tableName} WHERE clave_carrera = @clave`);
            
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
                    c.nombre_carrera,
                    COUNT(e.id_estudiante) as total_estudiantes,
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
