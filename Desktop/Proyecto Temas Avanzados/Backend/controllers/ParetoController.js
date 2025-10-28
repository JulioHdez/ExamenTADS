const ExcelJS = require('exceljs');
const { getConnection } = require('../config/connection');

class ParetoController {
    async generateExcelReport(req, res) {
        try {
            const { semestre } = req.query;

            if (!semestre) {
                return res.status(400).json({
                    success: false,
                    message: 'Semestre requerido'
                });
            }

            // Aquí obtendrías los datos de Pareto
            // Por ahora, retornaré un ejemplo
            const paretoData = [
                { categoria: 'Económico', frecuencia: 2, porcentaje: 33, porcentajeAcumulado: 33 },
                { categoria: 'Académico', frecuencia: 2, porcentaje: 33, porcentajeAcumulado: 67 },
                { categoria: 'Trabajo', frecuencia: 1, porcentaje: 17, porcentajeAcumulado: 83 },
                { categoria: 'Transporte', frecuencia: 1, porcentaje: 17, porcentajeAcumulado: 100 }
            ];

            // Crear workbook
            const workbook = new ExcelJS.Workbook();
            
            // Hoja 1: Datos
            const worksheet = workbook.addWorksheet('Datos');
            
            // Encabezados
            worksheet.addRow(['Categoría', 'Frecuencia', 'Porcentaje (%)', 'Porcentaje Acumulado (%)']);
            
            // Formatear encabezados
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1a2a4a' }
            };
            
            // Agregar datos
            paretoData.forEach(item => {
                worksheet.addRow([
                    item.categoria,
                    item.frecuencia,
                    item.porcentaje / 100,
                    item.porcentajeAcumulado / 100
                ]);
            });
            
            // Formatear porcentajes
            for (let i = 2; i <= paretoData.length + 1; i++) {
                worksheet.getCell(i, 3).numFmt = '0%';
                worksheet.getCell(i, 4).numFmt = '0%';
            }
            
            // Anchos de columna
            worksheet.getColumn(1).width = 20;
            worksheet.getColumn(2).width = 12;
            worksheet.getColumn(3).width = 18;
            worksheet.getColumn(4).width = 24;
            
            // Hoja 2: Gráfico
            const chartSheet = workbook.addWorksheet('Gráfico');
            
            // Agregar los datos para el gráfico
            chartSheet.addRow(['Categoría', 'Frecuencia', 'Porcentaje Acumulado']);
            paretoData.forEach(item => {
                chartSheet.addRow([
                    item.categoria,
                    item.frecuencia,
                    item.porcentajeAcumulado / 100
                ]);
            });
            
            // Intentar crear el gráfico combinado
            chartSheet.addChart({
                type: 'bar',
                name: 'Análisis de Pareto',
                title: {
                    name: 'Análisis de Pareto - Principio 80/20'
                },
                series: [
                    {
                        name: 'Frecuencia',
                        categories: [`'Gráfico'!A2:A${paretoData.length + 1}`],
                        values: [`'Gráfico'!B2:B${paretoData.length + 1}`]
                    },
                    {
                        name: 'Porcentaje Acumulado',
                        categories: [`'Gráfico'!A2:A${paretoData.length + 1}`],
                        values: [`'Gráfico'!D2:D${paretoData.length + 1}`]
                    }
                ]
            });
            
            // Generar buffer
            const buffer = await workbook.xlsx.writeBuffer();
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=Analisis_Pareto_Semestre_${semestre}.xlsx`);
            
            res.send(buffer);
            
        } catch (error) {
            console.error('Error al generar reporte Excel:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar el archivo Excel',
                error: error.message
            });
        }
    }
}

module.exports = ParetoController;


