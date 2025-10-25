const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class Materia extends BaseModel {
    constructor() {
        super('materias');
    }

    // Obtener materias activas
    async findActive() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`
                    SELECT * FROM ${this.tableName} 
                    WHERE activo = 1
                    ORDER BY nombre_materia
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener materias activas: ${error.message}`);
        }
    }

    // Buscar materia por clave
    async findByClave(clave) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('clave', mssql.VarChar, clave)
                .query(`SELECT * FROM ${this.tableName} WHERE clave_materia = @clave`);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar materia por clave: ${error.message}`);
        }
    }

    // Obtener grupos de una materia
    async getGrupos(idMateria) {
        try {
            const query = `
                SELECT 
                    g.*,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM grupos g
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE g.id_materia = @idMateria
                ORDER BY g.semestre, g.anio
            `;
            
            return await this.customQuery(query, { idMateria });
        } catch (error) {
            throw new Error(`Error al obtener grupos de la materia: ${error.message}`);
        }
    }

    // Obtener estadísticas de una materia
    async getStats(idMateria) {
        try {
            const query = `
                SELECT 
                    COUNT(DISTINCT g.id_grupo) as total_grupos,
                    COUNT(DISTINCT g.id_estudiante) as total_estudiantes,
                    COUNT(cp.id_calificacion) as total_calificaciones,
                    AVG(cp.calificacion) as promedio_calificaciones,
                    AVG(cp.asistencia) as promedio_asistencia
                FROM grupos g
                LEFT JOIN calificaciones_parciales cp ON g.id_grupo = cp.id_grupo
                WHERE g.id_materia = @idMateria
            `;
            
            return await this.customQuery(query, { idMateria });
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de la materia: ${error.message}`);
        }
    }

    // Buscar materias por nombre
    async searchByNombre(nombre) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('nombre', mssql.VarChar, `%${nombre}%`)
                .query(`
                    SELECT * FROM ${this.tableName} 
                    WHERE nombre_materia LIKE @nombre
                    AND activo = 1
                    ORDER BY nombre_materia
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al buscar materias por nombre: ${error.message}`);
        }
    }

    // Obtener materias por créditos
    async findByCreditos(creditos) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('creditos', mssql.Int, creditos)
                .query(`
                    SELECT * FROM ${this.tableName} 
                    WHERE creditos = @creditos
                    AND activo = 1
                    ORDER BY nombre_materia
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al buscar materias por créditos: ${error.message}`);
        }
    }
}

module.exports = Materia;
