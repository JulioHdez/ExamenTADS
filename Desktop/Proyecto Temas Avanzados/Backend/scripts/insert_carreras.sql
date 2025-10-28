-- Script para insertar todas las carreras necesarias
USE [ITT_TASD]
GO

-- Eliminar carreras existentes si es necesario
DELETE FROM carreras WHERE id_carrera IN (2,3,4,5,6,7,8)
GO

-- Insertar todas las carreras necesarias
INSERT INTO carreras (id_carrera, nombre_carrera, clave_carrera, descripcion, duracion_semestres, fecha_creacion, activo)
VALUES 
(2, 'Ingeniería en Sistemas', 'IS', 'Ingeniería en Sistemas Computacionales', 9, GETDATE(), 1),
(3, 'Ingeniería Industrial', 'II', 'Ingeniería Industrial', 9, GETDATE(), 1),
(4, 'Administración', 'ADM', 'Licenciatura en Administración', 8, GETDATE(), 1),
(5, 'Contabilidad', 'CONT', 'Licenciatura en Contabilidad', 8, GETDATE(), 1),
(6, 'Psicología', 'PSI', 'Licenciatura en Psicología', 8, GETDATE(), 1),
(7, 'Medicina', 'MED', 'Licenciatura en Medicina', 12, GETDATE(), 1),
(8, 'Derecho', 'DER', 'Licenciatura en Derecho', 8, GETDATE(), 1)
GO

-- Verificar que se insertaron correctamente
SELECT * FROM carreras ORDER BY id_carrera
GO
