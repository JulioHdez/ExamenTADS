const { getConnection, mssql } = require('../config/connection');
const bcrypt = require('bcryptjs');

async function encryptExistingPassword() {
    try {
        console.log('=== Cifrando Contraseña Existente ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Obtener el docente con ID 3
        const result = await pool.request()
            .input('id', mssql.Int, 3)
            .query('SELECT id_docente, email, contrasena FROM docentes WHERE id_docente = @id');
        
        if (result.recordset.length === 0) {
            console.log('❌ No se encontró el docente con ID 3');
            return;
        }
        
        const docente = result.recordset[0];
        console.log('Docente encontrado:', {
            id: docente.id_docente,
            email: docente.email,
            contrasena_actual: docente.contrasena
        });
        
        // Cifrar la contraseña con bcrypt
        const password = 'HELJ030827HBCRNLA5!';
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('\nContraseña original:', password);
        console.log('Contraseña cifrada:', hashedPassword.substring(0, 30) + '...');
        
        // Actualizar la contraseña en la base de datos
        const updateResult = await pool.request()
            .input('id', mssql.Int, 3)
            .input('contrasena', mssql.NVarChar, hashedPassword)
            .query('UPDATE docentes SET contrasena = @contrasena WHERE id_docente = @id');
        
        console.log('\n✅ Contraseña actualizada en la base de datos');
        
        // Verificar que la contraseña cifrada funciona
        console.log('\nVerificando contraseña cifrada...');
        const isValid = await bcrypt.compare(password, hashedPassword);
        console.log('Verificación exitosa:', isValid);
        
        console.log('\n=== Proceso Completado ===');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

encryptExistingPassword();
