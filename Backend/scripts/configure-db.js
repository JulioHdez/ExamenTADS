#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function configureDatabase() {
    console.log('Configurando conexión a SQL Server...\n');

    console.log('Por favor, proporciona la siguiente información:');
    console.log('(Presiona Enter para usar los valores por defecto)\n');

    // Obtener información del usuario
    const server = await question('Servidor SQL Server (localhost): ') || 'localhost';
    const port = await question('Puerto (1433): ') || '1433';
    const database = await question('Nombre de la base de datos (ITT_TASD): ') || 'ITT_TASD';
    const user = await question('Usuario (sa): ') || 'sa';
    const password = await question('Contraseña: ');
    const encrypt = await question('¿Usar encriptación? (true/false, default: true): ') || 'true';
    const trustCert = await question('¿Confiar en certificado del servidor? (true/false, default: true): ') || 'true';

    // Crear contenido del archivo .env
    const envContent = `# Configuración de la Base de Datos
DB_SERVER=${server}
DB_DATABASE=${database}
DB_USER=${user}
DB_PASSWORD=${password}
DB_PORT=${port}
DB_ENCRYPT=${encrypt}
DB_TRUST_SERVER_CERTIFICATE=${trustCert}

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# JWT Secret (cambiar por uno seguro en producción)
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_${Date.now()}
JWT_EXPIRES_IN=24h

# CORS - Origen permitido para el frontend
CORS_ORIGIN=http://localhost:5173
`;

    // Escribir archivo .env
    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Archivo .env actualizado con tu configuración');
    console.log('\n📋 Configuración guardada:');
    console.log(`- Servidor: ${server}:${port}`);
    console.log(`- Base de datos: ${database}`);
    console.log(`- Usuario: ${user}`);
    console.log(`- Encriptación: ${encrypt}`);
    console.log(`- Confiar certificado: ${trustCert}`);

    rl.close();
}

// Ejecutar configuración
configureDatabase().catch(console.error);
