const { getConnection } = require('./Backend/config/connection');

async function checkMaterias() {
    try {
        const pool = await getConnection();
        
        // Verificar total de materias
        const totalResult = await pool.request().query('SELECT COUNT(*) as count FROM materias');
        console.log('Total materias:', totalResult.recordset[0].count);
        
        // Verificar materias básicas
        const basicasResult = await pool.request().query(`
            SELECT COUNT(*) as count FROM materias 
            WHERE clave_materia LIKE 'MAT%' 
               OR clave_materia LIKE 'EST%' 
               OR clave_materia LIKE 'ING%' 
               OR clave_materia LIKE 'FIL%' 
               OR clave_materia LIKE 'HIS%' 
               OR clave_materia LIKE 'COM%'
               OR clave_materia LIKE 'FIS%' 
               OR clave_materia LIKE 'QUI%'
        `);
        console.log('Materias básicas:', basicasResult.recordset[0].count);
        
        // Verificar materias de sistemas
        const sistemasResult = await pool.request().query(`
            SELECT COUNT(*) as count FROM materias 
            WHERE clave_materia LIKE 'ISC%'
        `);
        console.log('Materias sistemas:', sistemasResult.recordset[0].count);
        
        // Mostrar algunas materias de ejemplo
        const sampleResult = await pool.request().query(`
            SELECT TOP 5 clave_materia, nombre_materia, activo FROM materias 
            ORDER BY clave_materia
        `);
        console.log('Materias de ejemplo:');
        sampleResult.recordset.forEach(materia => {
            console.log(`- ${materia.clave_materia}: ${materia.nombre_materia} (activo: ${materia.activo})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkMaterias();
