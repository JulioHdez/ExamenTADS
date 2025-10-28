const sql = require('mssql');

// Configuración de conexión
const config = {
    server: 'localhost',
    port: 1433,
    database: 'ITT_TASD',
    user: 'app_user',
    password: 'AppPassword123!',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

async function checkCarreras() {
    try {
        console.log('=== Verificando Carreras en la Base de Datos ===');
        
        const pool = await sql.connect(config);
        console.log('Conexión exitosa a la base de datos');
        
        // Verificar carreras existentes
        const result = await pool.request()
            .query('SELECT id_carrera, nombre_carrera, clave_carrera, duracion_semestres FROM carreras ORDER BY id_carrera');
        
        console.log('\nCarreras existentes:');
        if (result.recordset.length === 0) {
            console.log('No hay carreras registradas en la base de datos');
            
            // Insertar algunas carreras de ejemplo
            console.log('\nInsertando carreras de ejemplo...');
            const carreras = [
                { nombre: 'Ingeniería en Sistemas Computacionales', clave: 'ISC', duracion: 10 },
                { nombre: 'Ingeniería Industrial', clave: 'II', duracion: 10 },
                { nombre: 'Administración', clave: 'ADM', duracion: 8 },
                { nombre: 'Contabilidad', clave: 'CONT', duracion: 8 },
                { nombre: 'Psicología', clave: 'PSI', duracion: 10 },
                { nombre: 'Medicina', clave: 'MED', duracion: 12 },
                { nombre: 'Derecho', clave: 'DER', duracion: 10 }
            ];
            
            for (const carrera of carreras) {
                await pool.request()
                    .input('nombre', sql.VarChar, carrera.nombre)
                    .input('clave', sql.VarChar, carrera.clave)
                    .input('duracion', sql.Int, carrera.duracion)
                    .query(`
                        INSERT INTO carreras (nombre_carrera, clave_carrera, duracion_semestres, fecha_creacion, activo)
                        VALUES (@nombre, @clave, @duracion, GETDATE(), 1)
                    `);
                console.log(`✓ Carrera insertada: ${carrera.nombre}`);
            }
            
            // Mostrar carreras insertadas
            const newResult = await pool.request()
                .query('SELECT id_carrera, nombre_carrera, clave_carrera, duracion_semestres FROM carreras ORDER BY id_carrera');
            
            console.log('\nCarreras disponibles:');
            newResult.recordset.forEach(carrera => {
                console.log(`ID: ${carrera.id_carrera} - ${carrera.nombre_carrera} (${carrera.clave_carrera}) - ${carrera.duracion_semestres} semestres`);
            });
        } else {
            console.log('Carreras disponibles:');
            result.recordset.forEach(carrera => {
                console.log(`ID: ${carrera.id_carrera} - ${carrera.nombre_carrera} (${carrera.clave_carrera}) - ${carrera.duracion_semestres} semestres`);
            });
        }
        
        await pool.close();
        console.log('\n=== Proceso Completado ===');
        
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Código de error:', error.code);
    }
}

checkCarreras();
