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
            'profesores': 'id_profesor',
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

            const request = pool.request();
            
            // Agregar parámetros dinámicamente
            params.forEach(param => {
                request.input(param.name, mssql.VarChar, param.value);
            });

            const data = await request.query(query);
            
            // Obtener el total de registros para paginación
            const countQuery = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
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
            throw new Error(`Error al obtener registros de ${this.tableName}: ${error.message}`);
        }
    }

    // Obtener un registro por ID
    async findById(id) {
        try {
            const pool = await getConnection();
            const request = pool.request();
            request.input('id', mssql.Int, id);
            const result = await request.query(`SELECT * FROM ${this.tableName} WHERE ${this.idColumn} = @id`);
            
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
            
            // Filtrar campos que no deben actualizarse directamente
            const excludedFields = ['factores_seleccionados', 'calificaciones', 'grupos', 'observaciones'];
            const columns = Object.keys(data).filter(key => 
                key !== this.idColumn && !excludedFields.includes(key)
            );
            
            if (columns.length === 0) {
                console.log('No hay campos para actualizar');
                return true;
            }
            
            const setClause = columns.map((col, index) => `${col} = @param${index}`).join(', ');
            
            const query = `
                UPDATE ${this.tableName}
                SET ${setClause}
                WHERE ${this.idColumn} = @id
            `;

            console.log('Query de actualización:', query);
            console.log('Campos a actualizar:', columns);

            const request = pool.request();
            request.input('id', mssql.Int, id);
            
            // Especificar tipos de datos para cada parámetro
            columns.forEach((col, index) => {
                const value = data[col];
                console.log(`Campo ${col}:`, value, typeof value);
                
                if (value === null || value === undefined) {
                    request.input(`param${index}`, mssql.NVarChar, null);
                } else if (typeof value === 'number') {
                    if (Number.isInteger(value)) {
                        request.input(`param${index}`, mssql.Int, value);
                    } else {
                        request.input(`param${index}`, mssql.Decimal(10, 2), value);
                    }
                } else if (typeof value === 'boolean') {
                    request.input(`param${index}`, mssql.Bit, value);
                } else if (value instanceof Date) {
                    request.input(`param${index}`, mssql.DateTime, value);
                } else if (typeof value === 'string') {
                    // Determinar el tipo de string basado en la longitud
                    if (value.length <= 50) {
                        request.input(`param${index}`, mssql.VarChar(50), value);
                    } else if (value.length <= 200) {
                        request.input(`param${index}`, mssql.VarChar(200), value);
                    } else {
                        request.input(`param${index}`, mssql.Text, value);
                    }
                } else {
                    request.input(`param${index}`, mssql.NVarChar, value);
                }
            });

            const result = await request.query(query);
            console.log('Resultado de actualización:', result.rowsAffected[0]);
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error('Error detallado en update:', error);
            throw new Error(`Error al actualizar registro en ${this.tableName}: ${error.message}`);
        }
    }

    // Eliminar un registro
    async delete(id) {
        try {
            console.log(`Eliminando registro de ${this.tableName} con ID:`, id);
            console.log(`Usando columna ID: ${this.idColumn}`);
            
            const pool = await getConnection();
            const request = pool.request();
            request.input('id', mssql.Int, id);
            
            const query = `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = @id`;
            console.log('Query de eliminación:', query);
            
            const result = await request.query(query);
            console.log('Filas afectadas:', result.rowsAffected[0]);
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            console.error(`Error al eliminar registro de ${this.tableName}:`, error);
            throw new Error(`Error al eliminar registro de ${this.tableName}: ${error.message}`);
        }
    }

    // Obtener el pool de conexiones
    async getPool() {
        return await getConnection();
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
