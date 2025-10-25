const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class Estudiante extends BaseModel {
    constructor() {
        super('estudiantes');
    }

    // Obtener estudiantes activos
    async findActive() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`
                    SELECT e.*, c.nombre_carrera 
                    FROM ${this.tableName} e
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE e.estatus = 'Activo'
                    ORDER BY e.apellido_paterno, e.apellido_materno, e.nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener estudiantes activos: ${error.message}`);
        }
    }

    // Buscar estudiante por número de control
    async findByNumControl(numControl) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('numControl', mssql.VarChar, numControl)
                .query(`
                    SELECT e.*, c.nombre_carrera 
                    FROM ${this.tableName} e
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE e.num_control = @numControl
                `);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar estudiante por número de control: ${error.message}`);
        }
    }

    // Obtener estudiantes por carrera
    async findByCarrera(idCarrera) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('idCarrera', mssql.Int, idCarrera)
                .query(`
                    SELECT e.*, c.nombre_carrera 
                    FROM ${this.tableName} e
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE e.id_carrera = @idCarrera
                    ORDER BY e.apellido_paterno, e.apellido_materno, e.nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener estudiantes por carrera: ${error.message}`);
        }
    }

    // Obtener estudiantes por semestre
    async findBySemestre(semestre) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('semestre', mssql.Int, semestre)
                .query(`
                    SELECT e.*, c.nombre_carrera 
                    FROM ${this.tableName} e
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    WHERE e.semestre_actual = @semestre
                    ORDER BY e.apellido_paterno, e.apellido_materno, e.nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener estudiantes por semestre: ${error.message}`);
        }
    }

    // Obtener calificaciones de un estudiante
    async getCalificaciones(idEstudiante) {
        try {
            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    m.nombre_materia,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                WHERE g.id_estudiante = @idEstudiante
                ORDER BY cp.fecha_evaluacion DESC
            `;
            
            return await this.customQuery(query, { idEstudiante });
        } catch (error) {
            throw new Error(`Error al obtener calificaciones del estudiante: ${error.message}`);
        }
    }

    // Obtener factores de riesgo de un estudiante
    async getFactores(idEstudiante) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('idEstudiante', mssql.Int, idEstudiante)
                .query(`
                    SELECT * FROM factores 
                    WHERE id_estudiante = @idEstudiante AND activo = 1
                    ORDER BY fecha_asignacion DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener factores del estudiante: ${error.message}`);
        }
    }

    // Calcular promedio general del estudiante
    async calcularPromedio(idEstudiante) {
        try {
            const query = `
                SELECT AVG(calificacion) as promedio
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                WHERE g.id_estudiante = @idEstudiante
            `;
            
            const result = await this.customQuery(query, { idEstudiante });
            const promedio = result[0]?.promedio || 0;
            
            // Actualizar el promedio en la tabla estudiantes
            await this.update(idEstudiante, { promedio_general: Math.round(promedio * 100) / 100 });
            
            return promedio;
        } catch (error) {
            throw new Error(`Error al calcular promedio del estudiante: ${error.message}`);
        }
    }

    // Obtener estadísticas de estudiantes
    async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_estudiantes,
                    COUNT(CASE WHEN estatus = 'Activo' THEN 1 END) as activos,
                    COUNT(CASE WHEN estatus = 'Egresado' THEN 1 END) as egresados,
                    COUNT(CASE WHEN estatus = 'Baja temporal' THEN 1 END) as baja_temporal,
                    COUNT(CASE WHEN estatus = 'Baja definitiva' THEN 1 END) as baja_definitiva,
                    AVG(promedio_general) as promedio_general,
                    COUNT(CASE WHEN genero = 'M' THEN 1 END) as masculino,
                    COUNT(CASE WHEN genero = 'F' THEN 1 END) as femenino
                FROM estudiantes
            `;
            
            return await this.customQuery(query);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de estudiantes: ${error.message}`);
        }
    }
}

module.exports = Estudiante;
