const sql = require('mssql');

async function testWindowsAuth() {
    console.log('Probando Windows Authentication...');
    
    // Configuración 1: Con protocolo específico
    const config1 = {
        server: 'DESKTOP-I2EHQKF\\SQLEXPRESS',
        database: 'ITT_TASD',
        options: {
            trustedConnection: true,
            encrypt: true,
            trustServerCertificate: true,
            enableArithAbort: true,
            connectionTimeout: 30000,
            requestTimeout: 30000
        }
    };

    try {
        console.log('Intentando configuracion 1...');
        const pool1 = await sql.connect(config1);
        console.log('Conexion exitosa con configuracion 1!');
        await pool1.close();
        return;
    } catch (error) {
        console.log('Error configuracion 1:', error.message);
    }

    // Configuración 2: Sin encriptación
    const config2 = {
        server: 'DESKTOP-I2EHQKF\\SQLEXPRESS',
        database: 'ITT_TASD',
        options: {
            trustedConnection: true,
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    };

    try {
        console.log('Intentando configuracion 2...');
        const pool2 = await sql.connect(config2);
        console.log('Conexion exitosa con configuracion 2!');
        await pool2.close();
        return;
    } catch (error) {
        console.log('Error configuracion 2:', error.message);
    }

    // Configuración 3: Con localhost
    const config3 = {
        server: 'localhost\\SQLEXPRESS',
        database: 'ITT_TASD',
        options: {
            trustedConnection: true,
            encrypt: false,
            trustServerCertificate: true,
            enableArithAbort: true
        }
    };

    try {
        console.log('Intentando configuracion 3...');
        const pool3 = await sql.connect(config3);
        console.log('Conexion exitosa con configuracion 3!');
        await pool3.close();
        return;
    } catch (error) {
        console.log('Error configuracion 3:', error.message);
    }

    console.log('Todas las configuraciones fallaron');
}

testWindowsAuth();
