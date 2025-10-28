-- =====================================================
-- SCRIPT DE INSERCIÓN DE DOCENTES DE PRUEBA
-- =====================================================
-- Este script inserta docentes de prueba con contraseñas
-- que serán encriptadas automáticamente por el sistema
-- =====================================================

-- Verificar si ya existen docentes de prueba
IF NOT EXISTS (SELECT 1 FROM docentes WHERE num_empleado LIKE 'TEST%')
BEGIN
    PRINT 'Insertando docentes de prueba...'
    
    -- Docente 1: Profesor de Sistemas
    INSERT INTO docentes (
        num_empleado, apellido_paterno, apellido_materno, nombre, genero, 
        email, telefono, especialidad, grado_academico, fecha_contratacion, 
        estatus, contrasena
    ) VALUES (
        'TEST001', 'García', 'López', 'Carlos Alberto', 'M',
        'carlos.garcia@tec.com', '6641234567', 'Desarrollo de Software', 'Maestría',
        '2020-01-15', 'Activo', 'password123'  -- Contraseña: password123
    )
    
    -- Docente 2: Profesora de Matemáticas
    INSERT INTO docentes (
        num_empleado, apellido_paterno, apellido_materno, nombre, genero, 
        email, telefono, especialidad, grado_academico, fecha_contratacion, 
        estatus, contrasena
    ) VALUES (
        'TEST002', 'Martínez', 'Rodríguez', 'Ana María', 'F',
        'ana.martinez@tec.com', '6642345678', 'Matemáticas Aplicadas', 'Doctorado',
        '2019-08-20', 'Activo', 'matematica456'  -- Contraseña: matematica456
    )
    
    -- Docente 3: Profesor de Inglés
    INSERT INTO docentes (
        num_empleado, apellido_paterno, apellido_materno, nombre, genero, 
        email, telefono, especialidad, grado_academico, fecha_contratacion, 
        estatus, contrasena
    ) VALUES (
        'TEST003', 'Johnson', 'Smith', 'Michael David', 'M',
        'michael.johnson@tec.com', '6643456789', 'Lenguas Extranjeras', 'Maestría',
        '2021-02-10', 'Activo', 'english789'  -- Contraseña: english789
    )
    
    -- Docente 4: Profesora de Administración
    INSERT INTO docentes (
        num_empleado, apellido_paterno, apellido_materno, nombre, genero, 
        email, telefono, especialidad, grado_academico, fecha_contratacion, 
        estatus, contrasena
    ) VALUES (
        'TEST004', 'Hernández', 'González', 'Patricia', 'F',
        'patricia.hernandez@tec.com', '6644567890', 'Administración Empresarial', 'Maestría',
        '2020-06-01', 'Activo', 'admin2024'  -- Contraseña: admin2024
    )
    
    -- Docente 5: Profesor de Psicología
    INSERT INTO docentes (
        num_empleado, apellido_paterno, apellido_materno, nombre, genero, 
        email, telefono, especialidad, grado_academico, fecha_contratacion, 
        estatus, contrasena
    ) VALUES (
        'TEST005', 'Ramírez', 'Vega', 'Roberto', 'M',
        'roberto.ramirez@tec.com', '6645678901', 'Psicología Clínica', 'Doctorado',
        '2018-09-15', 'Activo', 'psicologia123'  -- Contraseña: psicologia123
    )
    
    PRINT 'Docentes de prueba insertados exitosamente'
    PRINT 'Contraseñas (serán encriptadas automáticamente):'
    PRINT '- TEST001: password123'
    PRINT '- TEST002: matematica456'
    PRINT '- TEST003: english789'
    PRINT '- TEST004: admin2024'
    PRINT '- TEST005: psicologia123'
END
ELSE
BEGIN
    PRINT 'Los docentes de prueba ya existen en la base de datos'
END

-- Mostrar los docentes insertados
SELECT 
    id_docente,
    num_empleado,
    CONCAT(nombre, ' ', apellido_paterno, ' ', apellido_materno) AS nombre_completo,
    email,
    especialidad,
    estatus
FROM docentes 
WHERE num_empleado LIKE 'TEST%'
ORDER BY id_docente
