const { getConnection, mssql } = require('../config/connection');

async function updateDatabase() {
    try {
        console.log('Conectando a la base de datos...');
        const pool = await getConnection();
        console.log('Conexión exitosa');

        // Script SQL para agregar columna de contraseña
        const sqlScript = `
            USE ITT_TASD;
            
            -- Verificar si la columna ya existe
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                          WHERE TABLE_NAME = 'docentes' AND COLUMN_NAME = 'contraseña')
            BEGIN
                -- Agregar columna de contraseña
                ALTER TABLE docentes 
                ADD contraseña NVARCHAR(255) NULL;
                
                PRINT 'Columna contraseña agregada exitosamente';
            END
            ELSE
            BEGIN
                PRINT 'La columna contraseña ya existe';
            END
            
            -- Crear índice si no existe
            IF NOT EXISTS (SELECT * FROM sys.indexes 
                          WHERE name = 'IX_docentes_contraseña' AND object_id = OBJECT_ID('docentes'))
            BEGIN
                CREATE INDEX IX_docentes_contraseña ON docentes(contraseña);
                PRINT 'Índice creado exitosamente';
            END
            ELSE
            BEGIN
                PRINT 'El índice ya existe';
            END
        `;

        console.log('Ejecutando script de actualización...');
        const result = await pool.request().query(sqlScript);
        console.log('Script ejecutado exitosamente');

        console.log('Base de datos actualizada correctamente');
        
    } catch (error) {
        console.error('Error al actualizar la base de datos:', error.message);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    updateDatabase()
        .then(() => {
            console.log('Actualización completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error.message);
            process.exit(1);
        });
}

module.exports = updateDatabase;
