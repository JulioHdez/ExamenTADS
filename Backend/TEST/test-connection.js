const { getConnection, mssql } = require('../config/connection');

async function testConnection() {
    try {
        console.log('=== Prueba de Conexion ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexion exitosa!');
        
        // Probar una consulta simple
        const result = await pool.request().query('SELECT 1 as test');
        console.log('Consulta exitosa:', result.recordset);
        
        // Cerrar la conexión
        await pool.close();
        console.log('Prueba completada exitosamente');
        
    } catch (error) {
        console.error('=== Error en la Prueba ===');
        console.error('Error:', error.message);
        console.error('Código de error:', error.code);
    }
}

testConnection();