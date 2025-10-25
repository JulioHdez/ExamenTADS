const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class Factor extends BaseModel {
    constructor() {
        super('factores');
    }

    // Obtener factores activos
    async findActive() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`
                    SELECT f.*, e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                           e.num_control, c.nombre_carrera
                    FROM ${this.tableName} f
                    INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE f.activo = 1
                    ORDER BY f.fecha_asignacion DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener factores activos: ${error.message}`);
        }
    }

    // Obtener factores por estudiante
    async findByEstudiante(idEstudiante) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('idEstudiante', mssql.Int, idEstudiante)
                .query(`
                    SELECT f.*, e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                           e.num_control, c.nombre_carrera
                    FROM ${this.tableName} f
                    INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE f.id_estudiante = @idEstudiante
                    ORDER BY f.fecha_asignacion DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener factores del estudiante: ${error.message}`);
        }
    }

    // Obtener factores por tipo
    async findByTipo(nombreFactor) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('nombreFactor', mssql.VarChar, nombreFactor)
                .query(`
                    SELECT f.*, e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                           e.num_control, c.nombre_carrera
                    FROM ${this.tableName} f
                    INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE f.nombre_factor = @nombreFactor AND f.activo = 1
                    ORDER BY f.fecha_asignacion DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener factores por tipo: ${error.message}`);
        }
    }

    // Obtener estadísticas de factores
    async getStats() {
        try {
            const query = `
                SELECT 
                    nombre_factor,
                    COUNT(*) as total,
                    COUNT(CASE WHEN activo = 1 THEN 1 END) as activos,
                    COUNT(CASE WHEN activo = 0 THEN 1 END) as inactivos
                FROM factores
                GROUP BY nombre_factor
                ORDER BY total DESC
            `;
            
            return await this.customQuery(query);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de factores: ${error.message}`);
        }
    }

    // Obtener factores por carrera
    async findByCarrera(idCarrera) {
        try {
            const query = `
                SELECT 
                    f.*, 
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control, 
                    c.nombre_carrera
                FROM factores f
                INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                WHERE e.id_carrera = @idCarrera
                ORDER BY f.fecha_asignacion DESC
            `;
            
            return await this.customQuery(query, { idCarrera });
        } catch (error) {
            throw new Error(`Error al obtener factores por carrera: ${error.message}`);
        }
    }

    // Obtener factores por semestre
    async findBySemestre(semestre) {
        try {
            const query = `
                SELECT 
                    f.*, 
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control, 
                    c.nombre_carrera
                FROM factores f
                INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                WHERE e.semestre_actual = @semestre
                ORDER BY f.fecha_asignacion DESC
            `;
            
            return await this.customQuery(query, { semestre });
        } catch (error) {
            throw new Error(`Error al obtener factores por semestre: ${error.message}`);
        }
    }

    // Obtener factores recientes (últimos 30 días)
    async findRecent() {
        try {
            const query = `
                SELECT 
                    f.*, 
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control, 
                    c.nombre_carrera
                FROM factores f
                INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                WHERE f.fecha_asignacion >= DATEADD(day, -30, GETDATE())
                ORDER BY f.fecha_asignacion DESC
            `;
            
            return await this.customQuery(query);
        } catch (error) {
            throw new Error(`Error al obtener factores recientes: ${error.message}`);
        }
    }

    // Obtener tipos de factores disponibles
    async getTiposFactores() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`
                    SELECT DISTINCT nombre_factor 
                    FROM factores 
                    ORDER BY nombre_factor
                `);
            
            return result.recordset.map(row => row.nombre_factor);
        } catch (error) {
            throw new Error(`Error al obtener tipos de factores: ${error.message}`);
        }
    }
}

module.exports = Factor;
