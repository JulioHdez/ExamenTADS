#!/usr/bin/env node

const jwt = require('jsonwebtoken');

async function diagnoseJWT() {
    console.log('=== DIAGNÓSTICO DE JWT ===');
    console.log('');

    // 1. Verificar variables de entorno
    console.log('1. Verificando variables de entorno:');
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'No configurado'}`);
    console.log('');

    // 2. Crear un token de prueba
    console.log('2. Creando token de prueba...');
    const testSecret = process.env.JWT_SECRET || 'itt-tasd-secret-key';
    
    const testPayload = {
        id_docente: 8,
        email: 'docente@tec.com',
        nombre: 'María Elena',
        apellido_paterno: 'García'
    };

    try {
        const token = jwt.sign(testPayload, testSecret, { expiresIn: '24h' });
        console.log('✅ Token creado exitosamente');
        console.log(`Token: ${token.substring(0, 50)}...`);
        console.log('');

        // 3. Verificar el token
        console.log('3. Verificando token...');
        const decoded = jwt.verify(token, testSecret);
        console.log('✅ Token verificado exitosamente');
        console.log('Payload decodificado:', decoded);
        console.log('');

        // 4. Probar con token expirado
        console.log('4. Probando token expirado...');
        const expiredToken = jwt.sign(testPayload, testSecret, { expiresIn: '-1h' });
        try {
            jwt.verify(expiredToken, testSecret);
            console.log('❌ Error: Token expirado debería fallar');
        } catch (error) {
            console.log('✅ Token expirado correctamente rechazado:', error.name);
        }
        console.log('');

        // 5. Probar con secret incorrecto
        console.log('5. Probando con secret incorrecto...');
        try {
            jwt.verify(token, 'secret-incorrecto');
            console.log('❌ Error: Token con secret incorrecto debería fallar');
        } catch (error) {
            console.log('✅ Token con secret incorrecto correctamente rechazado:', error.name);
        }

    } catch (error) {
        console.error('❌ Error al crear/verificar token:', error.message);
    }
}

// Función para probar el login y obtener un token real
async function testRealLogin() {
    console.log('\n=== PROBANDO LOGIN REAL ===');
    
    try {
        const DocenteController = require('../controllers/DocenteController');
        const controller = new DocenteController();
        
        // Simular login
        const loginResult = await controller.loginByEmail({
            body: {
                email: 'docente@tec.com',
                password: 'docente123!'
            }
        }, {
            status: (code) => ({
                json: (data) => {
                    if (data.success) {
                        console.log('✅ Login exitoso');
                        console.log(`Token recibido: ${data.data.token.substring(0, 50)}...`);
                        
                        // Verificar el token recibido
                        const testSecret = process.env.JWT_SECRET || 'itt-tasd-secret-key';
                        try {
                            const decoded = jwt.verify(data.data.token, testSecret);
                            console.log('✅ Token del login verificado correctamente');
                            console.log('Payload:', decoded);
                        } catch (error) {
                            console.log('❌ Error al verificar token del login:', error.message);
                        }
                    } else {
                        console.log('❌ Login fallido:', data.message);
                    }
                }
            })
        });

    } catch (error) {
        console.error('❌ Error en login:', error.message);
    }
}

// Función para crear un archivo .env si no existe
async function createEnvFile() {
    console.log('\n=== VERIFICANDO ARCHIVO .ENV ===');
    
    const fs = require('fs');
    const path = require('path');
    
    const envPath = path.join(__dirname, '..', '.env');
    
    if (!fs.existsSync(envPath)) {
        console.log('❌ Archivo .env no encontrado');
        console.log('📝 Creando archivo .env...');
        
        const envContent = `# Configuración de la Base de Datos
DB_SERVER=itttasd.database.windows.net
DB_DATABASE=ITT_TASD
DB_USER=app_user
DB_PASSWORD=Password123!
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# Configuración del Servidor
PORT=3001
NODE_ENV=development

# JWT Secret (cambiar por uno seguro en producción)
JWT_SECRET=itt-tasd-jwt-secret-key-${Date.now()}
JWT_EXPIRES_IN=24h

# CORS - Origen permitido para el frontend
CORS_ORIGIN=http://localhost:5173
`;

        fs.writeFileSync(envPath, envContent);
        console.log('✅ Archivo .env creado exitosamente');
        console.log('⚠️  Reinicia el servidor para cargar las nuevas variables de entorno');
    } else {
        console.log('✅ Archivo .env encontrado');
        
        // Leer y mostrar configuración
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        console.log('📋 Configuración actual:');
        lines.forEach(line => {
            if (line.trim() && !line.startsWith('#')) {
                const [key] = line.split('=');
                console.log(`- ${key}`);
            }
        });
    }
}

// Función principal
async function main() {
    await createEnvFile();
    await diagnoseJWT();
    await testRealLogin();
    
    console.log('\n=== RECOMENDACIONES ===');
    console.log('1. Si JWT_SECRET no está configurado, reinicia el servidor');
    console.log('2. Verifica que el token se esté enviando correctamente en el header Authorization');
    console.log('3. Asegúrate de que el formato sea: "Bearer <token>"');
    console.log('4. Verifica que el frontend esté guardando el token correctamente');
}

// Ejecutar diagnóstico
main().catch(console.error);
