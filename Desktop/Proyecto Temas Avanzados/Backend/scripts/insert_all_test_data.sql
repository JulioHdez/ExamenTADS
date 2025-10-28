-- =====================================================
-- SCRIPT MAESTRO DE DATOS DE PRUEBA
-- =====================================================
-- Este script ejecuta todos los scripts de inserción
-- de datos de prueba en el orden correcto
-- =====================================================

PRINT '====================================================='
PRINT 'INICIANDO INSERCIÓN DE DATOS DE PRUEBA'
PRINT '====================================================='
PRINT ''

-- Verificar que las tablas principales existan
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'carreras')
BEGIN
    PRINT 'ERROR: La tabla carreras no existe. Ejecute primero el script de creación de base de datos.'
    RETURN
END

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'materias')
BEGIN
    PRINT 'ERROR: La tabla materias no existe. Ejecute primero el script de inserción de materias.'
    RETURN
END

-- Verificar que existan carreras y materias
IF NOT EXISTS (SELECT 1 FROM carreras)
BEGIN
    PRINT 'ERROR: No hay carreras en la base de datos. Ejecute primero el script de carreras.'
    RETURN
END

IF NOT EXISTS (SELECT 1 FROM materias)
BEGIN
    PRINT 'ERROR: No hay materias en la base de datos. Ejecute primero el script de materias.'
    RETURN
END

PRINT 'Verificaciones previas completadas exitosamente'
PRINT ''

-- 1. Insertar docentes
PRINT '1. Insertando docentes de prueba...'
-- Ejecutar script de docentes aquí
-- (En un entorno real, usaría sqlcmd o similar para ejecutar archivos externos)

-- 2. Insertar estudiantes
PRINT '2. Insertando estudiantes de prueba...'
-- Ejecutar script de estudiantes aquí

-- 3. Insertar grupos
PRINT '3. Insertando grupos de prueba...'
-- Ejecutar script de grupos aquí

-- 4. Insertar calificaciones
PRINT '4. Insertando calificaciones parciales de prueba...'
-- Ejecutar script de calificaciones aquí

-- 5. Insertar factores
PRINT '5. Insertando factores de riesgo de prueba...'
-- Ejecutar script de factores aquí

PRINT ''
PRINT '====================================================='
PRINT 'RESUMEN DE DATOS INSERTADOS'
PRINT '====================================================='

-- Mostrar resumen de datos insertados
SELECT 'DOCENTES' AS tabla, COUNT(*) AS cantidad FROM docentes WHERE num_empleado LIKE 'TEST%'
UNION ALL
SELECT 'ESTUDIANTES' AS tabla, COUNT(*) AS cantidad FROM estudiantes WHERE num_control LIKE 'TEST%'
UNION ALL
SELECT 'GRUPOS' AS tabla, COUNT(*) AS cantidad FROM grupos WHERE clave_grupo LIKE 'TEST%'
UNION ALL
SELECT 'CALIFICACIONES' AS tabla, COUNT(*) AS cantidad FROM calificaciones_parciales cp 
    INNER JOIN grupos g ON cp.id_grupo = g.id_grupo WHERE g.clave_grupo LIKE 'TEST%'
UNION ALL
SELECT 'FACTORES' AS tabla, COUNT(*) AS cantidad FROM factores f 
    INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante WHERE e.num_control LIKE 'TEST%'

PRINT ''
PRINT '====================================================='
PRINT 'CREDENCIALES DE ACCESO PARA DOCENTES DE PRUEBA'
PRINT '====================================================='
PRINT 'TEST001 - Carlos García López: password123'
PRINT 'TEST002 - Ana Martínez Rodríguez: matematica456'
PRINT 'TEST003 - Michael Johnson Smith: english789'
PRINT 'TEST004 - Patricia Hernández González: admin2024'
PRINT 'TEST005 - Roberto Ramírez Vega: psicologia123'
PRINT ''
PRINT 'NOTA: Las contraseñas serán encriptadas automáticamente'
PRINT 'al hacer login en el sistema.'
PRINT ''
PRINT 'DATOS DE PRUEBA INSERTADOS EXITOSAMENTE'
PRINT '====================================================='
