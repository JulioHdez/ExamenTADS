-- =====================================================
-- SCRIPT DE INSERCIÓN DE FACTORES DE RIESGO DE PRUEBA
-- =====================================================
-- Este script inserta factores de riesgo relacionados
-- con los estudiantes de prueba existentes
-- =====================================================

-- Verificar si ya existen factores de prueba
IF NOT EXISTS (SELECT 1 FROM factores f 
               INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante 
               WHERE e.num_control LIKE 'TEST%')
BEGIN
    PRINT 'Insertando factores de riesgo de prueba...'
    
    -- Variables para almacenar IDs de estudiantes
    DECLARE @estudiante1 INT, @estudiante2 INT, @estudiante3 INT, @estudiante4 INT, @estudiante5 INT
    
    -- Obtener IDs de estudiantes de prueba
    SELECT @estudiante1 = id_estudiante FROM estudiantes WHERE num_control = 'TEST001'
    SELECT @estudiante2 = id_estudiante FROM estudiantes WHERE num_control = 'TEST002'
    SELECT @estudiante3 = id_estudiante FROM estudiantes WHERE num_control = 'TEST003'
    SELECT @estudiante4 = id_estudiante FROM estudiantes WHERE num_control = 'TEST004'
    SELECT @estudiante5 = id_estudiante FROM estudiantes WHERE num_control = 'TEST005'
    
    -- Factores para Estudiante 1 (Sistemas) - Factores académicos y económicos
    INSERT INTO factores (id_estudiante, nombre_factor, descripcion, fecha_asignacion, activo, observaciones) VALUES
    (@estudiante1, 'Académico', 'Factor de riesgo: Académico', '2024-09-01', 1, 'Dificultades en materias de programación avanzada'),
    (@estudiante1, 'Económico', 'Factor de riesgo: Económico', '2024-09-01', 1, 'Problemas económicos familiares que afectan el rendimiento')
    
    -- Factores para Estudiante 2 (Administración) - Factor motivacional
    INSERT INTO factores (id_estudiante, nombre_factor, descripcion, fecha_asignacion, activo, observaciones) VALUES
    (@estudiante2, 'Motivacional', 'Factor de riesgo: Motivacional', '2024-09-05', 1, 'Falta de motivación en algunas materias teóricas')
    
    -- Factores para Estudiante 3 (Psicología) - Factores familiares y de salud
    INSERT INTO factores (id_estudiante, nombre_factor, descripcion, fecha_asignacion, activo, observaciones) VALUES
    (@estudiante3, 'Familiar', 'Factor de riesgo: Familiar', '2024-09-10', 1, 'Problemas familiares que afectan la concentración'),
    (@estudiante3, 'Salud', 'Factor de riesgo: Salud', '2024-09-10', 1, 'Problemas de salud que requieren atención médica')
    
    -- Factores para Estudiante 4 (Industrial) - Factores sociales y de transporte
    INSERT INTO factores (id_estudiante, nombre_factor, descripcion, fecha_asignacion, activo, observaciones) VALUES
    (@estudiante4, 'Social', 'Factor de riesgo: Social', '2024-09-15', 1, 'Dificultades de integración social en el grupo'),
    (@estudiante4, 'Transporte', 'Factor de riesgo: Transporte', '2024-09-15', 1, 'Problemas de transporte que causan llegadas tardías')
    
    -- Factores para Estudiante 5 (Contabilidad) - Factores laborales y académicos
    INSERT INTO factores (id_estudiante, nombre_factor, descripcion, fecha_asignacion, activo, observaciones) VALUES
    (@estudiante5, 'Laboral', 'Factor de riesgo: Laboral', '2024-09-20', 1, 'Trabajo de medio tiempo que interfiere con estudios'),
    (@estudiante5, 'Académico', 'Factor de riesgo: Académico', '2024-09-20', 1, 'Dificultades en matemáticas financieras')
    
    PRINT 'Factores de riesgo de prueba insertados exitosamente'
END
ELSE
BEGIN
    PRINT 'Los factores de prueba ya existen en la base de datos'
END

-- Mostrar los factores insertados
SELECT 
    f.id_factor,
    f.nombre_factor,
    CONCAT(e.nombre, ' ', e.apellido_paterno) AS estudiante,
    c.nombre_carrera,
    f.descripcion,
    f.fecha_asignacion,
    f.observaciones,
    CASE WHEN f.activo = 1 THEN 'Activo' ELSE 'Inactivo' END AS estado
FROM factores f
INNER JOIN estudiantes e ON f.id_estudiante = e.id_estudiante
INNER JOIN carreras c ON e.id_carrera = c.id_carrera
WHERE e.num_control LIKE 'TEST%'
ORDER BY e.num_control, f.nombre_factor
