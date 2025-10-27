#!/usr/bin/env node

const { connectDB, getPool, closeDB } = require('../config/database');

async function testDatabase() {
    console.log('Probando conexion a la base de datos...\n');

    try {
        // Conectar a la base de datos
        await connectDB();
        console.log('Conexion a la base de datos exitosa');

        const pool = getPool();

        // Probar consulta básica
        console.log('\nProbando consultas basicas...');
        
        // Verificar que las tablas existen
        const tables = [
            'carreras',
            'estudiantes', 
            'docentes',
            'materias',
            'grupos',
            'calificaciones_parciales',
            'factores'
        ];

        for (const table of tables) {
            try {
                const result = await pool.request().query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`Tabla ${table}: ${result.recordset[0].count} registros`);
            } catch (error) {
                console.log(`Error en tabla ${table}: ${error.message}`);
            }
        }

        // Probar consulta compleja
        console.log('\nProbando consulta compleja...');
        try {
            const result = await pool.request().query(`
                SELECT 
                    c.nombre_carrera,
                    COUNT(e.id_estudiante) as total_estudiantes
                FROM carreras c
                LEFT JOIN estudiantes e ON c.id_carrera = e.id_carrera
                GROUP BY c.id_carrera, c.nombre_carrera
                ORDER BY total_estudiantes DESC
            `);
            console.log('Consulta compleja ejecutada correctamente');
            console.log('Resultados:', result.recordset);
        } catch (error) {
            console.log(`Error en consulta compleja: ${error.message}`);
        }

        // Cerrar conexión
        await closeDB();
        console.log('\nPrueba de base de datos completada exitosamente');

    } catch (error) {
        console.error('Error en la prueba de base de datos:', error.message);
        console.error('\nPosibles soluciones:');
        console.error('1. Verificar que SQL Server este ejecutandose');
        console.error('2. Verificar las credenciales en el archivo config/connection.js');
        console.error('3. Verificar que la base de datos ITT_TASD existe');
        console.error('4. Verificar que las tablas estan creadas correctamente');
        process.exit(1);
    }
}

// Ejecutar prueba
testDatabase();
