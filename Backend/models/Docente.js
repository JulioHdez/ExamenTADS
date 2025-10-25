const BaseModel = require('./BaseModel');
const { getConnection, mssql } = require('../config/connection');
const bcrypt = require('bcryptjs');

class Docente extends BaseModel {
    constructor() {
        super('docentes');
    }

    // Obtener docentes activos
    async findActive() {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .query(`
                    SELECT * FROM ${this.tableName} 
                    WHERE estatus = 'Activo'
                    ORDER BY apellido_paterno, apellido_materno, nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener docentes activos: ${error.message}`);
        }
    }

    // Buscar docente por número de empleado
    async findByNumEmpleado(numEmpleado) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('numEmpleado', mssql.VarChar, numEmpleado)
                .query(`SELECT * FROM ${this.tableName} WHERE num_empleado = @numEmpleado`);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar docente por número de empleado: ${error.message}`);
        }
    }

    // Obtener grupos asignados a un docente
    async getGrupos(idDocente) {
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

    // Obtener calificaciones registradas por un docente
    async getCalificacionesRegistradas(idDocente) {
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
            throw new Error(`Error al obtener calificaciones registradas: ${error.message}`);
        }
    }

    // Obtener estadísticas de un docente
    async getStats(idDocente) {
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
                WHERE g.id_docente = @idDocente
            `;
            
            return await this.customQuery(query, { idDocente });
        } catch (error) {
            throw new Error(`Error al obtener estadísticas del docente: ${error.message}`);
        }
    }

    // Obtener docentes por especialidad
    async findByEspecialidad(especialidad) {
        try {
            const pool = this.getPool();
            const result = await pool.request()
                .input('especialidad', mssql.VarChar, especialidad)
                .query(`
                    SELECT * FROM ${this.tableName} 
                    WHERE especialidad LIKE '%' + @especialidad + '%'
                    AND estatus = 'Activo'
                    ORDER BY apellido_paterno, apellido_materno, nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al buscar docentes por especialidad: ${error.message}`);
        }
    }

    // Métodos para manejo de contraseñas
    async hashPassword(password) {
        try {
            const saltRounds = 12;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            throw new Error(`Error al cifrar contraseña: ${error.message}`);
        }
    }

    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            throw new Error(`Error al verificar contraseña: ${error.message}`);
        }
    }

    // Crear docente con contraseña cifrada
    async createWithPassword(docenteData, password) {
        try {
            const hashedPassword = await this.hashPassword(password);
            const docenteDataWithPassword = {
                ...docenteData,
                contrasena: hashedPassword
            };
            return await this.create(docenteDataWithPassword);
        } catch (error) {
            throw new Error(`Error al crear docente con contraseña: ${error.message}`);
        }
    }

    // Actualizar contraseña de docente
    async updatePassword(id, newPassword) {
        try {
            const hashedPassword = await this.hashPassword(newPassword);
            const pool = await getConnection();
            const result = await pool.request()
                .input('id', mssql.Int, id)
                .input('contrasena', mssql.NVarChar, hashedPassword)
                .query(`
                    UPDATE ${this.tableName} 
                    SET contrasena = @contrasena 
                    WHERE id = @id
                `);
            
            return result.rowsAffected[0] > 0;
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    // Autenticar docente por email y contraseña
    async authenticateByEmail(email, password) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('email', mssql.NVarChar, email)
                .query(`
                    SELECT id_docente, nombre, apellido_paterno, apellido_materno, email, contrasena, estatus
                    FROM ${this.tableName} 
                    WHERE email = @email AND estatus = 'Activo'
                `);
            
            if (result.recordset.length === 0) {
                return null; // Docente no encontrado
            }
            
            const docente = result.recordset[0];
            const isValidPassword = await this.verifyPassword(password, docente.contrasena);
            
            if (isValidPassword) {
                // No devolver la contraseña en la respuesta
                delete docente.contrasena;
                return docente;
            }
            
            return null; // Contraseña incorrecta
        } catch (error) {
            throw new Error(`Error al autenticar docente: ${error.message}`);
        }
    }

    // Autenticar docente por número de empleado y contraseña
    async authenticateByNumEmpleado(numEmpleado, password) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('numEmpleado', mssql.NVarChar, numEmpleado)
                .query(`
                    SELECT id_docente, nombre, apellido_paterno, apellido_materno, email, contrasena, estatus
                    FROM ${this.tableName} 
                    WHERE num_empleado = @numEmpleado AND estatus = 'Activo'
                `);
            
            if (result.recordset.length === 0) {
                return null; // Docente no encontrado
            }
            
            const docente = result.recordset[0];
            const isValidPassword = await this.verifyPassword(password, docente.contrasena);
            
            if (isValidPassword) {
                // No devolver la contraseña en la respuesta
                delete docente.contrasena;
                return docente;
            }
            
            return null; // Contraseña incorrecta
        } catch (error) {
            throw new Error(`Error al autenticar docente: ${error.message}`);
        }
    }
}

module.exports = Docente;
