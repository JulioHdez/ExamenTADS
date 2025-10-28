const { getConnection } = require('../config/connection');
const { mssql } = require('../config/connection');

class ExportController {
    async exportData(req, res) {
        try {
            const { format, include } = req.body;
            
            // Validar que se haya seleccionado al menos un formato
            const selectedFormats = Object.entries(format).filter(([key, value]) => value);
            if (selectedFormats.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe seleccionar al menos un formato de exportación'
                });
            }

            // Validar que se haya seleccionado al menos un tipo de datos
            const selectedData = Object.entries(include).filter(([key, value]) => value);
            if (selectedData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe seleccionar al menos un tipo de datos para exportar'
                });
            }

            const exportResults = [];
            
            // Exportar según los formatos seleccionados
            for (const [formatType, isSelected] of selectedFormats) {
                if (!isSelected) continue;
                
                for (const [dataType, isIncluded] of selectedData) {
                    if (!isIncluded) continue;
                    
                    try {
                        const result = await this.exportDataType(dataType, formatType);
                        exportResults.push({
                            format: formatType,
                            dataType: dataType,
                            records: result.count,
                            data: result.data
                        });
                    } catch (error) {
                        console.error(`Error exportando ${dataType} en formato ${formatType}:`, error);
                        exportResults.push({
                            format: formatType,
                            dataType: dataType,
                            error: error.message
                        });
                    }
                }
            }

            res.json({
                success: true,
                message: 'Datos exportados exitosamente',
                results: exportResults
            });

        } catch (error) {
            console.error('Error al exportar datos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al exportar datos',
                error: error.message
            });
        }
    }

    async exportDataType(dataType, formatType) {
        const pool = await getConnection();
        
        switch (dataType) {
            case 'studentData':
                return await this.exportEstudiantes(pool, formatType);
            case 'statistics':
                return await this.exportEstadisticas(pool, formatType);
            case 'riskFactors':
                return await this.exportFactoresRiesgo(pool, formatType);
            case 'charts':
                return await this.exportGraficos(pool, formatType);
            default:
                throw new Error(`Tipo de datos no soportado: ${dataType}`);
        }
    }

    async exportEstudiantes(pool, formatType) {
        try {
            const request = pool.request();
            const result = await request.query(`
                SELECT 
                    e.id_estudiante,
                    e.num_control,
                    e.apellido_paterno,
                    e.apellido_materno,
                    e.nombre,
                    e.genero,
                    e.fecha_nacimiento,
                    e.email,
                    e.telefono,
                    e.semestre_actual,
                    e.promedio_general,
                    e.estatus,
                    c.nombre_carrera
                FROM estudiantes e
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                ORDER BY e.apellido_paterno, e.apellido_materno, e.nombre
            `);

            const data = result.recordset;
            
            if (formatType === 'csv') {
                return this.convertToCSV(data);
            } else if (formatType === 'excel') {
                return this.convertToExcel(data, 'Estudiantes');
            }
            
            return { count: data.length, data };
        } catch (error) {
            throw new Error(`Error al exportar estudiantes: ${error.message}`);
        }
    }

    async exportEstadisticas(pool, formatType) {
        try {
            const request = pool.request();
            const result = await request.query(`
                SELECT 
                    COUNT(*) as total_estudiantes,
                    COUNT(CASE WHEN estatus = 'Activo' THEN 1 END) as activos,
                    COUNT(CASE WHEN estatus = 'Egresado' THEN 1 END) as egresados,
                    AVG(ISNULL(promedio_general, 0)) as promedio_general,
                    COUNT(CASE WHEN genero = 'M' THEN 1 END) as masculino,
                    COUNT(CASE WHEN genero = 'F' THEN 1 END) as femenino,
                    COUNT(CASE WHEN promedio_general >= 70 THEN 1 END) as aprobados,
                    COUNT(CASE WHEN promedio_general < 70 AND promedio_general > 0 THEN 1 END) as reprobados
                FROM estudiantes
            `);

            const data = result.recordset;
            
            if (formatType === 'csv') {
                return this.convertToCSV(data);
            } else if (formatType === 'excel') {
                return this.convertToExcel(data, 'Estadísticas');
            }
            
            return { count: data.length, data };
        } catch (error) {
            throw new Error(`Error al exportar estadísticas: ${error.message}`);
        }
    }

    async exportFactoresRiesgo(pool, formatType) {
        try {
            const request = pool.request();
            const result = await request.query(`
                SELECT 
                    f.id_factor,
                    f.nombre_factor,
                    f.descripcion,
                    f.fecha_asignacion,
                    f.observaciones,
                    e.num_control,
                    e.apellido_paterno,
                    e.apellido_materno,
                    e.nombre,
                    c.nombre_carrera
                FROM factores f
                INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                WHERE f.activo = 1
                ORDER BY f.fecha_asignacion DESC
            `);

            const data = result.recordset;
            
            if (formatType === 'csv') {
                return this.convertToCSV(data);
            } else if (formatType === 'excel') {
                return this.convertToExcel(data, 'Factores de Riesgo');
            }
            
            return { count: data.length, data };
        } catch (error) {
            throw new Error(`Error al exportar factores de riesgo: ${error.message}`);
        }
    }

    async exportGraficos(pool, formatType) {
        try {
            // Exportar datos para gráficos: distribución de factores de riesgo por categoría
            const request = pool.request();
            const result = await request.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN f.nombre_factor LIKE '%Económico%' THEN 1 ELSE 0 END) as economico,
                    SUM(CASE WHEN f.nombre_factor LIKE '%Académico%' THEN 1 ELSE 0 END) as academico,
                    SUM(CASE WHEN f.nombre_factor LIKE '%Salud%' OR f.nombre_factor LIKE '%Medica%' THEN 1 ELSE 0 END) as salud,
                    SUM(CASE WHEN f.nombre_factor LIKE '%Familiar%' THEN 1 ELSE 0 END) as familiar,
                    SUM(CASE WHEN f.nombre_factor LIKE '%Social%' THEN 1 ELSE 0 END) as social
                FROM factores f
                WHERE f.activo = 1
            `);

            const data = result.recordset;
            
            if (formatType === 'csv') {
                return this.convertToCSV(data);
            } else if (formatType === 'excel') {
                return this.convertToExcel(data, 'Gráficos');
            }
            
            return { count: data.length, data };
        } catch (error) {
            throw new Error(`Error al exportar datos de gráficos: ${error.message}`);
        }
    }

    convertToCSV(data) {
        if (!data || data.length === 0) {
            return { count: 0, data: '' };
        }

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(',')
        ];

        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                // Escapar comillas y envolver en comillas si contiene comas
                const stringValue = String(value);
                if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                    return `"${stringValue.replace(/"/g, '""')}"`;
                }
                return stringValue;
            });
            csvRows.push(values.join(','));
        }

        return {
            count: data.length,
            data: csvRows.join('\n')
        };
    }

    async convertToExcel(data, sheetName) {
        // Para Excel, retornamos los datos en formato JSON
        // El frontend puede usar una librería como SheetJS o similar para generar Excel
        return {
            count: data.length,
            data: data,
            sheetName: sheetName
        };
    }

    // Método para descargar archivo CSV
    async downloadCSV(req, res) {
        try {
            const { dataType } = req.params;
            const pool = await getConnection();
            
            let result;
            switch (dataType) {
                case 'students':
                    result = await this.exportEstudiantes(pool, 'csv');
                    break;
                case 'statistics':
                    result = await this.exportEstadisticas(pool, 'csv');
                    break;
                case 'risk-factors':
                    result = await this.exportFactoresRiesgo(pool, 'csv');
                    break;
                case 'charts':
                    result = await this.exportGraficos(pool, 'csv');
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de datos no válido'
                    });
            }

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename=${dataType}_${new Date().getTime()}.csv`);
            res.send(result.data);
            
        } catch (error) {
            console.error('Error al descargar CSV:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar archivo CSV',
                error: error.message
            });
        }
    }
}

module.exports = ExportController;
