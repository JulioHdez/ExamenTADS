const BaseModel = require('./BaseModel');
const { getConnection, mssql } = require('../config/connection');
const bcrypt = require('bcryptjs');

class Profesor extends BaseModel {
    constructor() {
        super('profesores');
    }

    // Obtener el nombre de la columna ID
    getIdColumnName() {
        return 'id_profesor';
    }

    // Hash de contraseña
    async hashPassword(password) {
        try {
            const salt = await bcrypt.genSalt(10);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw new Error(`Error al hashear contraseña: ${error.message}`);
        }
    }

    // Verificar contraseña
    async verifyPassword(password, storedPassword) {
        try {
            // Si la contraseña almacenada empieza con $2a$ o $2b$, es un hash de bcrypt
            if (storedPassword && (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$'))) {
                // Comparar con bcrypt
                return await bcrypt.compare(password, storedPassword);
            } else {
                // Comparación en texto plano (para compatibilidad con contraseñas antiguas)
                return password === storedPassword;
            }
        } catch (error) {
            throw new Error(`Error al verificar contraseña: ${error.message}`);
        }
    }

    // Buscar profesor por correo
    async findByCorreo(correo) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('correo', mssql.VarChar, correo)
                .query(`
                    SELECT p.*, r.nombre_rol, c.nombre_carrera
                    FROM ${this.tableName} p
                    INNER JOIN roles r ON p.id_rol = r.id_rol
                    INNER JOIN carreras c ON p.id_carrera = c.id_carrera
                    WHERE p.correo = @correo
                `);
            
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Error al buscar profesor por correo: ${error.message}`);
        }
    }

    // Autenticar profesor por correo y contraseña
    async authenticateByCorreo(correo, password) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('correo', mssql.NVarChar, correo)
                .query(`
                    SELECT 
                        p.id_profesor, 
                        p.nombre, 
                        p.apellido_paterno, 
                        p.apellido_materno, 
                        p.correo, 
                        p.contrasena, 
                        p.id_carrera,
                        p.id_rol,
                        r.nombre_rol,
                        c.nombre_carrera
                    FROM ${this.tableName} p
                    INNER JOIN roles r ON p.id_rol = r.id_rol
                    INNER JOIN carreras c ON p.id_carrera = c.id_carrera
                    WHERE p.correo = @correo
                `);
            
            if (result.recordset.length === 0) {
                return null; // Profesor no encontrado
            }
            
            const profesor = result.recordset[0];
            const isValidPassword = await this.verifyPassword(password, profesor.contrasena);
            
            if (isValidPassword) {
                // No devolver la contraseña en la respuesta
                delete profesor.contrasena;
                return profesor;
            }
            
            return null; // Contraseña incorrecta
        } catch (error) {
            throw new Error(`Error al autenticar profesor: ${error.message}`);
        }
    }

    // Obtener materias asignadas a un profesor
    async getMaterias(idProfesor) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('idProfesor', mssql.Int, idProfesor)
                .query(`
                    SELECT 
                        m.id_materia,
                        m.clave_materia,
                        m.nombre_materia,
                        m.creditos,
                        m.horas_teoria,
                        m.horas_practica
                    FROM profesores_materias pm
                    INNER JOIN materias m ON pm.id_materia = m.id_materia
                    WHERE pm.id_profesor = @idProfesor
                    AND m.activo = 1
                    ORDER BY m.clave_materia
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener materias del profesor: ${error.message}`);
        }
    }

    // Obtener estudiantes de las carreras donde el profesor da clases
    async getEstudiantes(idProfesor) {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('idProfesor', mssql.Int, idProfesor)
                .query(`
                    SELECT DISTINCT
                        e.id_estudiante,
                        e.num_control,
                        e.nombre,
                        e.apellido_paterno,
                        e.apellido_materno,
                        e.email,
                        e.semestre_actual,
                        e.estatus,
                        c.nombre_carrera
                    FROM estudiantes e
                    INNER JOIN carreras c ON e.id_carrera = c.id_carrera
                    INNER JOIN profesores p ON p.id_carrera = c.id_carrera
                    WHERE p.id_profesor = @idProfesor
                    ORDER BY e.apellido_paterno, e.apellido_materno, e.nombre
                `);
            
            return result.recordset;
        } catch (error) {
            throw new Error(`Error al obtener estudiantes del profesor: ${error.message}`);
        }
    }
}

module.exports = Profesor;

