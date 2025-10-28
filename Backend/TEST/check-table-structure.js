const { getConnection, mssql } = require('./config/connection');

async function checkTableStructure() {
    try {
        console.log('=== Verificando Estructura de Tabla Docentes ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Verificar estructura de la tabla docentes
        const result = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'docentes'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\nEstructura de la tabla docentes:');
        result.recordset.forEach(col => {
            console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        // Verificar si hay datos en la tabla
        const countResult = await pool.request().query('SELECT COUNT(*) as total FROM docentes');
        console.log(`\nTotal de registros en docentes: ${countResult.recordset[0].total}`);
        
        if (countResult.recordset[0].total > 0) {
            // Mostrar algunos registros
            const sampleResult = await pool.request().query('SELECT TOP 3 * FROM docentes');
            console.log('\nMuestra de registros:');
            sampleResult.recordset.forEach((row, index) => {
                console.log(`Registro ${index + 1}:`, Object.keys(row).reduce((acc, key) => {
                    acc[key] = row[key];
                    return acc;
                }, {}));
            });
        }
        
        console.log('\n=== Verificación Completada ===');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkTableStructure();
