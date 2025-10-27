#!/usr/bin/env node

const DocenteController = require('../controllers/DocenteController');
const { getConnection } = require('../config/connection');
const bcrypt = require('bcryptjs');

async function diagnoseLoginIssue() {
    console.log('=== DIAGNÓSTICO DE PROBLEMA DE LOGIN ===');
    console.log('');

    const controller = new DocenteController();
    
    try {
        // 1. Verificar conexión
        console.log('1. Verificando conexión a la base de datos...');
        const pool = await getConnection();
        console.log('✅ Conexión exitosa');
        console.log('');

        // 2. Buscar los docentes creados
        console.log('2. Buscando docentes en la base de datos...');
        const result = await pool.request().query(`
            SELECT id_docente, nombre, apellido_paterno, apellido_materno, email, contrasena, estatus
            FROM docentes 
            WHERE email IN ('docente@tec.com', 'mguerrero@tec.com')
            ORDER BY id_docente
        `);

        console.log(`📋 Encontrados ${result.recordset.length} docentes:`);
        result.recordset.forEach(docente => {
            console.log(`- ID: ${docente.id_docente}`);
            console.log(`  Nombre: ${docente.nombre} ${docente.apellido_paterno} ${docente.apellido_materno}`);
            console.log(`  Email: ${docente.email}`);
            console.log(`  Estado: ${docente.estatus}`);
            console.log(`  Contraseña hash: ${docente.contrasena ? docente.contrasena.substring(0, 20) + '...' : 'NULL'}`);
            console.log('');
        });

        // 3. Probar autenticación manual
        console.log('3. Probando autenticación manual...');
        
        for (const docente of result.recordset) {
            console.log(`\n🔐 Probando login para: ${docente.email}`);
            
            // Probar contraseñas
            const passwords = ['docente123!', 'Tasd123!'];
            
            for (const password of passwords) {
                try {
                    const isValid = await bcrypt.compare(password, docente.contrasena);
                    console.log(`  Contraseña "${password}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
                } catch (error) {
                    console.log(`  Contraseña "${password}": ❌ ERROR - ${error.message}`);
                }
            }
        }

        // 4. Probar método de autenticación del modelo
        console.log('\n4. Probando método authenticateByEmail...');
        
        const testCredentials = [
            { email: 'docente@tec.com', password: 'docente123!' },
            { email: 'mguerrero@tec.com', password: 'Tasd123!' }
        ];

        for (const cred of testCredentials) {
            try {
                console.log(`\n🔍 Probando: ${cred.email}`);
                const docente = await controller.model.authenticateByEmail(cred.email, cred.password);
                
                if (docente) {
                    console.log('✅ Autenticación exitosa');
                    console.log(`   ID: ${docente.id_docente}`);
                    console.log(`   Nombre: ${docente.nombre} ${docente.apellido_paterno}`);
                } else {
                    console.log('❌ Autenticación fallida');
                }
            } catch (error) {
                console.log(`❌ Error en autenticación: ${error.message}`);
            }
        }

        // 5. Verificar si hay docentes con contraseñas sin hashear
        console.log('\n5. Verificando contraseñas sin hashear...');
        const plainPasswordResult = await pool.request().query(`
            SELECT id_docente, nombre, apellido_paterno, email, contrasena
            FROM docentes 
            WHERE contrasena NOT LIKE '$2%' AND contrasena IS NOT NULL
        `);

        if (plainPasswordResult.recordset.length > 0) {
            console.log('⚠️  Encontrados docentes con contraseñas sin hashear:');
            plainPasswordResult.recordset.forEach(docente => {
                console.log(`- ${docente.email}: "${docente.contrasena}"`);
            });
        } else {
            console.log('✅ Todas las contraseñas están hasheadas correctamente');
        }

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error.message);
    }
}

// Función para crear un docente de prueba con contraseña conocida
async function createTestDocente() {
    console.log('\n=== CREANDO DOCENTE DE PRUEBA ===');
    
    const controller = new DocenteController();
    
    try {
        const testData = {
            num_empleado: 'TEST999',
            apellido_paterno: 'Test',
            apellido_materno: 'User',
            nombre: 'Test',
            genero: 'M',
            email: 'test@tec.com',
            telefono: '6649999999',
            especialidad: 'Testing',
            grado_academico: 'Licenciatura',
            fecha_contratacion: '2024-01-15',
            estatus: 'Activo',
            password: 'test123'
        };

        const result = await controller.createWithPassword({
            body: testData
        }, {
            status: (code) => ({
                json: (data) => {
                    if (data.success) {
                        console.log('✅ Docente de prueba creado exitosamente');
                        console.log(`Email: ${testData.email}`);
                        console.log(`Contraseña: ${testData.password}`);
                        
                        // Probar login inmediatamente
                        setTimeout(async () => {
                            console.log('\n🔐 Probando login inmediato...');
                            const docente = await controller.model.authenticateByEmail(testData.email, testData.password);
                            if (docente) {
                                console.log('✅ Login de prueba exitoso');
                            } else {
                                console.log('❌ Login de prueba fallido');
                            }
                        }, 1000);
                    } else {
                        console.log('❌ Error al crear docente de prueba:', data.message);
                    }
                }
            })
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Función principal
async function main() {
    await diagnoseLoginIssue();
    
    console.log('\n' + '='.repeat(50));
    console.log('¿Deseas crear un docente de prueba? (y/n)');
    
    // Para automatizar, vamos a crear el docente de prueba directamente
    await createTestDocente();
}

// Ejecutar diagnóstico
main().catch(console.error);
