#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Instalando Sistema de Gestion Academica ITT TASD...\n');

// Verificar si Node.js está instalado
try {
    const nodeVersion = process.version;
    console.log(`Node.js ${nodeVersion} detectado`);
} catch (error) {
    console.error('Node.js no está instalado. Por favor instala Node.js 16 o superior.');
    process.exit(1);
}

// Verificar si npm está disponible
try {
    execSync('npm --version', { stdio: 'pipe' });
    console.log('npm está disponible');
} catch (error) {
    console.error(' npm no está disponible');
    process.exit(1);
}

// Crear archivo .env si no existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
        fs.copyFileSync(envExamplePath, envPath);
        console.log('Archivo .env creado desde .env.example');
    } else {
        // Crear archivo .env básico
        const envContent = `# Configuración de la Base de Datos
DB_SERVER=localhost
DB_DATABASE=ITT_TASD
DB_USER=app_user
DB_PASSWORD=AppPassword123!
DB_PORT=1433
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# Configuración del Servidor
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5173
`;
        fs.writeFileSync(envPath, envContent);
        console.log('Archivo .env creado con configuración básica');
    }
} else {
    console.log('Archivo .env ya existe');
}

// Instalar dependencias
console.log('\nInstalando dependencias...');
try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('Dependencias instaladas correctamente');
} catch (error) {
    console.error('Error al instalar dependencias:', error.message);
    process.exit(1);
}

// Verificar estructura de directorios
const requiredDirs = [
    'config',
    'controllers',
    'middleware',
    'models',
    'routes'
];

console.log('\nVerificando estructura de directorios...');
for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        console.log(`Directorio ${dir} existe`);
    } else {
        console.log(` Directorio ${dir} no encontrado`);
    }
}

console.log('\nInstalacion completada!');
console.log('\nProximos pasos:');
console.log('1. Configurar la base de datos SQL Server');
console.log('2. Ajustar las variables en el archivo config/connection.js');
console.log('3. Ejecutar: npm run dev');
console.log('\nPara mas informacion, consulta el README.md');

console.log('\nEnlaces utiles:');
console.log('- API: http://localhost:3000/api');
console.log('- Health: http://localhost:3000/api/health');
console.log('- Info: http://localhost:3000/api/info');
