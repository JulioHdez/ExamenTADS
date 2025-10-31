const path = require('path');
const fs = require('fs');
const { getConnection, mssql } = require('../config/connection');
const ExcelJS = require('exceljs');
const { parse } = require('csv-parse');

class ImportController {
    async importData(req, res) {
        try {
            const { dataType } = req.body; // ej. 'students'
            if (!req.file) {
                return res.status(400).json({ success: false, message: 'No se adjuntó archivo' });
            }

            if (!dataType) {
                return res.status(400).json({ success: false, message: 'Falta dataType' });
            }

            const ext = path.extname(req.file.originalname).toLowerCase();

            let rows = [];
            let headers = [];
            if (ext === '.csv') {
                const parsed = await this.parseCSV(req.file.path);
                rows = parsed.rows;
                headers = parsed.headers;
            } else if (ext === '.xlsx' || ext === '.xls') {
                const parsed = await this.parseExcel(req.file.path);
                rows = parsed.rows;
                headers = parsed.headers;
            } else {
                return res.status(400).json({ success: false, message: 'Formato no soportado. Use CSV o Excel' });
            }

            // Validar orden de columnas cuando se trate de estudiantes
            if (dataType === 'students' || dataType === 'studentData') {
                const expectedOrder = [
                    'num_control',
                    'nombre',
                    'apellido_paterno',
                    'apellido_materno',
                    'genero',
                    'fecha_nacimiento',
                    'email',
                    'telefono',
                    'direccion',
                    'id_carrera',
                    'semestre_actual',
                    'fecha_ingreso',
                    'estatus'
                ];

                const normalized = headers.map(h => String(h || '').trim().toLowerCase());
                const expectedNormalized = expectedOrder.map(h => h.toLowerCase());

                const orderMatches = normalized.length >= expectedNormalized.length && expectedNormalized.every((h, idx) => normalized[idx] === h);
                if (!orderMatches) {
                    return res.status(400).json({
                        success: false,
                        message: 'Encabezados inválidos o fuera de orden',
                        expectedOrder,
                        received: headers
                    });
                }
            }

            const result = await this.importByType(dataType, rows);

            // Limpieza del archivo temporal
            try { fs.unlinkSync(req.file.path); } catch (_) {}

            return res.json({ success: true, ...result });
        } catch (error) {
            console.error('Error en importación:', error);
            return res.status(500).json({ success: false, message: 'Error al importar', error: error.message });
        }
    }

    async parseCSV(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return new Promise((resolve, reject) => {
            const records = [];
            let headers = [];
            parse(content, { columns: true, skip_empty_lines: true, trim: true }, (err, output) => {
                if (err) return reject(err);
                if (output.length > 0) headers = Object.keys(output[0]);
                output.forEach(r => records.push(r));
                resolve({ rows: records, headers });
            });
        });
    }

    async parseExcel(filePath) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const sheet = workbook.worksheets[0];
        const headers = [];
        const rows = [];
        sheet.getRow(1).eachCell((cell, col) => {
            headers[col - 1] = String(cell.value).trim();
        });
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
            const obj = {};
            row.eachCell((cell, colNumber) => {
                obj[headers[colNumber - 1]] = cell.value == null ? null : String(cell.value).trim();
            });
            rows.push(obj);
        });
        return { rows, headers };
    }

    async importByType(dataType, rows) {
        switch (dataType) {
            case 'students':
            case 'studentData':
                return await this.importStudents(rows);
            default:
                throw new Error(`Tipo de datos no soportado: ${dataType}`);
        }
    }

    // Mapea columnas exportadas a esquema de BD y realiza upsert por num_control
    async importStudents(rows) {
        const pool = await getConnection();
        const created = [];
        const updated = [];
        const errors = [];

        for (const row of rows) {
            try {
                // Columnas posibles (exportadas):
                // id_estudiante, num_control, apellido_paterno, apellido_materno, nombre, genero,
                // fecha_nacimiento, email, telefono, semestre_actual, promedio_general, estatus, nombre_carrera
                // También aceptamos: id_carrera, fecha_ingreso, direccion

                const mapped = this.mapStudentRow(row);
                if (!mapped.num_control) {
                    throw new Error('num_control es requerido');
                }

                // Resolver carrera si viene por nombre
                if (!mapped.id_carrera && row.nombre_carrera) {
                    const idCarrera = await this.findCarreraIdByNombre(pool, row.nombre_carrera);
                    mapped.id_carrera = idCarrera || null;
                }

                // Upsert por num_control
                const existing = await pool.request()
                    .input('num_control', mssql.VarChar(20), mapped.num_control)
                    .query('SELECT id_estudiante FROM estudiantes WHERE num_control = @num_control');

                if (existing.recordset.length === 0) {
                    // Insert
                    const request = pool.request();
                    request.input('num_control', mssql.VarChar(20), mapped.num_control);
                    request.input('apellido_paterno', mssql.VarChar(50), mapped.apellido_paterno || null);
                    request.input('apellido_materno', mssql.VarChar(50), mapped.apellido_materno || null);
                    request.input('nombre', mssql.VarChar(50), mapped.nombre || null);
                    request.input('genero', mssql.VarChar(20), mapped.genero || null);
                    request.input('fecha_nacimiento', mssql.Date, mapped.fecha_nacimiento || null);
                    request.input('email', mssql.VarChar(100), mapped.email || null);
                    request.input('telefono', mssql.VarChar(15), mapped.telefono || null);
                    request.input('direccion', mssql.Text, mapped.direccion || null);
                    request.input('id_carrera', mssql.Int, mapped.id_carrera || null);
                    request.input('semestre_actual', mssql.Int, mapped.semestre_actual || null);
                    request.input('fecha_ingreso', mssql.Date, mapped.fecha_ingreso || null);
                    request.input('estatus', mssql.VarChar(20), mapped.estatus || null);
                    request.input('promedio_general', mssql.Decimal(4, 2), mapped.promedio_general || null);

                    const insert = await request.query(`
                        INSERT INTO estudiantes (
                            num_control, apellido_paterno, apellido_materno, nombre, genero,
                            fecha_nacimiento, email, telefono, direccion, id_carrera,
                            semestre_actual, fecha_ingreso, estatus, promedio_general,
                            fecha_registro, fecha_actualizacion
                        ) VALUES (
                            @num_control, @apellido_paterno, @apellido_materno, @nombre, @genero,
                            @fecha_nacimiento, @email, @telefono, @direccion, @id_carrera,
                            @semestre_actual, @fecha_ingreso, @estatus, @promedio_general,
                            GETDATE(), GETDATE()
                        )
                    `);
                    created.push(mapped.num_control);
                } else {
                    // Update
                    const idEstudiante = existing.recordset[0].id_estudiante;
                    const updates = [];
                    const reqU = pool.request();
                    reqU.input('id', mssql.Int, idEstudiante);

                    const up = (col, type, val) => {
                        if (val === undefined) return;
                        updates.push(`${col} = @${col}`);
                        reqU.input(col, type, val);
                    };

                    up('apellido_paterno', mssql.VarChar(50), mapped.apellido_paterno || null);
                    up('apellido_materno', mssql.VarChar(50), mapped.apellido_materno || null);
                    up('nombre', mssql.VarChar(50), mapped.nombre || null);
                    up('genero', mssql.VarChar(20), mapped.genero || null);
                    up('fecha_nacimiento', mssql.Date, mapped.fecha_nacimiento || null);
                    up('email', mssql.VarChar(100), mapped.email || null);
                    up('telefono', mssql.VarChar(15), mapped.telefono || null);
                    up('direccion', mssql.Text, mapped.direccion || null);
                    up('id_carrera', mssql.Int, mapped.id_carrera || null);
                    up('semestre_actual', mssql.Int, mapped.semestre_actual || null);
                    up('fecha_ingreso', mssql.Date, mapped.fecha_ingreso || null);
                    up('estatus', mssql.VarChar(20), mapped.estatus || null);
                    up('promedio_general', mssql.Decimal(4, 2), mapped.promedio_general || null);

                    if (updates.length > 0) {
                        const q = `UPDATE estudiantes SET ${updates.join(', ')}, fecha_actualizacion = GETDATE() WHERE id_estudiante = @id`;
                        await reqU.query(q);
                    }
                    updated.push(mapped.num_control);
                }
            } catch (e) {
                errors.push({ row, error: e.message });
            }
        }

        return { message: 'Importación de estudiantes completada', createdCount: created.length, updatedCount: updated.length, errorCount: errors.length, errors };
    }

    mapStudentRow(row) {
        const parseIntSafe = (v) => {
            if (v === null || v === undefined || v === '') return null;
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        };
        const parseDateSafe = (v) => {
            if (!v) return null;
            const d = new Date(v);
            return isNaN(d.getTime()) ? null : d;
        };
        const parseDecimalSafe = (v) => {
            if (v === null || v === undefined || v === '') return null;
            const n = Number(v);
            return Number.isFinite(n) ? n : null;
        };

        return {
            num_control: row.num_control || row.NumControl || row.Num_Control || row['num control'] || null,
            apellido_paterno: row.apellido_paterno || row.ApellidoPaterno || row.Apellido_Paterno || null,
            apellido_materno: row.apellido_materno || row.ApellidoMaterno || row.Apellido_Materno || null,
            nombre: row.nombre || row.Nombre || null,
            genero: row.genero || row.Genero || row.Género || null,
            fecha_nacimiento: parseDateSafe(row.fecha_nacimiento || row.FechaNacimiento || row['Fecha Nacimiento'] || null),
            email: row.email || row.Email || null,
            telefono: row.telefono || row.Teléfono || row.Telefono || null,
            direccion: row.direccion || row.Dirección || row.Direccion || null,
            id_carrera: parseIntSafe(row.id_carrera || row.IdCarrera || null),
            semestre_actual: parseIntSafe(row.semestre_actual || row.Semestre || row.SemestreActual || null),
            fecha_ingreso: parseDateSafe(row.fecha_ingreso || row.FechaIngreso || row['Fecha Ingreso'] || null),
            estatus: row.estatus || row.Estatus || null,
            promedio_general: parseDecimalSafe(row.promedio_general || row.Promedio || row.PromedioGeneral || null)
        };
    }

    async findCarreraIdByNombre(pool, nombre) {
        const r = await pool.request()
            .input('nombre', mssql.VarChar(100), nombre)
            .query('SELECT TOP 1 id_carrera FROM carreras WHERE nombre_carrera = @nombre');
        return r.recordset[0]?.id_carrera || null;
    }
}

module.exports = ImportController;


