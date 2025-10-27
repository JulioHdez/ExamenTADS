-- =====================================================
-- SCRIPT DE INSERCIÓN DE GRUPOS DE PRUEBA
-- =====================================================
-- Este script inserta grupos de prueba relacionados con
-- estudiantes y docentes existentes
-- =====================================================

-- Verificar si ya existen grupos de prueba
IF NOT EXISTS (SELECT 1 FROM grupos WHERE clave_grupo LIKE 'TEST%')
BEGIN
    PRINT 'Insertando grupos de prueba...'
    
    -- Obtener IDs de estudiantes y docentes de prueba
    DECLARE @estudiante1 INT, @estudiante2 INT, @estudiante3 INT, @estudiante4 INT, @estudiante5 INT
    DECLARE @docente1 INT, @docente2 INT, @docente3 INT, @docente4 INT, @docente5 INT
    DECLARE @materia1 INT, @materia2 INT, @materia3 INT, @materia4 INT, @materia5 INT
    
    -- Obtener IDs de estudiantes
    SELECT @estudiante1 = id_estudiante FROM estudiantes WHERE num_control = 'TEST001'
    SELECT @estudiante2 = id_estudiante FROM estudiantes WHERE num_control = 'TEST002'
    SELECT @estudiante3 = id_estudiante FROM estudiantes WHERE num_control = 'TEST003'
    SELECT @estudiante4 = id_estudiante FROM estudiantes WHERE num_control = 'TEST004'
    SELECT @estudiante5 = id_estudiante FROM estudiantes WHERE num_control = 'TEST005'
    
    -- Obtener IDs de docentes
    SELECT @docente1 = id_docente FROM docentes WHERE num_empleado = 'TEST001'
    SELECT @docente2 = id_docente FROM docentes WHERE num_empleado = 'TEST002'
    SELECT @docente3 = id_docente FROM docentes WHERE num_empleado = 'TEST003'
    SELECT @docente4 = id_docente FROM docentes WHERE num_empleado = 'TEST004'
    SELECT @docente5 = id_docente FROM docentes WHERE num_empleado = 'TEST005'
    
    -- Obtener IDs de materias (usando las primeras materias disponibles)
    SELECT TOP 1 @materia1 = id_materia FROM materias WHERE clave_materia LIKE 'ISC%' ORDER BY id_materia
    SELECT TOP 1 @materia2 = id_materia FROM materias WHERE clave_materia LIKE 'MAT%' ORDER BY id_materia
    SELECT TOP 1 @materia3 = id_materia FROM materias WHERE clave_materia LIKE 'ING%' ORDER BY id_materia
    SELECT TOP 1 @materia4 = id_materia FROM materias WHERE clave_materia LIKE 'ADM%' ORDER BY id_materia
    SELECT TOP 1 @materia5 = id_materia FROM materias WHERE clave_materia LIKE 'PSI%' ORDER BY id_materia
    
    -- Grupo 1: Estudiante de Sistemas con Profesor de Sistemas
    INSERT INTO grupos (
        id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula
    ) VALUES (
        @estudiante1, @docente1, @materia1, 'TEST001', '5', 2024, '1', 'Lunes y Miércoles 8:00-10:00', 'A-101'
    )
    
    -- Grupo 2: Estudiante de Administración con Profesora de Administración
    INSERT INTO grupos (
        id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula
    ) VALUES (
        @estudiante2, @docente4, @materia4, 'TEST002', '6', 2024, '1', 'Martes y Jueves 10:00-12:00', 'B-205'
    )
    
    -- Grupo 3: Estudiante de Psicología con Profesor de Psicología
    INSERT INTO grupos (
        id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula
    ) VALUES (
        @estudiante3, @docente5, @materia5, 'TEST003', '3', 2024, '1', 'Lunes y Viernes 14:00-16:00', 'C-301'
    )
    
    -- Grupo 4: Estudiante de Industrial con Profesor de Matemáticas
    INSERT INTO grupos (
        id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula
    ) VALUES (
        @estudiante4, @docente2, @materia2, 'TEST004', '4', 2024, '1', 'Miércoles y Viernes 8:00-10:00', 'A-102'
    )
    
    -- Grupo 5: Estudiante de Contabilidad con Profesor de Inglés
    INSERT INTO grupos (
        id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula
    ) VALUES (
        @estudiante5, @docente3, @materia3, 'TEST005', '7', 2024, '1', 'Martes y Jueves 16:00-18:00', 'B-206'
    )
    
    PRINT 'Grupos de prueba insertados exitosamente'
END
ELSE
BEGIN
    PRINT 'Los grupos de prueba ya existen en la base de datos'
END

-- Mostrar los grupos insertados
SELECT 
    g.id_grupo,
    g.clave_grupo,
    CONCAT(e.nombre, ' ', e.apellido_paterno) AS estudiante,
    CONCAT(d.nombre, ' ', d.apellido_paterno) AS docente,
    m.nombre_materia,
    g.semestre,
    g.horario,
    g.aula
FROM grupos g
INNER JOIN estudiantes e ON g.id_estudiante = e.id_estudiante
INNER JOIN docentes d ON g.id_docente = d.id_docente
INNER JOIN materias m ON g.id_materia = m.id_materia
WHERE g.clave_grupo LIKE 'TEST%'
ORDER BY g.id_grupo
