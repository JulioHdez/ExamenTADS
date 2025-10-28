-- =====================================================
-- SCRIPT DE INSERCIÓN DE CALIFICACIONES PARCIALES DE PRUEBA
-- =====================================================
-- Este script inserta calificaciones parciales relacionadas
-- con los grupos de prueba existentes
-- =====================================================

-- Verificar si ya existen calificaciones de prueba
IF NOT EXISTS (SELECT 1 FROM calificaciones_parciales cp 
               INNER JOIN grupos g ON cp.id_grupo = g.id_grupo 
               WHERE g.clave_grupo LIKE 'TEST%')
BEGIN
    PRINT 'Insertando calificaciones parciales de prueba...'
    
    -- Variables para almacenar IDs de grupos
    DECLARE @grupo1 INT, @grupo2 INT, @grupo3 INT, @grupo4 INT, @grupo5 INT
    
    -- Obtener IDs de grupos de prueba
    SELECT @grupo1 = id_grupo FROM grupos WHERE clave_grupo = 'TEST001'
    SELECT @grupo2 = id_grupo FROM grupos WHERE clave_grupo = 'TEST002'
    SELECT @grupo3 = id_grupo FROM grupos WHERE clave_grupo = 'TEST003'
    SELECT @grupo4 = id_grupo FROM grupos WHERE clave_grupo = 'TEST004'
    SELECT @grupo5 = id_grupo FROM grupos WHERE clave_grupo = 'TEST005'
    
    -- Calificaciones para Grupo 1 (Estudiante de Sistemas)
    INSERT INTO calificaciones_parciales (id_grupo, unidad, calificacion, fecha_calificacion) VALUES
    (@grupo1, 1, 85.5, '2024-09-15'),
    (@grupo1, 2, 92.0, '2024-10-15'),
    (@grupo1, 3, 88.5, '2024-11-15')
    
    -- Calificaciones para Grupo 2 (Estudiante de Administración)
    INSERT INTO calificaciones_parciales (id_grupo, unidad, calificacion, fecha_calificacion) VALUES
    (@grupo2, 1, 95.0, '2024-09-20'),
    (@grupo2, 2, 89.5, '2024-10-20'),
    (@grupo2, 3, 92.5, '2024-11-20')
    
    -- Calificaciones para Grupo 3 (Estudiante de Psicología)
    INSERT INTO calificaciones_parciales (id_grupo, unidad, calificacion, fecha_calificacion) VALUES
    (@grupo3, 1, 78.0, '2024-09-25'),
    (@grupo3, 2, 82.5, '2024-10-25'),
    (@grupo3, 3, 76.0, '2024-11-25')
    
    -- Calificaciones para Grupo 4 (Estudiante de Industrial)
    INSERT INTO calificaciones_parciales (id_grupo, unidad, calificacion, fecha_calificacion) VALUES
    (@grupo4, 1, 90.0, '2024-09-30'),
    (@grupo4, 2, 87.5, '2024-10-30'),
    (@grupo4, 3, 88.5, '2024-11-30')
    
    -- Calificaciones para Grupo 5 (Estudiante de Contabilidad)
    INSERT INTO calificaciones_parciales (id_grupo, unidad, calificacion, fecha_calificacion) VALUES
    (@grupo5, 1, 94.0, '2024-10-05'),
    (@grupo5, 2, 91.5, '2024-11-05'),
    (@grupo5, 3, 88.0, '2024-12-05')
    
    PRINT 'Calificaciones parciales de prueba insertadas exitosamente'
END
ELSE
BEGIN
    PRINT 'Las calificaciones de prueba ya existen en la base de datos'
END

-- Mostrar las calificaciones insertadas
SELECT 
    cp.id_calificacion,
    g.clave_grupo,
    CONCAT(e.nombre, ' ', e.apellido_paterno) AS estudiante,
    m.nombre_materia,
    cp.unidad,
    cp.calificacion,
    cp.fecha_calificacion
FROM calificaciones_parciales cp
INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
INNER JOIN materias m ON g.id_materia = m.id_materia
WHERE g.clave_grupo LIKE 'TEST%'
ORDER BY g.clave_grupo, cp.unidad
