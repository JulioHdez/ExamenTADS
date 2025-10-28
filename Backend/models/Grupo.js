const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class Grupo extends BaseModel {
    constructor() {
        super('grupos');
    }

    // Obtener grupos con información completa
    async findAllWithDetails(options = {}) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                orderBy = 'g.id_grupo', 
                orderDirection = 'ASC',
                where = {}
            } = options;

            const offset = (page - 1) * limit;
            let whereClause = '';
            const params = [];

            // Construir cláusula WHERE dinámicamente
            if (Object.keys(where).length > 0) {
                const conditions = Object.keys(where).map((key, index) => {
                    params.push({ name: `param${index}`, value: where[key] });
                    return `g.${key} = @param${index}`;
                });
                whereClause = `WHERE ${conditions.join(' AND ')}`;
            }

            const query = `
                SELECT 
                    g.*,
                    m.nombre_materia,
                    m.clave_materia,
                    m.creditos,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    d.num_empleado as docente_num_empleado,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control,
                    c.nombre_carrera
                FROM grupos g
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
                FROM grupos g
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
            throw new Error(`Error al obtener grupos con detalles: ${error.message}`);
        }
    }

    // Obtener grupos por docente
    async findByDocente(idDocente) {
        try {
            const query = `
                SELECT 
                    g.*,
                    m.nombre_materia,
                    m.clave_materia,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM grupos g
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE g.id_docente = @idDocente
                ORDER BY g.semestre, g.anio, m.nombre_materia
            `;
            
            return await this.customQuery(query, { idDocente });
        } catch (error) {
            throw new Error(`Error al obtener grupos del docente: ${error.message}`);
        }
    }

    // Obtener grupos por estudiante
    async findByEstudiante(idEstudiante) {
        try {
            const query = `
                SELECT 
                    g.*,
                    m.nombre_materia,
                    m.clave_materia,
                    m.creditos,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    d.num_empleado as docente_num_empleado
                FROM grupos g
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                WHERE g.id_estudiante = @idEstudiante
                ORDER BY g.semestre, g.anio, m.nombre_materia
            `;
            
            return await this.customQuery(query, { idEstudiante });
        } catch (error) {
            throw new Error(`Error al obtener grupos del estudiante: ${error.message}`);
        }
    }

    // Obtener grupos por materia
    async findByMateria(idMateria) {
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

    // Obtener grupos por semestre y año
    async findBySemestreAnio(semestre, anio) {
        try {
            const query = `
                SELECT 
                    g.*,
                    m.nombre_materia,
                    m.clave_materia,
                    d.nombre + ' ' + d.apellido_paterno as docente_nombre,
                    e.nombre + ' ' + e.apellido_paterno as estudiante_nombre,
                    e.num_control
                FROM grupos g
                INNER JOIN materias m ON g.id_materia = m.id_materia
                INNER JOIN docentes d ON g.id_docente = d.id_docente
                INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
                WHERE g.semestre = @semestre AND g.anio = @anio
                ORDER BY m.nombre_materia
            `;
            
            return await this.customQuery(query, { semestre, anio });
        } catch (error) {
            throw new Error(`Error al obtener grupos por semestre y año: ${error.message}`);
        }
    }

    // Verificar si ya existe un grupo con los mismos datos
    async existsGroup(idMateria, idDocente, idEstudiante, semestre, anio, periodo) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('idMateria', mssql.Int, idMateria)
                .input('idDocente', mssql.Int, idDocente)
                .input('idEstudiante', mssql.Int, idEstudiante)
                .input('semestre', mssql.VarChar, semestre)
                .input('anio', mssql.Int, anio)
                .input('periodo', mssql.VarChar, periodo)
                .query(`
                    SELECT COUNT(*) as count 
                    FROM grupos 
                    WHERE id_materia = @idMateria 
                    AND id_docente = @idDocente 
                    AND id_estudiante = @idEstudiante 
                    AND semestre = @semestre 
                    AND anio = @anio 
                    AND periodo = @periodo
                `);
            
            return result.recordset[0].count > 0;
        } catch (error) {
            throw new Error(`Error al verificar existencia del grupo: ${error.message}`);
        }
    }
}

module.exports = Grupo;
