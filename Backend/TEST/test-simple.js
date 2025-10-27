const { connectDB, getPool, closeDB } = require('../config/connection');

async function testSimple() {
    console.log('=== Prueba Simple de Conexion ===');
    
    try {
        // Conectar
        await connectDB();
        console.log('1. Conexion establecida');
        
        // Obtener pool
        const pool = getPool();
        console.log('2. Pool obtenido');
        
        // Probar consulta simple
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('3. Consulta ejecutada');
        console.log('Version:', result.recordset[0].version.split('\n')[0]);
        
        // Probar consulta a la base de datos
        const result2 = await pool.request().query('SELECT DB_NAME() as database_name');
        console.log('4. Base de datos:', result2.recordset[0].database_name);
        
        // Cerrar conexion
        await closeDB();
        console.log('5. Conexion cerrada');
        
        console.log('\n=== Prueba Completada Exitosamente ===');
        
    } catch (error) {
        console.error('\n=== Error en la Prueba ===');
        console.error('Error:', error.message);
        console.error('\nPosibles soluciones:');
        console.error('1. Verificar que SQL Server este ejecutandose');
        console.error('2. Verificar que el usuario app_user existe');
        console.error('3. Verificar que la base de datos ITT_TASD existe');
        console.error('4. Verificar que TCP/IP esta habilitado en SQL Server');
    }
}

testSimple();
