#!/usr/bin/env node

const sql = require('mssql');
require('dotenv').config();

async function diagnoseConnection() {
    console.log('🔍 Diagnosticando conexión a SQL Server...\n');

    // Mostrar configuración actual
    console.log('📋 Configuración actual:');
    console.log(`- Servidor: ${process.env.DB_SERVER || 'localhost'}`);
    console.log(`- Puerto: ${process.env.DB_PORT || '1433'}`);
    console.log(`- Base de datos: ${process.env.DB_DATABASE || 'ITT_TASD'}`);
    console.log(`- Usuario: ${process.env.DB_USER || 'sa'}`);
    console.log(`- Encriptación: ${process.env.DB_ENCRYPT || 'true'}`);
    console.log(`- Confiar certificado: ${process.env.DB_TRUST_SERVER_CERTIFICATE || 'true'}\n`);

    const config = {
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_DATABASE || 'ITT_TASD',
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || '',
        port: parseInt(process.env.DB_PORT) || 1433,
        options: {
            encrypt: process.env.DB_ENCRYPT === 'true' || true,
            trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true,
            enableArithAbort: true
        }
    };

    try {
        console.log('🔄 Intentando conectar...');
        const pool = await sql.connect(config);
        console.log('✅ ¡Conexión exitosa!');

        // Probar consulta básica
        console.log('\n📊 Probando consulta básica...');
        const result = await pool.request().query('SELECT @@VERSION as version');
        console.log('✅ Consulta ejecutada correctamente');
        console.log(`📋 Versión de SQL Server: ${result.recordset[0].version.split('\n')[0]}`);

        // Verificar si la base de datos existe
        console.log('\n🔍 Verificando base de datos...');
        const dbResult = await pool.request().query(`
            SELECT name FROM sys.databases WHERE name = '${config.database}'
        `);
        
        if (dbResult.recordset.length > 0) {
            console.log(`✅ Base de datos '${config.database}' encontrada`);
        } else {
            console.log(`❌ Base de datos '${config.database}' no encontrada`);
            console.log('💡 Solución: Ejecuta el script BDD.sql en SQL Server');
        }

        // Verificar tablas
        console.log('\n📋 Verificando tablas...');
        const tablesResult = await pool.request().query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        `);

        if (tablesResult.recordset.length > 0) {
            console.log('✅ Tablas encontradas:');
            tablesResult.recordset.forEach(table => {
                console.log(`  - ${table.TABLE_NAME}`);
            });
        } else {
            console.log('❌ No se encontraron tablas');
            console.log('💡 Solución: Ejecuta el script BDD.sql para crear las tablas');
        }

        await pool.close();
        console.log('\n🎉 Diagnóstico completado exitosamente');

    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message);
        
        console.log('\n🔧 Posibles soluciones:');
        
        if (error.code === 'ECONNREFUSED') {
            console.log('1. Verificar que SQL Server esté ejecutándose');
            console.log('2. Verificar que el puerto 1433 esté abierto');
            console.log('3. Verificar la configuración de firewall');
        } else if (error.code === 'ELOGIN') {
            console.log('1. Verificar usuario y contraseña');
            console.log('2. Verificar que el usuario tenga permisos');
            console.log('3. Verificar autenticación de SQL Server');
        } else if (error.code === 'ETIMEOUT') {
            console.log('1. Verificar conectividad de red');
            console.log('2. Verificar que SQL Server esté respondiendo');
        } else {
            console.log('1. Verificar configuración en el archivo .env');
            console.log('2. Verificar que SQL Server esté instalado correctamente');
            console.log('3. Verificar permisos de usuario');
        }

        console.log('\n💡 Para configurar la conexión, ejecuta:');
        console.log('node scripts/configure-db.js');
    }
}

// Ejecutar diagnóstico
diagnoseConnection();
