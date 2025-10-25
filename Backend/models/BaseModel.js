const { getConnection, mssql } = require('../config/connection');

class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.idColumn = this.getIdColumnName();
    }

    // Obtener el nombre de la columna ID según la tabla
    getIdColumnName() {
        const idColumns = {
            'docentes': 'id_docente',
            'estudiantes': 'id_estudiante',
            'carreras': 'id_carrera',
            'materias': 'id_materia',
            'grupos': 'id_grupo',
            'calificaciones_parciales': 'id_calificacion',
            'factores': 'id_factor'
        };
        return idColumns[this.tableName] || 'id';
    }

    // Obtener todos los registros
    async findAll(options = {}) {
        try {
            const pool = await getConnection();
            const { 
                page = 1, 
                limit = 10, 
                orderBy = this.idColumn, 
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
                    return `${key} = @param${index}`;
                });
                whereClause = `WHERE ${conditions.join(' AND ')}`;
            }

            const query = `
                SELECT * FROM ${this.tableName}
                ${whereClause}
                ORDER BY ${orderBy} ${orderDirection}
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
            `;

            const result = await pool.request();
            
            // Agregar parámetros dinámicamente
            params.forEach(param => {
                result.input(param.name, mssql.VarChar, param.value);
            });

            const data = await result.query(query);
            
            // Obtener el total de registros para paginación
            const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
            const countResult = await pool.request();
            params.forEach(param => {
                countResult.input(param.name, mssql.VarChar, param.value);
            });
            const countData = await countResult.query(countQuery);

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
            throw new Error(`Error al obtener registros de ${this.tableName}: ${error.message}`);
        }
    }

    // Obtener un registro por ID
    async findById(id) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .query(`SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = @id`);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al obtener registro de ${this.tableName}: ${error.message}`);
        }
    }

    // Crear un nuevo registro
    async create(data) {
        try {
            const pool = await getConnection();
            const columns = Object.keys(data);
            const values = columns.map((col, index) => `@param${index}`);
            
            const query = `
                INSERT INTO ${this.tableName} (${columns.join(', ')})
                OUTPUT INSERTED.*
                VALUES (${values.join(', ')})
            `;

            const request = pool.request();
            columns.forEach((col, index) => {
                request.input(`param${index}`, data[col]);
            });

            const result = await request.query(query);
            return result.recordset[0];
        } catch (error) {
            throw new Error(`Error al crear registro en ${this.tableName}: ${error.message}`);
        }
    }

    // Actualizar un registro
    async update(id, data) {
        try {
            const pool = await getConnection();
            const columns = Object.keys(data);
            const setClause = columns.map((col, index) => `${col} = @param${index}`).join(', ');
            
            const query = `
                UPDATE ${this.tableName}
                SET ${setClause}
                OUTPUT INSERTED.*
                WHERE ${this.idColumn} = @id
            `;

            const request = pool.request().input('id', mssql.Int, id);
            columns.forEach((col, index) => {
                request.input(`param${index}`, data[col]);
            });

            const result = await request.query(query);
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al actualizar registro en ${this.tableName}: ${error.message}`);
        }
    }

    // Eliminar un registro
    async delete(id) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .query(`DELETE FROM ${this.tableName} WHERE ${this.idColumn} = @id`);
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error(`Error al eliminar registro de ${this.tableName}: ${error.message}`);
        }
    }

    // Ejecutar consulta personalizada
    async customQuery(query, params = {}) {
        try {
            const pool = await getConnection();
            const request = pool.request();
            
            // Agregar parámetros dinámicamente
            Object.keys(params).forEach(key => {
                request.input(key, params[key]);
            });

            const result = await request.query(query);
            return result.recordset;
        } catch (error) {
            throw new Error(`Error en consulta personalizada: ${error.message}`);
        }
    }
}

module.exports = BaseModel;
