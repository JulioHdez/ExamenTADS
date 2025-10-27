const sql = require('mssql');
const bcrypt = require('bcryptjs');

// Configuración de conexión
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

async function createTestUser() {
    try {
        console.log('=== Creando Usuario de Prueba ===');
        
        const pool = await sql.connect(config);
        console.log('Conexión exitosa a la base de datos');
        
        // Datos del usuario de prueba
        const userData = {
            num_empleado: 'EMP001',
            nombre: 'Usuario',
            apellido_paterno: 'Prueba',
            apellido_materno: 'Test',
            genero: 'M',
            email: 'test1@tec.com',
            telefono: '555-0123',
            especialidad: 'Sistemas',
            grado_academico: 'Ingeniero',
            fecha_contratacion: '2024-01-15',
            estatus: 'Activo',
            password: 'test1234'
        };
        
        // Verificar si el usuario ya existe
        const checkResult = await pool.request()
            .input('email', sql.NVarChar, userData.email)
            .query('SELECT id_docente FROM docentes WHERE email = @email');
        
        if (checkResult.recordset.length > 0) {
            console.log('El usuario ya existe. Actualizando contraseña...');
            
            // Actualizar contraseña del usuario existente
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            await pool.request()
                .input('email', sql.NVarChar, userData.email)
                .input('contrasena', sql.NVarChar, hashedPassword)
                .query('UPDATE docentes SET contrasena = @contrasena WHERE email = @email');
            
            console.log('Contraseña actualizada exitosamente');
        } else {
            console.log('Creando nuevo usuario...');
            
            // Cifrar contraseña
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            
            // Insertar nuevo usuario
            const result = await pool.request()
                .input('num_empleado', sql.VarChar, userData.num_empleado)
                .input('nombre', sql.VarChar, userData.nombre)
                .input('apellido_paterno', sql.VarChar, userData.apellido_paterno)
                .input('apellido_materno', sql.VarChar, userData.apellido_materno)
                .input('genero', sql.VarChar, userData.genero)
                .input('email', sql.NVarChar, userData.email)
                .input('telefono', sql.VarChar, userData.telefono)
                .input('especialidad', sql.VarChar, userData.especialidad)
                .input('grado_academico', sql.VarChar, userData.grado_academico)
                .input('fecha_contratacion', sql.Date, userData.fecha_contratacion)
                .input('estatus', sql.VarChar, userData.estatus)
                .input('contrasena', sql.NVarChar, hashedPassword)
                .query(`
                    INSERT INTO docentes (
                        num_empleado, nombre, apellido_paterno, apellido_materno, genero,
                        email, telefono, especialidad, grado_academico, fecha_contratacion,
                        estatus, contrasena, fecha_registro, fecha_actualizacion
                    ) VALUES (
                        @num_empleado, @nombre, @apellido_paterno, @apellido_materno, @genero,
                        @email, @telefono, @especialidad, @grado_academico, @fecha_contratacion,
                        @estatus, @contrasena, GETDATE(), GETDATE()
                    )
                `);
            
            console.log('Usuario creado exitosamente');
        }
        
        // Verificar que el usuario se puede autenticar
        console.log('\n=== Verificando Autenticación ===');
        const authResult = await pool.request()
            .input('email', sql.NVarChar, userData.email)
            .query('SELECT id_docente, nombre, apellido_paterno, email, contrasena FROM docentes WHERE email = @email');
        
        if (authResult.recordset.length > 0) {
            const docente = authResult.recordset[0];
            const isValidPassword = await bcrypt.compare(userData.password, docente.contrasena);
            
            if (isValidPassword) {
                console.log('✅ Autenticación exitosa');
                console.log(`Usuario: ${docente.nombre} ${docente.apellido_paterno}`);
                console.log(`Email: ${docente.email}`);
                console.log(`ID: ${docente.id_docente}`);
            } else {
                console.log('❌ Error en la autenticación');
            }
        }
        
        await pool.close();
        console.log('\n=== Proceso Completado ===');
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Código de error:', error.code);
    }
}

createTestUser();
