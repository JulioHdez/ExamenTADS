const { getConnection, mssql } = require('../config/connection');
const Docente = require('../models/Docente');

async function verifyTestUser() {
    try {
        console.log('=== Verificando Usuario de Prueba ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Buscar el usuario por email
        const result = await pool.request()
            .input('email', mssql.VarChar, 'test@tec.com')
            .query(`
                SELECT id_docente, nombre, apellido_paterno, apellido_materno, email, num_empleado, contrasena
                FROM docentes 
                WHERE email = @email
            `);
        
        if (result.recordset.length > 0) {
            const docente = result.recordset[0];
            console.log('\n✅ Usuario encontrado:');
            console.log('ID:', docente.id_docente);
            console.log('Nombre:', docente.nombre);
            console.log('Apellidos:', `${docente.apellido_paterno} ${docente.apellido_materno}`);
            console.log('Email:', docente.email);
            console.log('Número de empleado:', docente.num_empleado);
            console.log('Tiene contraseña:', !!docente.contrasena);
            
            // Probar login con el nuevo usuario
            console.log('\n🔐 Probando login con el nuevo usuario...');
            const docenteModel = new Docente();
            
            const loginResult = await docenteModel.authenticateByEmail('test@tec.com', 'test123');
            if (loginResult) {
                console.log('✅ Login exitoso:');
                console.log('ID:', loginResult.id_docente);
                console.log('Nombre:', loginResult.nombre);
                console.log('Email:', loginResult.email);
            } else {
                console.log('❌ Login falló');
            }
            
        } else {
            console.log('❌ Usuario no encontrado');
        }
        
        console.log('\n=== Verificación Completada ===');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

verifyTestUser();
