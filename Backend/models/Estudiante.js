const BaseModel = require('./BaseModel');
const { mssql } = require('../config/connection');

class Estudiante extends BaseModel {
    constructor() {
        super('estudiantes');
    }

    // Obtener estudiantes activos
    async findActive() {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            const result = await request.query(`
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
            const pool = await this.getPool();
            const request = pool.request();
            request.input('numControl', mssql.VarChar, numControl);
            const result = await request.query(`
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
            const pool = await this.getPool();
            const request = pool.request();
            request.input('idCarrera', mssql.Int, idCarrera);
            const result = await request.query(`
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
            const pool = await this.getPool();
            const request = pool.request();
            request.input('semestre', mssql.Int, semestre);
            const result = await request.query(`
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
            const pool = await this.getPool();
            const request = pool.request();
            request.input('idEstudiante', mssql.Int, idEstudiante);
            const result = await request.query(`
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

    // Crear estudiante con tipos de datos correctos
    async createEstudiante(data) {
        try {
            const pool = await this.getPool();
            const request = pool.request();
            
            // Mapear campos con sus tipos correctos
            request.input('num_control', mssql.VarChar(20), data.num_control);
            request.input('apellido_paterno', mssql.VarChar(50), data.apellido_paterno);
            request.input('apellido_materno', mssql.VarChar(50), data.apellido_materno);
            request.input('nombre', mssql.VarChar(50), data.nombre);
            request.input('genero', mssql.VarChar(20), data.genero);
            request.input('fecha_nacimiento', mssql.Date, data.fecha_nacimiento);
            request.input('email', mssql.VarChar(100), data.email);
            request.input('telefono', mssql.VarChar(15), data.telefono || null);
            request.input('direccion', mssql.Text, data.direccion || null);
            request.input('id_carrera', mssql.Int, data.id_carrera);
            request.input('semestre_actual', mssql.Int, data.semestre_actual);
            request.input('fecha_ingreso', mssql.Date, data.fecha_ingreso);
            request.input('estatus', mssql.VarChar(20), data.estatus || null);
            // Manejar promedio_general: debe ser null si no existe, o un número válido entre 0 y 99.99
            let promedioValue = null;
            if (data.promedio_general !== null && data.promedio_general !== undefined && data.promedio_general !== '') {
                const numValue = typeof data.promedio_general === 'string' ? parseFloat(data.promedio_general) : data.promedio_general;
                if (!isNaN(numValue) && isFinite(numValue)) {
                    // Asegurar que esté en el rango válido para Decimal(4,2): 0 a 99.99
                    promedioValue = Math.max(0, Math.min(99.99, Math.round(numValue * 100) / 100));
                }
            }
            request.input('promedio_general', mssql.Decimal(4, 2), promedioValue);
            
            const query = `
                INSERT INTO ${this.tableName} (
                    num_control, apellido_paterno, apellido_materno, nombre, genero,
                    fecha_nacimiento, email, telefono, direccion, id_carrera,
                    semestre_actual, fecha_ingreso, estatus, promedio_general,
                    fecha_registro, fecha_actualizacion
                )
                OUTPUT INSERTED.*
                VALUES (
                    @num_control, @apellido_paterno, @apellido_materno, @nombre, @genero,
                    @fecha_nacimiento, @email, @telefono, @direccion, @id_carrera,
                    @semestre_actual, @fecha_ingreso, @estatus, @promedio_general,
                    GETDATE(), GETDATE()
                )
            `;
            
            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            throw new Error(`Error al crear estudiante: ${error.message}`);
        }
    }

    // Obtener todos los estudiantes con información de carrera
    async findAllWithCarreras(options = {}) {
        try {
            const pool = await this.getPool();
            const { 
                page = 1, 
                limit = 100, 
                orderBy = 'num_control', 
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
                    return `e.${key} = @param${index}`;
                });
                whereClause = `WHERE ${conditions.join(' AND ')}`;
            }

            const query = `
                SELECT 
                    e.*,
                    c.nombre_carrera,
                    c.clave_carrera
                FROM estudiantes e
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                ${whereClause}
                ORDER BY e.${orderBy} ${orderDirection}
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
            `;

            const request = pool.request();
            params.forEach(param => {
                request.input(param.name, param.value);
            });

            const result = await request.query(query);

            // Obtener el total de registros para paginación
            const countQuery = `
                SELECT COUNT(*) as total
                FROM estudiantes e
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                ${whereClause}
            `;

            const countRequest = pool.request();
            params.forEach(param => {
                countRequest.input(param.name, param.value);
            });

            const countResult = await countRequest.query(countQuery);
            const total = countResult.recordset[0].total;

            return {
                data: result.recordset,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Error al obtener estudiantes con carreras: ${error.message}`);
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
                    AVG(CASE WHEN promedio_general IS NOT NULL THEN promedio_general ELSE 0 END) as promedio_general,
                    COUNT(CASE WHEN genero = 'M' THEN 1 END) as masculino,
                    COUNT(CASE WHEN genero = 'F' THEN 1 END) as femenino,
                    COUNT(CASE WHEN promedio_general IS NOT NULL AND promedio_general >= 70 THEN 1 END) as aprobados,
                    COUNT(CASE WHEN promedio_general IS NOT NULL AND promedio_general < 70 AND promedio_general > 0 THEN 1 END) as reprobados,
                    COUNT(CASE WHEN estatus IN ('Baja temporal', 'Baja definitiva') THEN 1 END) as desercion
                FROM estudiantes
            `;
            
            const result = await this.customQuery(query);
            return result;
        } catch (error) {
            throw new Error(`Error al obtener estadísticas de estudiantes: ${error.message}`);
        }
    }
}

module.exports = Estudiante;
