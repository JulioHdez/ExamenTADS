const { getConnection, mssql } = require('../config/connection');
const Docente = require('../models/Docente');

async function testLogin() {
    try {
        console.log('=== Prueba del Sistema de Login ===');
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('Conexión exitosa a la base de datos');
        
        // Crear instancia del modelo Docente
        const docenteModel = new Docente();
        
        // Probar cifrado de contraseña
        console.log('\n1. Probando cifrado de contraseña...');
        const password = 'mi_contraseña_segura';
        const hashedPassword = await docenteModel.hashPassword(password);
        console.log('Contraseña original:', password);
        console.log('Contraseña cifrada:', hashedPassword.substring(0, 20) + '...');
        
        // Probar verificación de contraseña
        console.log('\n2. Probando verificación de contraseña...');
        const isValid = await docenteModel.verifyPassword(password, hashedPassword);
        console.log('Verificación exitosa:', isValid);
        
        // Probar verificación con contraseña incorrecta
        const isInvalid = await docenteModel.verifyPassword('contraseña_incorrecta', hashedPassword);
        console.log('Verificación con contraseña incorrecta:', isInvalid);
        
        console.log('\n=== Prueba Completada Exitosamente ===');
        
    } catch (error) {
        console.error('Error en la prueba:', error.message);
    }
}

testLogin();
