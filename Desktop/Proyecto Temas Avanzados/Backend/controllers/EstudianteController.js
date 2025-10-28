const BaseController = require('./BaseController');
const Estudiante = require('../models/Estudiante');
const { mssql } = require('../config/connection');

class EstudianteController extends BaseController {
    constructor() {
        super(new Estudiante());
    }

    // Obtener todos los estudiantes con información de carrera
    async getAllWithCarreras(req, res) {
        try {
            const { page = 1, limit = 100, orderBy, orderDirection = 'ASC', ...filters } = req.query;
            
            const options = {
                page: parseInt(page),
                limit: parseInt(limit),
                orderBy,
                orderDirection,
                where: filters
            };

            const result = await this.model.findAllWithCarreras(options);
            
            res.json({
                success: true,
                data: result.data,
                pagination: result.pagination
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes con carreras',
                error: error.message
            });
        }
    }

    // Obtener estudiantes activos
    async getActive(req, res) {
        try {
            const estudiantes = await this.model.findActive();
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes activos',
                error: error.message
            });
        }
    }

    // Buscar estudiante por número de control
    async getByNumControl(req, res) {
        try {
            const { numControl } = req.params;
            const estudiante = await this.model.findByNumControl(numControl);
            
            if (!estudiante) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            res.json({
                success: true,
                data: estudiante
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al buscar estudiante por número de control',
                error: error.message
            });
        }
    }

    // Obtener estudiantes por carrera
    async getByCarrera(req, res) {
        try {
            const { idCarrera } = req.params;
            const estudiantes = await this.model.findByCarrera(idCarrera);
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes por carrera',
                error: error.message
            });
        }
    }

    // Obtener estudiantes por semestre
    async getBySemestre(req, res) {
        try {
            const { semestre } = req.params;
            const estudiantes = await this.model.findBySemestre(semestre);
            
            res.json({
                success: true,
                data: estudiantes
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estudiantes por semestre',
                error: error.message
            });
        }
    }

    // Obtener calificaciones de un estudiante
    async getCalificaciones(req, res) {
        try {
            const { id } = req.params;
            const calificaciones = await this.model.getCalificaciones(id);
            
            res.json({
                success: true,
                data: calificaciones
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener calificaciones del estudiante',
                error: error.message
            });
        }
    }

    // Obtener factores de riesgo de un estudiante
    async getFactores(req, res) {
        try {
            const { id } = req.params;
            const factores = await this.model.getFactores(id);
            
            res.json({
                success: true,
                data: factores
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener factores del estudiante',
                error: error.message
            });
        }
    }

    // Calcular promedio general del estudiante
    async calcularPromedio(req, res) {
        try {
            const { id } = req.params;
            const promedio = await this.model.calcularPromedio(id);
            
            res.json({
                success: true,
                message: 'Promedio calculado exitosamente',
                data: { promedio }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al calcular promedio del estudiante',
                error: error.message
            });
        }
    }

    // Obtener estadísticas de estudiantes
    async getStats(req, res) {
        try {
            const stats = await this.model.getStats();
            
            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener estadísticas de estudiantes',
                error: error.message
            });
        }
    }

    // Crear estudiante con validaciones específicas
    async create(req, res) {
        try {
            const { num_control, email, id_carrera, semestre_actual } = req.body;

            // Validar que el número de control no exista
            const existingEstudiante = await this.model.findByNumControl(num_control);
            if (existingEstudiante) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un estudiante con este número de control'
                });
            }

            // Validar semestre
            if (semestre_actual < 1 || semestre_actual > 12) {
                return res.status(400).json({
                    success: false,
                    message: 'El semestre debe estar entre 1 y 12'
                });
            }

            const newEstudiante = await this.model.create(req.body);
            
            res.status(201).json({
                success: true,
                message: 'Estudiante creado exitosamente',
                data: newEstudiante
            });
        } catch (error) {
            this.handleDatabaseError(error, res);
        }
    }

    // Endpoint para inicializar materias básicas
    async initializeMaterias(req, res) {
        try {
            console.log('=== INICIO initializeMaterias ===');
            
            const pool = await this.model.getPool();
            
            // Verificar si ya existen materias
            const checkRequest = pool.request();
            const checkResult = await checkRequest.query('SELECT COUNT(*) as count FROM materias');
            const existingCount = checkResult.recordset[0].count;
            
            if (existingCount > 0) {
                console.log(`Ya existen ${existingCount} materias en la base de datos`);
                return res.json({ 
                    success: true, 
                    message: `Ya existen ${existingCount} materias en la base de datos`,
                    count: existingCount
                });
            }
            
            // Crear materias básicas
            const materias = [
                { clave: 'MAT001', nombre: 'Matemáticas Básicas', creditos: 4, horas_teoria: 3, horas_practica: 1 },
                { clave: 'PROG001', nombre: 'Programación I', creditos: 5, horas_teoria: 3, horas_practica: 2 },
                { clave: 'BD001', nombre: 'Bases de Datos', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                { clave: 'WEB001', nombre: 'Desarrollo Web', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                { clave: 'SIS001', nombre: 'Sistemas Operativos', creditos: 3, horas_teoria: 2, horas_practica: 1 }
            ];
            
            for (const materia of materias) {
                const insertRequest = pool.request();
                insertRequest.input('clave_materia', mssql.VarChar(20), materia.clave);
                insertRequest.input('nombre_materia', mssql.VarChar(100), materia.nombre);
                insertRequest.input('creditos', mssql.Int, materia.creditos);
                insertRequest.input('horas_teoria', mssql.Int, materia.horas_teoria);
                insertRequest.input('horas_practica', mssql.Int, materia.horas_practica);
                insertRequest.input('descripcion', mssql.Text, `Descripción de ${materia.nombre}`);
                insertRequest.input('activo', mssql.Bit, 1);
                
                await insertRequest.query(`
                    INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoria, horas_practica, descripcion, activo)
                    VALUES (@clave_materia, @nombre_materia, @creditos, @horas_teoria, @horas_practica, @descripcion, @activo)
                `);
                
                console.log(`Materia creada: ${materia.nombre}`);
            }
            
            console.log('=== FIN initializeMaterias EXITOSO ===');
            res.json({ 
                success: true, 
                message: `${materias.length} materias creadas exitosamente`,
                materias: materias.length
            });
            
        } catch (error) {
            console.error('=== ERROR en initializeMaterias ===');
            console.error('Error completo:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al inicializar materias',
                error: error.message 
            });
        }
    }

    // Endpoint temporal para inicializar carreras
    async initializeCarreras(req, res) {
        try {
            console.log('=== INICIO initializeCarreras ===');
            
            // Eliminar carreras existentes
            await this.model.customQuery('DELETE FROM carreras WHERE id_carrera IN (2,3,4,5,6,7,8)');
            console.log('Carreras existentes eliminadas');
            
            // Insertar todas las carreras necesarias
            const carrerasData = [
                { id: 2, nombre: 'Ingeniería en Sistemas', clave: 'IS', descripcion: 'Ingeniería en Sistemas Computacionales', duracion: 9 },
                { id: 3, nombre: 'Ingeniería Industrial', clave: 'II', descripcion: 'Ingeniería Industrial', duracion: 9 },
                { id: 4, nombre: 'Administración', clave: 'ADM', descripcion: 'Licenciatura en Administración', duracion: 8 },
                { id: 5, nombre: 'Contabilidad', clave: 'CONT', descripcion: 'Licenciatura en Contabilidad', duracion: 8 },
                { id: 6, nombre: 'Psicología', clave: 'PSI', descripcion: 'Licenciatura en Psicología', duracion: 8 },
                { id: 7, nombre: 'Medicina', clave: 'MED', descripcion: 'Licenciatura en Medicina', duracion: 12 },
                { id: 8, nombre: 'Derecho', clave: 'DER', descripcion: 'Licenciatura en Derecho', duracion: 8 }
            ];

            for (const carrera of carrerasData) {
                await this.model.customQuery(`
                    INSERT INTO carreras (id_carrera, nombre_carrera, clave_carrera, descripcion, duracion_semestres, fecha_creacion, activo)
                    VALUES (${carrera.id}, '${carrera.nombre}', '${carrera.clave}', '${carrera.descripcion}', ${carrera.duracion}, GETDATE(), 1)
                `);
            }
            
            console.log('Todas las carreras creadas exitosamente');
            
            // Verificar que se crearon
            const carreras = await this.model.customQuery('SELECT * FROM carreras ORDER BY id_carrera');
            console.log('Carreras creadas:', carreras);
            
            res.status(200).json({
                success: true,
                message: 'Carreras inicializadas exitosamente',
                data: carreras
            });
        } catch (error) {
            console.error('Error al inicializar carreras:', error);
            res.status(500).json({
                success: false,
                message: 'Error al inicializar carreras',
                error: error.message
            });
        }
    }
    async createSimple(req, res) {
        try {
            console.log('=== INICIO createSimple ===');
            console.log('Body recibido:', req.body);
            
            const { num_control, email, id_carrera, semestre_actual } = req.body;

            // Primero verificar qué carreras existen
            console.log('Verificando carreras disponibles...');
            const carreras = await this.model.customQuery('SELECT * FROM carreras');
            console.log('Carreras disponibles:', carreras);

            // Si no hay carreras, crear una por defecto
            if (!carreras || carreras.length === 0) {
                console.log('No hay carreras, creando carrera por defecto...');
                await this.model.customQuery(`
                    INSERT INTO carreras (nombre_carrera, clave_carrera, descripcion, duracion_semestres, fecha_creacion, activo)
                    VALUES ('TADS', 'TADS', 'Tecnologías de la Información y Comunicación', 9, GETDATE(), 1)
                `);
                console.log('Carrera por defecto creada');
            }

            // Validar que el número de control no exista
                const existingEstudiante = await this.model.findByNumControl(num_control);
            if (existingEstudiante) {
                console.log('Estudiante ya existe con num_control:', num_control);
                    return res.status(409).json({
                        success: false,
                        message: 'Ya existe un estudiante con este número de control'
                    });
                }

            // Validar semestre
            if (semestre_actual < 1 || semestre_actual > 12) {
                console.log('Semestre inválido:', semestre_actual);
                return res.status(400).json({
                    success: false,
                    message: 'El semestre debe estar entre 1 y 12'
                });
            }

            console.log('Creando estudiante simple...');
            const newEstudiante = await this.model.createEstudiante(req.body);
            console.log('Estudiante creado:', newEstudiante);

            console.log('=== FIN createSimple EXITOSO ===');
            res.status(201).json({
                success: true,
                message: 'Estudiante creado exitosamente',
                data: newEstudiante
            });
        } catch (error) {
            console.error('=== ERROR en createSimple ===');
            console.error('Error completo:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            this.handleDatabaseError(error, res);
        }
    }
    async createComplete(req, res) {
        try {
            console.log('=== INICIO createComplete ===');
            console.log('Body recibido:', req.body);
            
            const { 
                num_control, 
                email, 
                id_carrera, 
                semestre_actual,
                factores_seleccionados = [],
                calificaciones = [],
                grupos = []
            } = req.body;

            console.log('Factores seleccionados:', factores_seleccionados);
            console.log('Calificaciones:', calificaciones);
            console.log('Grupos:', grupos);

            // Obtener id_docente del usuario logueado
            const id_docente = req.user?.id_docente || req.headers['x-user-id'] || 1; // Fallback a 1 si no se encuentra
            console.log('ID del docente logueado:', id_docente);

            // Verificar que existan carreras
            console.log('Verificando carreras disponibles...');
            const carreras = await this.model.customQuery('SELECT * FROM carreras');
            console.log('Carreras disponibles:', carreras);

            // Si no hay carreras, crear una por defecto
            if (!carreras || carreras.length === 0) {
                console.log('No hay carreras, creando carrera por defecto...');
                await this.model.customQuery(`
                    INSERT INTO carreras (nombre_carrera, clave_carrera, descripcion, duracion_semestres, fecha_creacion, activo)
                    VALUES ('TADS', 'TADS', 'Tecnologías de la Información y Comunicación', 9, GETDATE(), 1)
                `);
                console.log('Carrera por defecto creada');
            }

            // Validar que el número de control no exista
            const existingEstudiante = await this.model.findByNumControl(num_control);
            if (existingEstudiante) {
                console.log('Estudiante ya existe con num_control:', num_control);
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un estudiante con este número de control'
                });
            }

            // Validar semestre
            if (semestre_actual < 1 || semestre_actual > 12) {
                console.log('Semestre inválido:', semestre_actual);
                return res.status(400).json({
                    success: false,
                    message: 'El semestre debe estar entre 1 y 12'
                });
            }

            console.log('Creando estudiante...');
            // Crear el estudiante
            const newEstudiante = await this.model.createEstudiante(req.body);
            console.log('Estudiante creado:', newEstudiante);
            
            // Crear factores de riesgo si se proporcionaron
            if (factores_seleccionados && factores_seleccionados.length > 0) {
                console.log('Creando factores...');
                await this.createFactores(newEstudiante.id_estudiante, factores_seleccionados, req.body.observaciones);
                console.log('Factores creados exitosamente');
            }

            // Crear grupos si se proporcionaron
            if (grupos && grupos.length > 0) {
                console.log('Creando grupos...');
                await this.createGrupos(newEstudiante.id_estudiante, id_docente, grupos, req);
                console.log('Grupos creados exitosamente');
            }

            // Crear calificaciones si se proporcionaron
            if (calificaciones && calificaciones.length > 0) {
                console.log('Procesando calificaciones...');
                await this.createCalificaciones(newEstudiante.id_estudiante, calificaciones, req);
                console.log('Calificaciones procesadas');
            }

            console.log('=== FIN createComplete EXITOSO ===');
            res.status(201).json({
                success: true,
                message: 'Estudiante creado exitosamente con todos sus datos',
                data: newEstudiante
            });
        } catch (error) {
            console.error('=== ERROR en createComplete ===');
            console.error('Error completo:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            this.handleDatabaseError(error, res);
        }
    }

    // Crear factores de riesgo para un estudiante
    async createFactores(idEstudiante, factores, observaciones = 'Sin observaciones') {
        try {
            console.log('=== INICIO createFactores ===');
            console.log('ID Estudiante:', idEstudiante);
            console.log('Factores a crear:', factores);
            console.log('Observaciones:', observaciones);
            
            const Factor = require('../models/Factor');
            const factorModel = new Factor();
            
            for (const factorNombre of factores) {
                console.log('Creando factor:', factorNombre);
                const factorData = {
                    id_estudiante: idEstudiante,
                    nombre_factor: factorNombre,
                    descripcion: `Factor de riesgo: ${factorNombre}`,
                    fecha_asignacion: new Date(),
                    activo: 1,
                    observaciones: observaciones || 'Sin observaciones'
                };
                console.log('Datos del factor:', factorData);
                
                const factorCreado = await factorModel.create(factorData);
                console.log('Factor creado:', factorCreado);
            }
            
            console.log('=== FIN createFactores EXITOSO ===');
        } catch (error) {
            console.error('=== ERROR en createFactores ===');
            console.error('Error completo:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            throw error;
        }
    }

    // Crear calificaciones para un estudiante
    async createCalificaciones(idEstudiante, calificaciones, req = null) {
        try {
            console.log('=== INICIO createCalificaciones ===');
            console.log('ID Estudiante:', idEstudiante);
            console.log('Calificaciones a crear:', calificaciones);
            
            if (!calificaciones || calificaciones.length === 0) {
                console.log('No hay calificaciones para crear');
                return;
            }
            
            const pool = await this.model.getPool();
            
            // Obtener grupos del estudiante para asociar calificaciones
            const gruposRequest = pool.request();
            gruposRequest.input('id_estudiante', mssql.Int, idEstudiante);
            const gruposResult = await gruposRequest.query(`
                SELECT id_grupo FROM grupos WHERE id_estudiante = @id_estudiante
            `);
            
            if (gruposResult.recordset.length === 0) {
                console.log('No hay grupos para el estudiante, no se pueden crear calificaciones');
                return;
            }
            
            // Usar el primer grupo disponible para las calificaciones
            const grupoId = gruposResult.recordset[0].id_grupo;
            console.log('Usando grupo ID:', grupoId);
            
        // Obtener id_docente del usuario logueado desde el token
        const id_docente = req.user?.id_docente || 1; // Usar el ID del docente del token o 1 por defecto
            
            // Crear calificaciones para cada unidad (1-3)
            for (let i = 0; i < Math.min(calificaciones.length, 3); i++) {
                const calificacion = calificaciones[i];
                if (calificacion && calificacion.grade) {
                    console.log(`Creando calificación para unidad ${i + 1}:`, calificacion.grade);
                    
                    const insertRequest = pool.request();
                    insertRequest.input('id_grupo', mssql.Int, grupoId);
                    insertRequest.input('id_docente_registro', mssql.Int, id_docente);
                    insertRequest.input('num_unidad', mssql.Int, i + 1);
                    insertRequest.input('calificacion', mssql.Decimal(4, 2), parseFloat(calificacion.grade));
                    insertRequest.input('asistencia', mssql.Decimal(5, 2), 95.0); // Asistencia por defecto
                    insertRequest.input('fecha_evaluacion', mssql.Date, new Date());
                    insertRequest.input('comentarios', mssql.Text, `Calificación de ${calificacion.name || 'Materia'}`);
                    
                    await insertRequest.query(`
                        INSERT INTO calificaciones_parciales (id_grupo, id_docente_registro, num_unidad, calificacion, asistencia, fecha_evaluacion, comentarios)
                        VALUES (@id_grupo, @id_docente_registro, @num_unidad, @calificacion, @asistencia, @fecha_evaluacion, @comentarios)
                    `);
                    
                    console.log(`Calificación creada para unidad ${i + 1}`);
                }
            }
            
            console.log('=== FIN createCalificaciones EXITOSO ===');
        } catch (error) {
            console.error('=== ERROR en createCalificaciones ===');
            console.error('Error completo:', error);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            // No lanzar el error para evitar que falle toda la creación del estudiante
            console.log('Continuando sin crear calificaciones debido al error');
        }
    }

    // Inicializar todas las tablas necesarias
    async initializeAllTables(req, res) {
        try {
            console.log('=== INICIO initializeAllTables ===');
            
            const pool = await this.model.getPool();
            const results = {
                materias: 0,
                grupos: 0,
                calificaciones: 0
            };
            
            // 1. Inicializar materias
            console.log('Inicializando materias...');
            const checkMateriasRequest = pool.request();
            const materiasResult = await checkMateriasRequest.query('SELECT COUNT(*) as count FROM materias');
            const materiasCount = materiasResult.recordset[0].count;
            
            if (materiasCount === 0) {
                const materias = [
                    { clave: 'MAT001', nombre: 'Matemáticas Básicas', creditos: 4, horas_teoria: 3, horas_practica: 1 },
                    { clave: 'PROG001', nombre: 'Programación I', creditos: 5, horas_teoria: 3, horas_practica: 2 },
                    { clave: 'BD001', nombre: 'Bases de Datos', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                    { clave: 'WEB001', nombre: 'Desarrollo Web', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                    { clave: 'SIS001', nombre: 'Sistemas Operativos', creditos: 3, horas_teoria: 2, horas_practica: 1 },
                    { clave: 'RED001', nombre: 'Redes de Computadoras', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                    { clave: 'SEG001', nombre: 'Seguridad Informática', creditos: 3, horas_teoria: 2, horas_practica: 1 }
                ];
                
                for (const materia of materias) {
                    const insertRequest = pool.request();
                    insertRequest.input('clave_materia', mssql.VarChar(20), materia.clave);
                    insertRequest.input('nombre_materia', mssql.VarChar(100), materia.nombre);
                    insertRequest.input('creditos', mssql.Int, materia.creditos);
                    insertRequest.input('horas_teoria', mssql.Int, materia.horas_teoria);
                    insertRequest.input('horas_practica', mssql.Int, materia.horas_practica);
                    insertRequest.input('descripcion', mssql.Text, `Descripción de ${materia.nombre}`);
                    insertRequest.input('activo', mssql.Bit, 1);
                    
                    await insertRequest.query(`
                        INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoria, horas_practica, descripcion, activo)
                        VALUES (@clave_materia, @nombre_materia, @creditos, @horas_teoria, @horas_practica, @descripcion, @activo)
                    `);
                    
                    console.log(`Materia creada: ${materia.nombre}`);
                }
                results.materias = materias.length;
            } else {
                results.materias = materiasCount;
                console.log(`Ya existen ${materiasCount} materias`);
            }
            
            // 2. Verificar si hay estudiantes para crear grupos
            console.log('Verificando estudiantes para crear grupos...');
            const checkEstudiantesRequest = pool.request();
            const estudiantesResult = await checkEstudiantesRequest.query('SELECT COUNT(*) as count FROM estudiantes');
            const estudiantesCount = estudiantesResult.recordset[0].count;
            
            if (estudiantesCount > 0) {
                // Obtener estudiantes existentes
                const getEstudiantesRequest = pool.request();
                const estudiantes = await getEstudiantesRequest.query('SELECT id_estudiante, nombre, apellido_paterno FROM estudiantes');
                
                // Obtener primera materia disponible
                const getMateriaRequest = pool.request();
                const materiaResult = await getMateriaRequest.query('SELECT TOP 1 id_materia FROM materias WHERE activo = 1');
                
                if (materiaResult.recordset.length > 0) {
                    const materiaId = materiaResult.recordset[0].id_materia;
                    const idDocente = 1; // Docente por defecto
                    
                    // Crear grupos para cada estudiante
                    for (const estudiante of estudiantes.recordset) {
                        const insertGrupoRequest = pool.request();
                        insertGrupoRequest.input('id_estudiante', mssql.Int, estudiante.id_estudiante);
                        insertGrupoRequest.input('id_docente', mssql.Int, idDocente);
                        insertGrupoRequest.input('id_materia', mssql.Int, materiaId);
                        insertGrupoRequest.input('clave_grupo', mssql.VarChar(20), `GRP${String(estudiante.id_estudiante).padStart(3, '0')}`);
                        insertGrupoRequest.input('semestre', mssql.VarChar(20), '1');
                        insertGrupoRequest.input('anio', mssql.Int, new Date().getFullYear());
                        insertGrupoRequest.input('periodo', mssql.VarChar(10), '1');
                        insertGrupoRequest.input('horario', mssql.VarChar(100), 'Lunes a Viernes 8:00-10:00');
                        insertGrupoRequest.input('aula', mssql.VarChar(20), 'A-101');
                        
                        await insertGrupoRequest.query(`
                            INSERT INTO grupos (id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula, fecha_registro)
                            VALUES (@id_estudiante, @id_docente, @id_materia, @clave_grupo, @semestre, @anio, @periodo, @horario, @aula, GETDATE())
                        `);
                        
                        console.log(`Grupo creado para estudiante: ${estudiante.nombre} ${estudiante.apellido_paterno}`);
                        results.grupos++;
                    }
                }
            } else {
                console.log('No hay estudiantes para crear grupos');
            }
            
            // 3. Verificar si hay grupos para crear calificaciones
            console.log('Verificando grupos para crear calificaciones...');
            const checkGruposRequest = pool.request();
            const gruposResult = await checkGruposRequest.query('SELECT COUNT(*) as count FROM grupos');
            const gruposCount = gruposResult.recordset[0].count;
            
            if (gruposCount > 0) {
                // Obtener grupos existentes
                const getGruposRequest = pool.request();
                const grupos = await getGruposRequest.query('SELECT id_grupo, id_estudiante FROM grupos');
                
                // Crear calificaciones para cada grupo
                for (const grupo of grupos.recordset) {
                    // Crear 3 unidades de calificaciones por grupo
                    for (let unidad = 1; unidad <= 3; unidad++) {
                        const insertCalificacionRequest = pool.request();
                        insertCalificacionRequest.input('id_grupo', mssql.Int, grupo.id_grupo);
                        insertCalificacionRequest.input('id_docente_registro', mssql.Int, 1);
                        insertCalificacionRequest.input('num_unidad', mssql.Int, unidad);
                        insertCalificacionRequest.input('calificacion', mssql.Decimal(5, 2), 85.0 + (unidad * 2)); // Calificaciones de ejemplo
                        insertCalificacionRequest.input('asistencia', mssql.Decimal(5, 2), 95.0);
                        insertCalificacionRequest.input('fecha_registro', mssql.DateTime, new Date());
                        
                        await insertCalificacionRequest.query(`
                            INSERT INTO calificaciones_parciales (id_grupo, id_docente_registro, num_unidad, calificacion, asistencia, fecha_registro)
                            VALUES (@id_grupo, @id_docente_registro, @num_unidad, @calificacion, @asistencia, @fecha_registro)
                        `);
                        
                        console.log(`Calificación creada para grupo ${grupo.id_grupo}, unidad ${unidad}`);
                        results.calificaciones++;
                    }
                }
            } else {
                console.log('No hay grupos para crear calificaciones');
            }
            
            console.log('=== FIN initializeAllTables EXITOSO ===');
            res.json({ 
                success: true, 
                message: 'Todas las tablas inicializadas exitosamente',
                results: results
            });
            
        } catch (error) {
            console.error('=== ERROR en initializeAllTables ===');
            console.error('Error completo:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al inicializar tablas',
                error: error.message 
            });
        }
    }
    async initializeMaterias(req, res) {
        try {
            console.log('=== INICIO initializeMaterias ===');
            
            const pool = await this.model.getPool();
            
            // Verificar si ya existen materias
            const checkRequest = pool.request();
            const checkResult = await checkRequest.query('SELECT COUNT(*) as count FROM materias');
            const existingCount = checkResult.recordset[0].count;
            
            if (existingCount > 0) {
                console.log(`Ya existen ${existingCount} materias en la base de datos`);
                return res.json({ 
                    success: true, 
                    message: `Ya existen ${existingCount} materias en la base de datos`,
                    count: existingCount
                });
            }
            
            // Crear materias básicas
            const materias = [
                { clave: 'MAT001', nombre: 'Matemáticas Básicas', creditos: 4, horas_teoria: 3, horas_practica: 1 },
                { clave: 'PROG001', nombre: 'Programación I', creditos: 5, horas_teoria: 3, horas_practica: 2 },
                { clave: 'BD001', nombre: 'Bases de Datos', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                { clave: 'WEB001', nombre: 'Desarrollo Web', creditos: 4, horas_teoria: 2, horas_practica: 2 },
                { clave: 'SIS001', nombre: 'Sistemas Operativos', creditos: 3, horas_teoria: 2, horas_practica: 1 }
            ];
            
            for (const materia of materias) {
                const insertRequest = pool.request();
                insertRequest.input('clave_materia', mssql.VarChar(20), materia.clave);
                insertRequest.input('nombre_materia', mssql.VarChar(100), materia.nombre);
                insertRequest.input('creditos', mssql.Int, materia.creditos);
                insertRequest.input('horas_teoria', mssql.Int, materia.horas_teoria);
                insertRequest.input('horas_practica', mssql.Int, materia.horas_practica);
                insertRequest.input('descripcion', mssql.Text, `Descripción de ${materia.nombre}`);
                insertRequest.input('activo', mssql.Bit, 1);
                
                await insertRequest.query(`
                    INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoria, horas_practica, descripcion, activo)
                    VALUES (@clave_materia, @nombre_materia, @creditos, @horas_teoria, @horas_practica, @descripcion, @activo)
                `);
                
                console.log(`Materia creada: ${materia.nombre}`);
            }
            
            console.log('=== FIN initializeMaterias EXITOSO ===');
            res.json({ 
                success: true, 
                message: `${materias.length} materias creadas exitosamente`,
                materias: materias.length
            });
            
        } catch (error) {
            console.error('=== ERROR en initializeMaterias ===');
            console.error('Error completo:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al inicializar materias',
                error: error.message 
            });
        }
    }
    async createGrupos(estudianteId, idDocente, grupos, req = null) {
        try {
            console.log('=== INICIO createGrupos ===');
            console.log('ID Estudiante:', estudianteId);
            console.log('ID Docente recibido:', idDocente);
            
            // Obtener id_docente del usuario logueado desde el token si está disponible
            const docenteId = req?.user?.id_docente || idDocente;
            console.log('ID Docente final a usar:', docenteId);
            console.log('Grupos a crear:', grupos);
            
            // Si no hay grupos, crear uno por defecto
            if (!grupos || grupos.length === 0) {
                console.log('No hay grupos, creando grupo por defecto');
                grupos = [{
                    clave_grupo: `GRP${String(estudianteId).padStart(3, '0')}`,
                    semestre: '1',
                    anio: new Date().getFullYear(),
                    periodo: '1',
                    horario: 'Lunes a Viernes 8:00-10:00',
                    aula: 'A-101'
                }];
            }
            
            const pool = await this.model.getPool();
            
            for (const grupo of grupos) {
                console.log('Creando grupo:', grupo);
                
                // Verificar si existe alguna materia, si no, crear una por defecto
                let materiaId = grupo.id_materia;
                
                if (!materiaId) {
                    // Verificar si hay materias existentes
                    const checkMateriasRequest = pool.request();
                    const materiasResult = await checkMateriasRequest.query('SELECT TOP 1 id_materia FROM materias WHERE activo = 1');
                    
                    if (materiasResult.recordset.length > 0) {
                        materiaId = materiasResult.recordset[0].id_materia;
                        console.log('Usando materia existente con ID:', materiaId);
                    } else {
                        // Crear una materia genérica para este grupo
                        const materiaNombre = grupo.nombre_materia || grupo.clave_grupo || 'Materia General';
                        const materiaClave = grupo.clave_materia || `MAT${String(estudianteId).padStart(3, '0')}`;
                        
                        console.log('Creando materia:', materiaNombre);
                        
                        const createMateriaRequest = pool.request();
                        createMateriaRequest.input('clave_materia', mssql.VarChar(20), materiaClave);
                        createMateriaRequest.input('nombre_materia', mssql.VarChar(100), materiaNombre);
                        createMateriaRequest.input('creditos', mssql.Int, grupo.creditos || 4);
                        createMateriaRequest.input('horas_teoria', mssql.Int, grupo.horas_teoria || 2);
                        createMateriaRequest.input('horas_practica', mssql.Int, grupo.horas_practica || 2);
                        createMateriaRequest.input('descripcion', mssql.Text, `Materia creada para el estudiante ${estudianteId}`);
                        createMateriaRequest.input('activo', mssql.Bit, 1);
                        
                        const materiaResult = await createMateriaRequest.query(`
                            INSERT INTO materias (clave_materia, nombre_materia, creditos, horas_teoria, horas_practica, descripcion, activo)
                            OUTPUT INSERTED.id_materia
                            VALUES (@clave_materia, @nombre_materia, @creditos, @horas_teoria, @horas_practica, @descripcion, @activo)
                        `);
                        
                        materiaId = materiaResult.recordset[0].id_materia;
                        console.log('Materia creada con ID:', materiaId);
                    }
                }
                
                // Crear el grupo
                const request = pool.request();
                request.input('id_estudiante', mssql.Int, estudianteId);
                request.input('id_docente', mssql.Int, docenteId);
                request.input('id_materia', mssql.Int, materiaId);
                request.input('clave_grupo', mssql.VarChar(20), grupo.clave_grupo || 'GRP001');
                request.input('semestre', mssql.VarChar(20), grupo.semestre || '1');
                request.input('anio', mssql.Int, grupo.anio || new Date().getFullYear());
                request.input('periodo', mssql.VarChar(10), grupo.periodo || '1');
                request.input('horario', mssql.VarChar(100), grupo.horario || 'Lunes a Viernes 8:00-10:00');
                request.input('aula', mssql.VarChar(20), grupo.aula || 'A-101');
                
                console.log('Ejecutando query:', `
                    INSERT INTO grupos (id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula, fecha_registro)
                    VALUES (@id_estudiante, @id_docente, @id_materia, @clave_grupo, @semestre, @anio, @periodo, @horario, @aula, GETDATE())
                `);
                
                await request.query(`
                    INSERT INTO grupos (id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula, fecha_registro)
                    VALUES (@id_estudiante, @id_docente, @id_materia, @clave_grupo, @semestre, @anio, @periodo, @horario, @aula, GETDATE())
                `);
                
                console.log('Grupo creado exitosamente');
            }
            
            console.log('=== FIN createGrupos EXITOSO ===');
        } catch (error) {
            console.error('=== ERROR en createGrupos ===');
            console.error('Error completo:', error);
            // No lanzar el error, solo loggearlo para evitar que falle toda la actualización
            console.log('Continuando sin crear grupos debido al error');
        }
    }


    // Obtener estudiante completo con todos sus datos relacionados
    async getCompleteById(req, res) {
        try {
            const { id } = req.params;
            console.log('Obteniendo estudiante completo con ID:', id);
            
            const estudiante = await this.model.findById(id);
            if (!estudiante) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }
            
            // Obtener factores del estudiante
            const factores = await this.model.getFactores(id);
            console.log('Factores encontrados:', factores);
            
            // Obtener grupos del estudiante
            const grupos = await this.getGruposByEstudianteId(id);
            console.log('Grupos encontrados:', grupos);
            
            // Obtener calificaciones del estudiante
            const calificaciones = await this.getCalificacionesByEstudianteId(id);
            console.log('Calificaciones encontradas:', calificaciones);
            
            // Combinar todos los datos
            const estudianteCompleto = {
                ...estudiante,
                factores: factores || [],
                grupos: grupos || [],
                calificaciones: calificaciones || []
            };
            
            res.json({ success: true, data: estudianteCompleto });
        } catch (error) {
            console.error('Error en getCompleteById:', error);
            this.handleDatabaseError(error, res);
        }
    }
    
    // Obtener grupos de un estudiante
    async getGruposByEstudianteId(estudianteId) {
        try {
            const pool = await this.model.getPool();
            const request = pool.request();
            request.input('id_estudiante', mssql.Int, estudianteId);
            
            const result = await request.query(`
                SELECT g.*, m.nombre_materia, m.clave_materia
                FROM grupos g
                LEFT JOIN materias m ON g.id_materia = m.id_materia
                WHERE g.id_estudiante = @id_estudiante
            `);
            
            return result.recordset;
        } catch (error) {
            console.error('Error obteniendo grupos:', error);
            return [];
        }
    }
    
    // Obtener calificaciones de un estudiante
    async getCalificacionesByEstudianteId(estudianteId) {
        try {
            const pool = await this.model.getPool();
            const request = pool.request();
            request.input('id_estudiante', mssql.Int, estudianteId);
            
            const result = await request.query(`
                SELECT cp.*, g.clave_grupo, m.nombre_materia
                FROM calificaciones_parciales cp
                INNER JOIN grupos g ON cp.id_grupo = g.id_grupo
                LEFT JOIN materias m ON g.id_materia = m.id_materia
                WHERE g.id_estudiante = @id_estudiante
            `);
            
            return result.recordset;
        } catch (error) {
            console.error('Error obteniendo calificaciones:', error);
            return [];
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            console.log('Actualizando estudiante con ID:', id);
            console.log('Datos de actualización:', updateData);
            
            const estudiante = await this.model.findById(id);
            if (!estudiante) {
                return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
            }
            
            // Obtener id_docente del usuario logueado (asumiendo que viene en el token o headers)
            const id_docente = req.user?.id_docente || req.headers['x-user-id'] || 1; // Fallback a 1 si no se encuentra
            console.log('ID del docente logueado:', id_docente);
            
            // Actualizar datos del estudiante
            const updated = await this.model.update(id, updateData);
            if (!updated) {
                return res.status(500).json({ success: false, message: 'Error al actualizar el estudiante' });
            }
            
            // Si se están actualizando factores, eliminar los existentes y crear los nuevos
            if (updateData.factores_seleccionados || updateData.observaciones) {
                console.log('Actualizando factores del estudiante...');
                
                // Eliminar factores existentes
                const pool = await this.model.getPool();
                const deleteRequest = pool.request();
                deleteRequest.input('id_estudiante', mssql.Int, id);
                await deleteRequest.query('DELETE FROM factores WHERE id_estudiante = @id_estudiante');
                
                // Crear nuevos factores con observaciones
                if (updateData.factores_seleccionados && updateData.factores_seleccionados.length > 0) {
                    await this.createFactores(id, updateData.factores_seleccionados, updateData.observaciones);
                } else if (updateData.observaciones) {
                    // Si no hay factores pero sí observaciones, crear un factor genérico
                    await this.createFactores(id, ['General'], updateData.observaciones);
                }
            }
            
            // Si se están actualizando grupos, eliminar los existentes y crear los nuevos
            if (updateData.grupos) {
                console.log('Actualizando grupos del estudiante...');
                
                // Eliminar grupos existentes
                const pool = await this.model.getPool();
                const deleteGruposRequest = pool.request();
                deleteGruposRequest.input('id_estudiante', mssql.Int, id);
                await deleteGruposRequest.query('DELETE FROM grupos WHERE id_estudiante = @id_estudiante');
                
                // Crear nuevos grupos
                await this.createGrupos(id, id_docente, updateData.grupos, req);
            }
            
            res.json({ success: true, message: 'Estudiante actualizado exitosamente' });
        } catch (error) {
            console.error('Error en update:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Eliminar estudiante
    async delete(req, res) {
        try {
            const { id } = req.params;
            console.log('Intentando eliminar estudiante con ID:', id);
            
            // Verificar que el estudiante existe
            const estudiante = await this.model.findById(id);
            console.log('Estudiante encontrado:', estudiante);
            
            if (!estudiante) {
                return res.status(404).json({
                    success: false,
                    message: 'Estudiante no encontrado'
                });
            }

            // Eliminar registros relacionados primero
            console.log('Eliminando factores relacionados...');
            await this.deleteRelatedRecords(id);

            // Eliminar el estudiante
            console.log('Eliminando estudiante...');
            const deleted = await this.model.delete(id);
            console.log('Resultado de eliminación:', deleted);
            
            if (!deleted) {
                return res.status(500).json({
                    success: false,
                    message: 'Error al eliminar el estudiante'
                });
            }

            res.json({
                success: true,
                message: 'Estudiante eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error en delete:', error);
            this.handleDatabaseError(error, res);
        }
    }

    // Eliminar registros relacionados
    async deleteRelatedRecords(estudianteId) {
        try {
            const pool = await this.model.getPool();
            
            // Eliminar factores relacionados
            console.log('Eliminando factores del estudiante:', estudianteId);
            const factorRequest = pool.request();
            factorRequest.input('id_estudiante', mssql.Int, estudianteId);
            await factorRequest.query('DELETE FROM factores WHERE id_estudiante = @id_estudiante');
            
            // Eliminar calificaciones relacionadas (a través de grupos)
            console.log('Eliminando calificaciones del estudiante:', estudianteId);
            const califRequest = pool.request();
            califRequest.input('id_estudiante', mssql.Int, estudianteId);
            await califRequest.query(`
                DELETE FROM calificaciones_parciales 
                WHERE id_grupo IN (
                    SELECT id_grupo FROM grupos WHERE id_estudiante = @id_estudiante
                )
            `);
            
            // Eliminar grupos relacionados
            console.log('Eliminando grupos del estudiante:', estudianteId);
            const grupoRequest = pool.request();
            grupoRequest.input('id_estudiante', mssql.Int, estudianteId);
            await grupoRequest.query('DELETE FROM grupos WHERE id_estudiante = @id_estudiante');
            
            console.log('Registros relacionados eliminados exitosamente');
        } catch (error) {
            console.error('Error al eliminar registros relacionados:', error);
            throw error;
        }
    }
}

module.exports = EstudianteController;
