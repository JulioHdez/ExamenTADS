-- =====================================================
-- SCRIPT DE INSERCIÓN DE ESTUDIANTES DE PRUEBA
-- =====================================================
-- Este script inserta estudiantes de prueba con datos
-- completos incluyendo grupos, calificaciones y factores
-- =====================================================

-- Verificar si ya existen estudiantes de prueba
IF NOT EXISTS (SELECT 1 FROM estudiantes WHERE num_control LIKE 'TEST%')
BEGIN
    PRINT 'Insertando estudiantes de prueba...'
    
    -- Estudiante 1: Ingeniería en Sistemas
    INSERT INTO estudiantes (
        num_control, apellido_paterno, apellido_materno, nombre, genero,
        fecha_nacimiento, email, telefono, direccion, id_carrera,
        semestre_actual, fecha_ingreso, estatus, promedio_general
    ) VALUES (
        'TEST001', 'López', 'García', 'Juan Carlos', 'M',
        '2003-05-15', 'juan.lopez@student.tec.com', '6641111111', 'Av. Universidad 123',
        2, 5, '2021-08-15', 'Activo', 85.5
    )
    
    -- Estudiante 2: Administración
    INSERT INTO estudiantes (
        num_control, apellido_paterno, apellido_materno, nombre, genero,
        fecha_nacimiento, email, telefono, direccion, id_carrera,
        semestre_actual, fecha_ingreso, estatus, promedio_general
    ) VALUES (
        'TEST002', 'Martínez', 'Rodríguez', 'María Fernanda', 'F',
        '2002-08-22', 'maria.martinez@student.tec.com', '6642222222', 'Calle Principal 456',
        4, 6, '2020-08-15', 'Activo', 92.3
    )
    
    -- Estudiante 3: Psicología
    INSERT INTO estudiantes (
        num_control, apellido_paterno, apellido_materno, nombre, genero,
        fecha_nacimiento, email, telefono, direccion, id_carrera,
        semestre_actual, fecha_ingreso, estatus, promedio_general
    ) VALUES (
        'TEST003', 'Hernández', 'Vega', 'Alejandro', 'M',
        '2004-03-10', 'alejandro.hernandez@student.tec.com', '6643333333', 'Blvd. Tecnológico 789',
        6, 3, '2022-08-15', 'Activo', 78.9
    )
    
    -- Estudiante 4: Ingeniería Industrial
    INSERT INTO estudiantes (
        num_control, apellido_paterno, apellido_materno, nombre, genero,
        fecha_nacimiento, email, telefono, direccion, id_carrera,
        semestre_actual, fecha_ingreso, estatus, promedio_general
    ) VALUES (
        'TEST004', 'González', 'Morales', 'Sofía', 'F',
        '2003-11-28', 'sofia.gonzalez@student.tec.com', '6644444444', 'Av. Industrial 321',
        3, 4, '2021-08-15', 'Activo', 88.7
    )
    
    -- Estudiante 5: Contabilidad
    INSERT INTO estudiantes (
        num_control, apellido_paterno, apellido_materno, nombre, genero,
        fecha_nacimiento, email, telefono, direccion, id_carrera,
        semestre_actual, fecha_ingreso, estatus, promedio_general
    ) VALUES (
        'TEST005', 'Ramírez', 'Castro', 'Diego', 'M',
        '2002-07-14', 'diego.ramirez@student.tec.com', '6645555555', 'Calle Contadores 654',
        5, 7, '2020-08-15', 'Activo', 91.2
    )
    
    PRINT 'Estudiantes de prueba insertados exitosamente'
END
ELSE
BEGIN
    PRINT 'Los estudiantes de prueba ya existen en la base de datos'
END

-- Mostrar los estudiantes insertados
SELECT 
    e.id_estudiante,
    e.num_control,
    CONCAT(e.nombre, ' ', e.apellido_paterno, ' ', e.apellido_materno) AS nombre_completo,
    c.nombre_carrera,
    e.semestre_actual,
    e.promedio_general,
    e.estatus
FROM estudiantes e
INNER JOIN carreras c ON e.id_carrera = c.id_carrera
WHERE e.num_control LIKE 'TEST%'
ORDER BY e.id_estudiante
