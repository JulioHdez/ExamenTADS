const { getConnection, mssql } = require('../config/connection');
const bcrypt = require('bcryptjs');

async function insertTestUser() {
    try {
        console.log('=== Insertando Usuario de Prueba ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Cifrar la contraseña
        const password = 'test123';
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        console.log('Contraseña original:', password);
        console.log('Contraseña cifrada:', hashedPassword.substring(0, 30) + '...');
        
        // Insertar el nuevo docente con contraseña cifrada
        const insertQuery = `
            INSERT INTO docentes (
                num_empleado, 
                apellido_materno, 
                apellido_paterno, 
                nombre, 
                genero, 
                email, 
                telefono, 
                especialidad, 
                grado_academico, 
                fecha_contratacion, 
                contrasena
            )
            VALUES (
                @num_empleado,
                @apellido_materno,
                @apellido_paterno,
                @nombre,
                @genero,
                @email,
                @telefono,
                @especialidad,
                @grado_academico,
                @fecha_contratacion,
                @contrasena
            )
        `;
        
        const result = await pool.request()
            .input('num_empleado', mssql.VarChar, '2')
            .input('apellido_materno', mssql.VarChar, 'test')
            .input('apellido_paterno', mssql.VarChar, 'tes')
            .input('nombre', mssql.VarChar, 'Julio test')
            .input('genero', mssql.VarChar, 'M')
            .input('email', mssql.VarChar, 'test@tec.com')
            .input('telefono', mssql.VarChar, '6644351671')
            .input('especialidad', mssql.VarChar, 'Desarrollo Software')
            .input('grado_academico', mssql.VarChar, 'Licenciatura')
            .input('fecha_contratacion', mssql.Date, new Date())
            .input('contrasena', mssql.NVarChar, hashedPassword)
            .query(insertQuery);
        
        console.log('\n✅ Usuario insertado exitosamente');
        console.log('ID del nuevo docente:', result.recordset[0]?.id_docente || 'N/A');
        
        // Verificar que el usuario se insertó correctamente
        const verifyQuery = `
            SELECT id_docente, nombre, apellido_paterno, apellido_materno, email, num_empleado
            FROM docentes 
            WHERE email = @email
        `;
        
        const verifyResult = await pool.request()
            .input('email', mssql.VarChar, 'test@tec.com')
            .query(verifyQuery);
        
        if (verifyResult.recordset.length > 0) {
            const docente = verifyResult.recordset[0];
            console.log('\n📋 Usuario verificado:');
            console.log('ID:', docente.id_docente);
            console.log('Nombre:', docente.nombre);
            console.log('Apellidos:', `${docente.apellido_paterno} ${docente.apellido_materno}`);
            console.log('Email:', docente.email);
            console.log('Número de empleado:', docente.num_empleado);
        }
        
        console.log('\n=== Proceso Completado ===');
        
    } catch (error) {
        console.error('Error:', error.message);
        if (error.code === 'EREQUEST' && error.number === 2627) {
            console.log('\n💡 El usuario ya existe. Verificando...');
            // Verificar si el usuario ya existe
            try {
                const pool = await getConnection();
                const checkResult = await pool.request()
                    .input('email', mssql.VarChar, 'test@tec.com')
                    .query('SELECT id_docente, nombre, email FROM docentes WHERE email = @email');
                
                if (checkResult.recordset.length > 0) {
                    const docente = checkResult.recordset[0];
                    console.log('✅ Usuario ya existe:');
                    console.log('ID:', docente.id_docente);
                    console.log('Nombre:', docente.nombre);
                    console.log('Email:', docente.email);
                }
            } catch (checkError) {
                console.error('Error verificando usuario existente:', checkError.message);
            }
        }
    }
}

insertTestUser();
