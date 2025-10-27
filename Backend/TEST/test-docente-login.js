const { getConnection, mssql } = require('../config/connection');
const Docente = require('../models/Docente');

async function testDocenteLogin() {
    try {
        console.log('=== Prueba de Login de Docente ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Crear instancia del modelo Docente
        const docenteModel = new Docente();
        
        // Primero, vamos a ver si hay docentes en la base de datos
        console.log('\n1. Verificando docentes existentes...');
        const docentes = await docenteModel.findAll();
        console.log(`Docentes encontrados: ${docentes.length}`);
        
        if (docentes.length > 0) {
            console.log('Primer docente:', {
                id: docentes[0].id,
                nombre: docentes[0].nombre,
                email: docentes[0].email,
                num_empleado: docentes[0].num_empleado
            });
            
            // Si el docente no tiene contraseña, vamos a crear una
            if (!docentes[0].contrasena) {
                console.log('\n2. Docente sin contraseña. Creando contraseña...');
                const testPassword = 'test123';
                const updated = await docenteModel.updatePassword(docentes[0].id, testPassword);
                console.log('Contraseña creada:', updated);
                
                // Probar login
                console.log('\n3. Probando login...');
                const loginResult = await docenteModel.authenticateByEmail(docentes[0].email, testPassword);
                if (loginResult) {
                    console.log('Login exitoso:', {
                        id: loginResult.id,
                        nombre: loginResult.nombre,
                        email: loginResult.email
                    });
                } else {
                    console.log('Login falló');
                }
            } else {
                console.log('\n2. Docente ya tiene contraseña configurada');
            }
        } else {
            console.log('\n2. No hay docentes en la base de datos. Creando uno de prueba...');
            
            const nuevoDocente = {
                nombre: 'Dr. Test',
                apellido_paterno: 'Usuario',
                apellido_materno: 'Prueba',
                email: 'test@universidad.edu',
                num_empleado: 'TEST001',
                especialidad: 'Sistemas',
                genero: 'M',
                estatus: 'Activo'
            };
            
            const docenteCreado = await docenteModel.createWithPassword(nuevoDocente, 'test123');
            console.log('Docente creado:', {
                id: docenteCreado.id,
                nombre: docenteCreado.nombre,
                email: docenteCreado.email
            });
            
            // Probar login
            console.log('\n3. Probando login con nuevo docente...');
            const loginResult = await docenteModel.authenticateByEmail('test@universidad.edu', 'test123');
            if (loginResult) {
                console.log('Login exitoso:', {
                    id: loginResult.id,
                    nombre: loginResult.nombre,
                    email: loginResult.email
                });
            } else {
                console.log('Login falló');
            }
        }
        
        console.log('\n=== Prueba Completada ===');
        
    } catch (error) {
        console.error('Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDocenteLogin();
