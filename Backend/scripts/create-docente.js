#!/usr/bin/env node

const DocenteController = require('../controllers/DocenteController');
const { getConnection } = require('../config/connection');

async function createDocente() {
    console.log('=== CREANDO DOCENTE ===');
    console.log('Email: mguerrero@tec.com');
    console.log('Contraseña: Tasd123!');
    console.log('');

    const controller = new DocenteController();
    
    try {
        // Datos del docente
        const docenteData = {
            num_empleado: 'DOC002',
            apellido_paterno: 'Guerrero',
            apellido_materno: 'Luis',
            nombre: 'Maribel',
            genero: 'F',
            email: 'mguerrero@tec.com',
            telefono: '6642345678',
            especialidad: 'Ing. Sistemas Computacionales',
            grado_academico: 'Maestría',
            fecha_contratacion: '2024-01-15',
            estatus: 'Activo',
            password: 'Tasd123!'
        };

        console.log('Creando docente...');
        
        // Crear docente usando el método createWithPassword
        const result = await controller.createWithPassword({
            body: docenteData
        }, {
            status: (code) => ({
                json: (data) => {
                    if (data.success) {
                        console.log('✅ Docente creado exitosamente!');
                        console.log(`ID: ${data.data.id_docente}`);
                        console.log(`Nombre: ${data.data.nombre} ${data.data.apellido_paterno} ${data.data.apellido_materno}`);
                        console.log(`Email: ${data.data.email}`);
                        console.log(`Número de empleado: ${data.data.num_empleado}`);
                        console.log(`Especialidad: ${data.data.especialidad}`);
                        console.log('');
                        console.log('🔐 Credenciales de acceso:');
                        console.log(`Email: ${docenteData.email}`);
                        console.log(`Contraseña: ${docenteData.password}`);
                    } else {
                        console.log('❌ Error al crear docente:', data.message);
                    }
                }
            })
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Si el error es por docente existente, mostrar información
        if (error.message.includes('Ya existe un docente')) {
            console.log('');
            console.log('💡 El docente ya existe. Verificando información...');
            
            try {
                // Buscar el docente existente
                const existingDocente = await controller.getByNumEmpleado({
                    params: { numEmpleado: 'DOC002' }
                }, {
                    json: (data) => {
                        if (data.success) {
                            console.log('📋 Docente existente:');
                            console.log(`ID: ${data.data.id_docente}`);
                            console.log(`Nombre: ${data.data.nombre} ${data.data.apellido_paterno} ${data.data.apellido_materno}`);
                            console.log(`Email: ${data.data.email}`);
                            console.log(`Número de empleado: ${data.data.num_empleado}`);
                        }
                    }
                });
            } catch (searchError) {
                console.log('No se pudo obtener información del docente existente');
            }
        }
    }
}

// Función para verificar conexión a la base de datos
async function testConnection() {
    console.log('=== VERIFICANDO CONEXIÓN A BASE DE DATOS ===');
    
    try {
        const pool = await getConnection();
        console.log('✅ Conexión exitosa a la base de datos');
        
        // Verificar que la tabla docentes existe
        const result = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = 'docentes'
        `);
        
        if (result.recordset[0].count > 0) {
            console.log('✅ Tabla docentes encontrada');
        } else {
            console.log('❌ Tabla docentes no encontrada');
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        console.log('');
        console.log('💡 Verifica la configuración en Backend/config/connection.js');
        console.log('   - Servidor: itttasd.database.windows.net');
        console.log('   - Puerto: 1433');
        console.log('   - Base de datos: ITT_TASD');
        console.log('   - Usuario: app_user');
        console.log('   - Contraseña: Password123!');
        console.log('   - Encriptación: true');
    }
}

// Función principal
async function main() {
    console.log('🚀 Script de creación de docente');
    console.log('=====================================');
    console.log('');
    
    // Primero verificar conexión
    await testConnection();
    console.log('');
    
    // Luego crear docente
    await createDocente();
    
    console.log('');
    console.log('=== SCRIPT COMPLETADO ===');
}

// Ejecutar script
main().catch(console.error);
