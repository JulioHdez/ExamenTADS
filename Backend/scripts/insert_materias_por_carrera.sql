-- EL ID EMPIEZA EN 2 YA QUE EL 1 LO USE COMO UN TEST --

-- Script para insertar materias específicas por carrera del ITT Tijuana
USE [ITT_TASD]
GO

-- Verificar si ya existen materias
IF EXISTS (SELECT 1 FROM materias)
BEGIN
    PRINT 'Ya existen materias en la base de datos'
    SELECT COUNT(*) as total_materias FROM materias
END
ELSE
BEGIN
    PRINT 'Insertando materias específicas por carrera del ITT Tijuana...'
    
    -- Materias básicas comunes para todas las carreras
    INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoria, horas_practica, descripcion, activo)
    VALUES 
    -- Materias básicas comunes
    ('MAT001', 'Matemáticas Básicas', 4, 3, 1, 'Matemáticas fundamentales para todas las carreras', 1),
    ('EST001', 'Estadística', 4, 3, 1, 'Estadística descriptiva e inferencial', 1),
    ('ING001', 'Inglés I', 3, 2, 1, 'Inglés básico nivel I', 1),
    ('ING002', 'Inglés II', 3, 2, 1, 'Inglés básico nivel II', 1),
    ('FIL001', 'Filosofía', 3, 3, 0, 'Introducción a la filosofía', 1),
    ('HIS001', 'Historia de México', 3, 3, 0, 'Historia contemporánea de México', 1),
    ('COM001', 'Comunicación Oral y Escrita', 3, 2, 1, 'Desarrollo de habilidades comunicativas', 1),
    ('FIS001', 'Física', 4, 3, 1, 'Física general', 1),
    ('QUI001', 'Química', 4, 3, 1, 'Química general', 1),
    
    -- INGENIERÍA EN SISTEMAS COMPUTACIONALES (ID_CARRERA = 2)
    ('ISC101', 'Fundamentos de Programación', 5, 3, 2, 'Introducción a la programación estructurada', 1),
    ('ISC102', 'Programación Orientada a Objetos', 5, 3, 2, 'Paradigma de programación orientada a objetos', 1),
    ('ISC103', 'Estructuras de Datos', 4, 3, 1, 'Algoritmos y estructuras de datos fundamentales', 1),
    ('ISC104', 'Bases de Datos I', 4, 2, 2, 'Diseño y administración de bases de datos', 1),
    ('ISC105', 'Bases de Datos II', 4, 2, 2, 'Bases de datos avanzadas y optimización', 1),
    ('ISC201', 'Desarrollo Web I', 4, 2, 2, 'Desarrollo de aplicaciones web frontend', 1),
    ('ISC202', 'Desarrollo Web II', 4, 2, 2, 'Desarrollo de aplicaciones web backend', 1),
    ('ISC203', 'Sistemas Operativos', 4, 3, 1, 'Fundamentos de sistemas operativos', 1),
    ('ISC204', 'Redes de Computadoras', 4, 2, 2, 'Fundamentos de redes y protocolos', 1),
    ('ISC205', 'Seguridad Informática', 3, 2, 1, 'Seguridad en sistemas informáticos', 1),
    ('ISC301', 'Ingeniería de Software', 4, 3, 1, 'Metodologías de desarrollo de software', 1),
    ('ISC302', 'Arquitectura de Software', 4, 3, 1, 'Diseño de arquitecturas de software', 1),
    ('ISC303', 'Inteligencia Artificial', 4, 3, 1, 'Fundamentos de inteligencia artificial', 1),
    ('ISC304', 'Desarrollo Móvil', 4, 2, 2, 'Desarrollo de aplicaciones móviles', 1),
    ('ISC305', 'Proyecto Integrador', 6, 1, 5, 'Proyecto final de carrera', 1),
    
    -- INGENIERÍA INDUSTRIAL (ID_CARRERA = 3)
    ('IND101', 'Fundamentos de Ingeniería Industrial', 4, 3, 1, 'Introducción a la ingeniería industrial', 1),
    ('IND102', 'Procesos Industriales', 4, 3, 1, 'Análisis y diseño de procesos industriales', 1),
    ('IND103', 'Control de Calidad', 4, 3, 1, 'Sistemas de control de calidad', 1),
    ('IND104', 'Gestión de Producción', 4, 3, 1, 'Planificación y control de la producción', 1),
    ('IND105', 'Logística Industrial', 4, 3, 1, 'Gestión logística y cadena de suministros', 1),
    ('IND201', 'Investigación de Operaciones', 4, 3, 1, 'Métodos cuantitativos para la toma de decisiones', 1),
    ('IND202', 'Ergonomía', 3, 2, 1, 'Diseño ergonómico de puestos de trabajo', 1),
    ('IND203', 'Seguridad Industrial', 3, 2, 1, 'Prevención de riesgos laborales', 1),
    ('IND204', 'Gestión Ambiental', 3, 2, 1, 'Gestión ambiental en la industria', 1),
    ('IND205', 'Automatización Industrial', 4, 2, 2, 'Sistemas de automatización industrial', 1),
    
    -- ADMINISTRACIÓN (ID_CARRERA = 4)
    ('ADM101', 'Fundamentos de Administración', 4, 3, 1, 'Principios básicos de administración', 1),
    ('ADM102', 'Administración de Recursos Humanos', 4, 3, 1, 'Gestión del capital humano', 1),
    ('ADM103', 'Mercadotecnia', 4, 3, 1, 'Fundamentos de mercadotecnia', 1),
    ('ADM104', 'Finanzas Corporativas', 4, 3, 1, 'Gestión financiera empresarial', 1),
    ('ADM105', 'Contabilidad Administrativa', 4, 3, 1, 'Contabilidad para la toma de decisiones', 1),
    ('ADM201', 'Gestión Estratégica', 4, 3, 1, 'Planificación estratégica empresarial', 1),
    ('ADM202', 'Comportamiento Organizacional', 3, 2, 1, 'Dinámicas del comportamiento en organizaciones', 1),
    ('ADM203', 'Administración de Operaciones', 4, 3, 1, 'Gestión de operaciones empresariales', 1),
    ('ADM204', 'Desarrollo Empresarial', 3, 2, 1, 'Creación y desarrollo de empresas', 1),
    ('ADM205', 'Negocios Internacionales', 3, 2, 1, 'Administración en contextos globales', 1),
    
    -- CONTABILIDAD (ID_CARRERA = 5)
    ('CONT101', 'Contabilidad Básica', 4, 3, 1, 'Fundamentos de contabilidad', 1),
    ('CONT102', 'Contabilidad Intermedia', 4, 3, 1, 'Contabilidad financiera intermedia', 1),
    ('CONT103', 'Contabilidad Avanzada', 4, 3, 1, 'Contabilidad financiera avanzada', 1),
    ('CONT104', 'Costos I', 4, 3, 1, 'Sistemas de costos', 1),
    ('CONT105', 'Costos II', 4, 3, 1, 'Costos para la toma de decisiones', 1),
    ('CONT201', 'Auditoría I', 4, 3, 1, 'Fundamentos de auditoría', 1),
    ('CONT202', 'Auditoría II', 4, 3, 1, 'Auditoría avanzada', 1),
    ('CONT203', 'Fiscal I', 4, 3, 1, 'Sistema fiscal mexicano', 1),
    ('CONT204', 'Fiscal II', 4, 3, 1, 'Fiscalidad empresarial', 1),
    ('CONT205', 'Contabilidad Gubernamental', 3, 2, 1, 'Contabilidad del sector público', 1),
    
    -- PSICOLOGÍA (ID_CARRERA = 6)
    ('PSI101', 'Introducción a la Psicología', 4, 3, 1, 'Fundamentos de la psicología', 1),
    ('PSI102', 'Psicología del Desarrollo', 4, 3, 1, 'Desarrollo humano a lo largo del ciclo vital', 1),
    ('PSI103', 'Psicología Social', 4, 3, 1, 'Comportamiento social y grupal', 1),
    ('PSI104', 'Psicología Cognitiva', 4, 3, 1, 'Procesos cognitivos y mentales', 1),
    ('PSI105', 'Psicología Experimental', 4, 2, 2, 'Metodología experimental en psicología', 1),
    ('PSI201', 'Psicología Clínica', 4, 3, 1, 'Fundamentos de psicología clínica', 1),
    ('PSI202', 'Psicología Educativa', 4, 3, 1, 'Psicología aplicada a la educación', 1),
    ('PSI203', 'Psicología Organizacional', 4, 3, 1, 'Psicología aplicada a las organizaciones', 1),
    ('PSI204', 'Evaluación Psicológica', 4, 2, 2, 'Técnicas de evaluación psicológica', 1),
    ('PSI205', 'Intervención Psicológica', 4, 2, 2, 'Técnicas de intervención terapéutica', 1),
    
    -- MEDICINA (ID_CARRERA = 7)
    ('MED101', 'Anatomía Humana', 6, 4, 2, 'Estructura del cuerpo humano', 1),
    ('MED102', 'Fisiología Humana', 6, 4, 2, 'Funcionamiento del cuerpo humano', 1),
    ('MED103', 'Bioquímica Médica', 4, 3, 1, 'Bioquímica aplicada a la medicina', 1),
    ('MED104', 'Histología', 4, 2, 2, 'Estructura microscópica de tejidos', 1),
    ('MED105', 'Embriología', 3, 2, 1, 'Desarrollo embrionario humano', 1),
    ('MED201', 'Patología General', 4, 3, 1, 'Fundamentos de patología', 1),
    ('MED202', 'Farmacología', 4, 3, 1, 'Fundamentos de farmacología', 1),
    ('MED203', 'Microbiología', 4, 2, 2, 'Microorganismos y enfermedades', 1),
    ('MED204', 'Parasitología', 3, 2, 1, 'Parásitos humanos', 1),
    ('MED205', 'Inmunología', 3, 2, 1, 'Sistema inmunológico', 1),
    
    -- DERECHO (ID_CARRERA = 8)
    ('DER101', 'Introducción al Derecho', 4, 3, 1, 'Fundamentos del derecho', 1),
    ('DER102', 'Derecho Civil I', 4, 3, 1, 'Personas y familia', 1),
    ('DER103', 'Derecho Civil II', 4, 3, 1, 'Bienes y sucesiones', 1),
    ('DER104', 'Derecho Penal I', 4, 3, 1, 'Teoría del delito', 1),
    ('DER105', 'Derecho Penal II', 4, 3, 1, 'Delitos específicos', 1),
    ('DER201', 'Derecho Constitucional', 4, 3, 1, 'Derecho constitucional mexicano', 1),
    ('DER202', 'Derecho Administrativo', 4, 3, 1, 'Derecho administrativo', 1),
    ('DER203', 'Derecho Mercantil', 4, 3, 1, 'Derecho comercial', 1),
    ('DER204', 'Derecho Procesal', 4, 3, 1, 'Procedimientos legales', 1),
    ('DER205', 'Derecho Internacional', 3, 2, 1, 'Derecho internacional público', 1)
    
    PRINT 'Materias insertadas exitosamente'
    
    -- Mostrar resumen por carrera
    SELECT 
        'Materias básicas comunes' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'MAT%' OR clave_materia LIKE 'EST%' OR clave_materia LIKE 'ING%' 
       OR clave_materia LIKE 'FIL%' OR clave_materia LIKE 'HIS%' OR clave_materia LIKE 'COM%'
       OR clave_materia LIKE 'FIS%' OR clave_materia LIKE 'QUI%'
    
    UNION ALL
    
    SELECT 
        'Ingeniería en Sistemas' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'ISC%'
    
    UNION ALL
    
    SELECT 
        'Ingeniería Industrial' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'IND%'
    
    UNION ALL
    
    SELECT 
        'Administración' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'ADM%'
    
    UNION ALL
    
    SELECT 
        'Contabilidad' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'CONT%'
    
    UNION ALL
    
    SELECT 
        'Psicología' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'PSI%'
    
    UNION ALL
    
    SELECT 
        'Medicina' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'MED%'
    
    UNION ALL
    
    SELECT 
        'Derecho' as carrera,
        COUNT(*) as total_materias
    FROM materias 
    WHERE clave_materia LIKE 'DER%'
END
GO

-- Mostrar todas las materias organizadas por carrera
SELECT 
    CASE 
        WHEN clave_materia LIKE 'MAT%' OR clave_materia LIKE 'EST%' OR clave_materia LIKE 'ING%' 
          OR clave_materia LIKE 'FIL%' OR clave_materia LIKE 'HIS%' OR clave_materia LIKE 'COM%'
          OR clave_materia LIKE 'FIS%' OR clave_materia LIKE 'QUI%' THEN 'Materias Básicas'
        WHEN clave_materia LIKE 'ISC%' THEN 'Ingeniería en Sistemas'
        WHEN clave_materia LIKE 'IND%' THEN 'Ingeniería Industrial'
        WHEN clave_materia LIKE 'ADM%' THEN 'Administración'
        WHEN clave_materia LIKE 'CONT%' THEN 'Contabilidad'
        WHEN clave_materia LIKE 'PSI%' THEN 'Psicología'
        WHEN clave_materia LIKE 'MED%' THEN 'Medicina'
        WHEN clave_materia LIKE 'DER%' THEN 'Derecho'
        ELSE 'Otras'
    END as carrera,
    clave_materia,
    nombre_materia,
    creditos,
    horas_teoria,
    horas_practica
FROM materias 
ORDER BY carrera, clave_materia
GO
