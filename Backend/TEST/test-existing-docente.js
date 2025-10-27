const { getConnection, mssql } = require('../config/connection');
const Docente = require('../models/Docente');

async function testExistingDocente() {
    try {
        console.log('=== Prueba con Docente Existente ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Crear instancia del modelo Docente
        const docenteModel = new Docente();
        
        // Buscar el docente con ID 3
        console.log('\n1. Buscando docente con ID 3...');
        const docente = await docenteModel.findById(3);
        
        if (docente) {
            console.log('Docente encontrado:', {
                id: docente.id_docente,
                nombre: docente.nombre,
                apellido_paterno: docente.apellido_paterno,
                email: docente.email,
                num_empleado: docente.num_empleado,
                tiene_contrasena: !!docente.contrasena
            });
            
            // Probar login con la contraseña que configuraste
            console.log('\n2. Probando login con contraseña existente...');
            const password = 'HELJ030827HBCRNLA5!';
            
            // Probar login por email
            const loginByEmail = await docenteModel.authenticateByEmail(docente.email, password);
            if (loginByEmail) {
                console.log('✅ Login por email exitoso:', {
                    id: loginByEmail.id_docente,
                    nombre: loginByEmail.nombre,
                    email: loginByEmail.email
                });
            } else {
                console.log('❌ Login por email falló');
            }
            
            // Probar login por número de empleado
            const loginByNumEmpleado = await docenteModel.authenticateByNumEmpleado(docente.num_empleado, password);
            if (loginByNumEmpleado) {
                console.log('✅ Login por número de empleado exitoso:', {
                    id: loginByNumEmpleado.id_docente,
                    nombre: loginByNumEmpleado.nombre,
                    num_empleado: loginByNumEmpleado.num_empleado
                });
            } else {
                console.log('❌ Login por número de empleado falló');
            }
            
            // Probar con contraseña incorrecta
            console.log('\n3. Probando con contraseña incorrecta...');
            const loginIncorrecto = await docenteModel.authenticateByEmail(docente.email, 'contraseña_incorrecta');
            if (loginIncorrecto) {
                console.log('❌ ERROR: Login con contraseña incorrecta fue exitoso (no debería ser así)');
            } else {
                console.log('✅ Correcto: Login con contraseña incorrecta falló como esperado');
            }
            
        } else {
            console.log('❌ No se encontró el docente con ID 3');
        }
        
        console.log('\n=== Prueba Completada ===');
        
    } catch (error) {
        console.error('Error en la prueba:', error.message);
        console.error('Stack:', error.stack);
    }
}

testExistingDocente();
