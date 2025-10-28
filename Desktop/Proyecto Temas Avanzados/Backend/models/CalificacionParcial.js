const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class CalificacionParcial extends BaseModel {
    constructor() {
        super('calificaciones_parciales');
    }

    // Obtener calificaciones con información completa
    async findAllWithDetails(options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                orderBy = 'cp.fecha_evaluacion', 
                orderDirection = 'DESC',
                where = {}
            } = options;

            const offset = (page - 1) * limit;
            let whereClause = '';
            const params = [];

            // Construir cláusula WHERE dinámicamente
            if (Object.keys(where).length > 0) {
                const conditions = Object.keys(where).map((key, index) => {
                    params.push({ name: `param${index}`, value: where[key] });
                    return `cp.${key} = @param${index}`;
                });
                whereClause = `WHERE ${conditions.join(' AND ')}`;
            }

            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    g.semestre,
                    g.anio,
                    g.periodo,
                    m.nombre_materia,
                    m.clave_materia,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    d.num_empleado as docente_num_empleado,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control,
                    c.nombre_carrera
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                ${whereClause}
                ORDER BY ${orderBy} ${orderDirection}
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
            `;

            const pool = this.getPool();
            const request = pool.request();
            
            // Agregar parámetros dinámicamente
            params.forEach(param => {
                request.input(param.name, mssql.VarChar, param.value);
            });

            const data = await request.query(query);
            
            // Obtener el total de registros para paginación
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                ${whereClause}
            `;
            
            const countRequest = pool.request();
            params.forEach(param => {
                countRequest.input(param.name, mssql.VarChar, param.value);
            });
            const countData = await countRequest.query(countQuery);

            return {
                data: data.recordset,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countData.recordset[0].total,
                    pages: Math.ceil(countData.recordset[0].total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener calificaciones con detalles: ${error.message}`);
        }
    }

    // Obtener calificaciones por grupo
    async findByGrupo(idGrupo) {
        try {
            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    m.nombre_materia,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE cp.id_grupo = @idGrupo
                ORDER BY cp.num_unidad, cp.fecha_evaluacion
            `;
            
            return await this.customQuery(query, { idGrupo });
        } catch (error) {
            throw new Error(`Error al obtener calificaciones del grupo: ${error.message}`);
        }
    }

    // Obtener calificaciones por estudiante
    async findByEstudiante(idEstudiante) {
        try {
            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    g.semestre,
                    g.anio,
                    m.nombre_materia,
                    m.clave_materia,
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

    // Obtener calificaciones por docente
    async findByDocente(idDocente) {
        try {
            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    m.nombre_materia,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE cp.id_docente_registro = @idDocente
                ORDER BY cp.fecha_evaluacion DESC
            `;
            
            return await this.customQuery(query, { idDocente });
        } catch (error) {
            throw new Error(`Error al obtener calificaciones del docente: ${error.message}`);
        }
    }

    // Obtener calificaciones por materia
    async findByMateria(idMateria) {
        try {
            const query = `
                SELECT 
                    cp.*,
                    g.clave_grupo,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE g.id_materia = @idMateria
                ORDER BY cp.fecha_evaluacion DESC
            `;
            
            return await this.customQuery(query, { idMateria });
        } catch (error) {
            throw new Error(`Error al obtener calificaciones de la materia: ${error.message}`);
        }
    }

    // Obtener calificaciones por unidad
    async findByUnidad(numUnidad) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('numUnidad', mssql.Int, numUnidad)
                .query(`
                    SELECT 
                        cp.*,
                        g.clave_grupo,
                        m.nombre_materia,
                        d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                        e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                        e.num_control
                    FROM calificaciones_parciales cp
                    INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                    INNER JOIN materias m ON g.id_materia = m.id_materia
                    INNER JOIN docentes d ON g.id_docente = d.id_docente
                    INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                    WHERE cp.num_unidad = @numUnidad
                    ORDER BY cp.fecha_evaluacion DESC
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener calificaciones por unidad: ${error.message}`);
        }
    }

    // Obtener estadísticas de calificaciones
    async getStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_calificaciones,
                    AVG(calificacion) as promedio_general,
                    AVG(asistencia) as promedio_asistencia,
                    COUNT(CASE WHEN calificacion >= 70 THEN 1 END) as aprobados,
                    COUNT(CASE WHEN calificacion < 70 THEN 1 END) as reprobados,
                    COUNT(CASE WHEN asistencia >= 80 THEN 1 END) as buena_asistencia,
                    COUNT(CASE WHEN asistencia < 80 THEN 1 END) as baja_asistencia
                FROM calificaciones_parciales
            `;
            
            return await this.customQuery(query);
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de calificaciones: ${error.message}`);
        }
    }

    // Verificar si ya existe una calificación para el grupo y unidad
    async existsCalificacion(idGrupo, numUnidad) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('idGrupo', mssql.Int, idGrupo)
                .input('numUnidad', mssql.Int, numUnidad)
                .query(`
                    SELECT COUNT(*) as count 
                    FROM calificaciones_parciales 
                    WHERE id_grupo = @idGrupo AND num_unidad = @numUnidad
                `);
            
            return result.recordset[0].count > 0;
        } catch (error) {
            throw new Error(`Error al verificar existencia de calificación: ${error.message}`);
        }
    }
}

module.exports = CalificacionParcial;
