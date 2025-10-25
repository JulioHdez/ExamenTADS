const sql = require('mssql');

// Configuración muy básica
const config = {
    server: 'localhost',
    port: 1433,
    database: 'ITT_TASD',
    user: 'app_user',
    password: 'AppPassword123!',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function testConnection() {
    try {
        console.log('=== Prueba de Conexion Simple ===');
        console.log('Configuración:', JSON.stringify(config, null, 2));
        
        const pool = await sql.connect(config);
        console.log('Conexión exitosa!');
        
        // Probar una consulta simple
        const result = await pool.request().query('SELECT 1 as test');
        console.log('Consulta exitosa:', result.recordset);
        
        await pool.close();
        console.log('Conexión cerrada');
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Código de error:', error.code);
        console.error('Número de error:', error.number);
    }
}

testConnection();
