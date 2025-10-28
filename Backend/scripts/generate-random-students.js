const Estudiante = require('../models/Estudiante');
const { mssql } = require('../config/connection');

// Listas para generar datos aleatorios
const nombres = {
    masculinos: [
        'Juan', 'Carlos', 'Pedro', 'Luis', 'Miguel', 'Javier', 'Diego', 'Fernando',
        'Ricardo', 'Andrés', 'Roberto', 'Daniel', 'José', 'Antonio', 'Alejandro',
        'Francisco', 'Alejandro', 'Manuel', 'Óscar', 'Victor', 'Eduardo', 'Raúl'
    ],
    femeninos: [
        'María', 'Ana', 'Laura', 'Patricia', 'Carmen', 'Sofía', 'Fernanda',
        'Alejandra', 'Gabriela', 'Mónica', 'Verónica', 'Daniela', 'Andrea',
        'Paola', 'Diana', 'Karla', 'Liliana', 'Valeria', 'Estefanía', 'Natalia',
        'Jimena', 'Brenda', 'Yazmín'
    ]
};

const apellidos = [
    'López', 'García', 'Rodríguez', 'Martínez', 'González', 'Pérez', 'Sánchez',
    'Ramírez', 'Cruz', 'Flores', 'Gómez', 'Díaz', 'Morales', 'Hernández', 'Jiménez',
    'Torres', 'Vázquez', 'Ramos', 'Álvarez', 'Castillo', 'Mendoza', 'Ortega',
    'Ruiz', 'Vargas', 'Castro', 'Guzmán', 'Romero', 'Rivera', 'Soto', 'Luna'
];

const direcciones = [
    'Av. Universidad 123', 'Calle Principal 456', 'Blvd. Tecnológico 789',
    'Av. Revolución 321', 'Calle Independencia 654', 'Av. Tecnológico 987',
    'Blvd. López Mateos 147', 'Av. Industrial 258', 'Calle Libertad 369',
    'Av. Hidalgo 741', 'Blvd. Zaragoza 852', 'Calle Madero 963'
];

const estatus = ['Activo', 'Activo', 'Activo', 'Activo', 'Activo', 'Baja temporal', 'Egresado'];

const factoresDisponibles = [
    'Académico',
    'Motivacional',
    'Económico',
    'Social',
    'Familiar',
    'Transporte',
    'Salud',
    'Trabajo'
];

const aulas = ['A-101', 'A-102', 'A-103', 'A-201', 'A-202', 'A-203', 'B-101', 'B-102', 'C-101', 'C-201'];
const horarios = [
    'Lunes, Miércoles 8:00-10:00',
    'Martes, Jueves 8:00-10:00',
    'Lunes, Miércoles 10:00-12:00',
    'Martes, Jueves 10:00-12:00',
    'Lunes, Miércoles 14:00-16:00',
    'Martes, Jueves 14:00-16:00',
    'Viernes 8:00-12:00',
    'Lunes a Viernes 8:00-10:00'
];

// Función para generar un número aleatorio entre min y max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Función para generar fecha de nacimiento aleatoria
function generateRandomBirthDate() {
    const year = getRandomInt(1995, 2006);
    const month = getRandomInt(1, 12);
    const day = getRandomInt(1, 28);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Función para generar fecha de ingreso aleatoria
function generateRandomIngressDate() {
    const year = getRandomInt(2019, 2024);
    const month = getRandomInt(1, 12);
    const day = getRandomInt(1, 28);
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Función para generar un promedio general válido (0.00 - 99.99)
function generatePromedio() {
    // Generar un número entre 60.00 y 99.99
    const promedio = (Math.random() * 40) + 60;
    return parseFloat(promedio.toFixed(2));
}

// Función para generar número de control único
function generateNumControl(index, contadorGlobal = 0) {
    // Obtener el último número de control existente para evitar duplicados
    const año = '24';
    const contador = String(contadorGlobal || index + 1).padStart(6, '0');
    return `${año}${contador}`;
}

// Función para obtener el siguiente número de control disponible
async function getNextNumControl(pool, startIndex) {
    try {
        // Buscar el último número de control que empiece con '24'
        const request = pool.request();
        const result = await request.query(`
            SELECT MAX(num_control) as ultimo_num
            FROM estudiantes
            WHERE num_control LIKE '24%'
        `);
        
        let ultimoNum = 0;
        if (result.recordset[0].ultimo_num) {
            // Extraer el número del último num_control
            const partes = result.recordset[0].ultimo_num.match(/^24(\d+)$/);
            if (partes) {
                ultimoNum = parseInt(partes[1], 10);
            }
        }
        
        return ultimoNum + 1;
    } catch (error) {
        return startIndex + 1;
    }
}

// Función para generar datos de un estudiante
function generateStudent(index, carrerasDisponibles, numControl, timestamp = Date.now()) {
    const genero = Math.random() > 0.5 ? 'M' : 'F';
    const nombre = getRandomElement(genero === 'M' ? nombres.masculinos : nombres.femeninos);
    const apellidoPaterno = getRandomElement(apellidos);
    const apellidoMaterno = getRandomElement(apellidos);
    
    // Asegurarse de que el email sea único usando timestamp
    const email = `${nombre.toLowerCase()}.${apellidoPaterno.toLowerCase()}${index}_${timestamp}@student.tec.com`;
    
    // Seleccionar carrera aleatoria
    const carrera = getRandomElement(carrerasDisponibles);
    
    // Generar semestre según el año de ingreso
    const semestre = getRandomInt(1, Math.min(carrera.duracion_semestres, 12));
    
    return {
        num_control: numControl,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        nombre: nombre,
        genero: genero,
        fecha_nacimiento: generateRandomBirthDate(),
        email: email,
        telefono: `664${String(getRandomInt(1000000, 9999999))}`,
        direccion: getRandomElement(direcciones),
        id_carrera: carrera.id_carrera,
        semestre_actual: semestre,
        fecha_ingreso: generateRandomIngressDate(),
        estatus: getRandomElement(estatus),
        promedio_general: generatePromedio()
    };
}

// Función para crear grupos de un estudiante
async function createGruposParaEstudiante(pool, idEstudiante, materiasDisponibles, docentesDisponibles, estudiante) {
    try {
        // Crear entre 1 y 3 grupos por estudiante
        const numGrupos = getRandomInt(1, 3);
        
        for (let i = 0; i < numGrupos; i++) {
            const materia = getRandomElement(materiasDisponibles);
            const docente = getRandomElement(docentesDisponibles);
            
            const grupoData = {
                id_estudiante: idEstudiante,
                id_docente: docente.id_docente,
                id_materia: materia.id_materia,
                clave_grupo: `GRP${String(idEstudiante).padStart(3, '0')}${i + 1}`,
                semestre: estudiante.semestre_actual.toString(),
                anio: 2024,
                periodo: getRandomElement(['1', '2']),
                horario: getRandomElement(horarios),
                aula: getRandomElement(aulas)
            };
            
            const request = pool.request();
            request.input('id_estudiante', mssql.Int, grupoData.id_estudiante);
            request.input('id_docente', mssql.Int, grupoData.id_docente);
            request.input('id_materia', mssql.Int, grupoData.id_materia);
            request.input('clave_grupo', mssql.VarChar(20), grupoData.clave_grupo);
            request.input('semestre', mssql.VarChar(20), grupoData.semestre);
            request.input('anio', mssql.Int, grupoData.anio);
            request.input('periodo', mssql.VarChar(10), grupoData.periodo);
            request.input('horario', mssql.VarChar(100), grupoData.horario);
            request.input('aula', mssql.VarChar(20), grupoData.aula);
            
            await request.query(`
                INSERT INTO grupos (id_estudiante, id_docente, id_materia, clave_grupo, semestre, anio, periodo, horario, aula, fecha_registro)
                VALUES (@id_estudiante, @id_docente, @id_materia, @clave_grupo, @semestre, @anio, @periodo, @horario, @aula, GETDATE())
            `);
        }
        
        return numGrupos;
    } catch (error) {
        console.error(`Error creando grupos para estudiante ${idEstudiante}:`, error.message);
        return 0;
    }
}

// Función para generar una calificación aleatoria con posibilidad de reprobar
function generateCalificacion(promedioEstudiante) {
    // 70% de probabilidad de aprobar, 30% de reprobar
    const esReprobado = Math.random() < 0.3;
    
    if (esReprobado) {
        // Reprobar: calificación entre 40 y 69
        return Math.random() * 29 + 40;
    } else {
        // Aprobar: calificación entre 70 y 100
        return Math.random() * 30 + 70;
    }
}

// Función para generar asistencia aleatoria
function generateAsistencia() {
    // Asistencia entre 70 y 100
    return Math.random() * 30 + 70;
}

// Función para crear calificaciones para los grupos de un estudiante
async function createCalificacionesParaEstudiante(pool, idEstudiante, idDocente) {
    try {
        // Obtener los grupos del estudiante
        const gruposRequest = pool.request();
        gruposRequest.input('id_estudiante', mssql.Int, idEstudiante);
        const gruposResult = await gruposRequest.query(`
            SELECT id_grupo FROM grupos WHERE id_estudiante = @id_estudiante
        `);
        
        if (gruposResult.recordset.length === 0) {
            return 0;
        }
        
        let totalCalificaciones = 0;
        
        // Para cada grupo, crear 2-3 unidades de calificación
        for (const grupo of gruposResult.recordset) {
            const idGrupo = grupo.id_grupo;
            const numUnidades = getRandomInt(2, 3);
            
            for (let unidad = 1; unidad <= numUnidades; unidad++) {
                const calificacion = generateCalificacion();
                const asistencia = generateAsistencia();
                
                const insertRequest = pool.request();
                insertRequest.input('id_grupo', mssql.Int, idGrupo);
                insertRequest.input('id_docente_registro', mssql.Int, idDocente);
                insertRequest.input('num_unidad', mssql.Int, unidad);
                insertRequest.input('calificacion', mssql.Decimal(4, 2), parseFloat(calificacion.toFixed(2)));
                insertRequest.input('asistencia', mssql.Decimal(5, 2), parseFloat(asistencia.toFixed(2)));
                insertRequest.input('fecha_evaluacion', mssql.Date, new Date());
                insertRequest.input('comentarios', mssql.Text, `Calificación de Unidad ${unidad}`);
                
                await insertRequest.query(`
                    INSERT INTO calificaciones_parciales (id_grupo, id_docente_registro, num_unidad, calificacion, asistencia, fecha_evaluacion, comentarios)
                    VALUES (@id_grupo, @id_docente_registro, @num_unidad, @calificacion, @asistencia, @fecha_evaluacion, @comentarios)
                `);
                
                totalCalificaciones++;
            }
        }
        
        return totalCalificaciones;
    } catch (error) {
        console.error(`Error creando calificaciones para estudiante ${idEstudiante}:`, error.message);
        return 0;
    }
}

// Función para crear factores de riesgo de un estudiante
async function createFactoresParaEstudiante(pool, idEstudiante) {
    try {
        // Crear entre 1 y 4 factores aleatorios
        const numFactores = getRandomInt(1, 4);
        const factoresSeleccionados = [];
        
        // Seleccionar factores aleatorios únicos
        const factoresCopy = [...factoresDisponibles];
        for (let i = 0; i < numFactores && factoresCopy.length > 0; i++) {
            const factor = getRandomElement(factoresCopy);
            factoresSeleccionados.push(factor);
            factoresCopy.splice(factoresCopy.indexOf(factor), 1);
        }
        
        // Crear cada factor
        for (const nombreFactor of factoresSeleccionados) {
            const factorData = {
                id_estudiante: idEstudiante,
                nombre_factor: nombreFactor,
                descripcion: `Factor de riesgo: ${nombreFactor}`,
                observaciones: `Observación sobre el factor de riesgo ${nombreFactor.toLowerCase()}`,
                activo: 1
            };
            
            const request = pool.request();
            request.input('id_estudiante', mssql.Int, factorData.id_estudiante);
            request.input('nombre_factor', mssql.VarChar(100), factorData.nombre_factor);
            request.input('descripcion', mssql.VarChar(200), factorData.descripcion);
            request.input('observaciones', mssql.Text, factorData.observaciones);
            request.input('activo', mssql.Bit, factorData.activo);
            
            await request.query(`
                INSERT INTO factores (id_estudiante, nombre_factor, descripcion, observaciones, activo, fecha_asignacion)
                VALUES (@id_estudiante, @nombre_factor, @descripcion, @observaciones, @activo, GETDATE())
            `);
        }
        
        return numFactores;
    } catch (error) {
        console.error(`Error creando factores para estudiante ${idEstudiante}:`, error.message);
        return 0;
    }
}

// Función para eliminar estudiantes previos
async function cleanExistingStudents(pool) {
    try {
        console.log('🗑️  Eliminando estudiantes previos...');
        
        // Obtener conteo de estudiantes antes de eliminar
        const countRequest = pool.request();
        const countResult = await countRequest.query('SELECT COUNT(*) as total FROM estudiantes');
        const totalAntes = countResult.recordset[0].total;
        
        // Eliminar calificaciones relacionadas primero
        const deleteCalifRequest = pool.request();
        await deleteCalifRequest.query(`
            DELETE FROM calificaciones_parciales
            WHERE id_grupo IN (SELECT id_grupo FROM grupos)
        `);
        
        // Eliminar factores
        const deleteFactoresRequest = pool.request();
        await deleteFactoresRequest.query('DELETE FROM factores');
        
        // Eliminar grupos
        const deleteGruposRequest = pool.request();
        await deleteGruposRequest.query('DELETE FROM grupos');
        
        // Eliminar estudiantes
        const deleteEstudiantesRequest = pool.request();
        await deleteEstudiantesRequest.query('DELETE FROM estudiantes');
        
        console.log(`✅ Se eliminaron ${totalAntes} estudiantes previos y sus datos relacionados`);
        
        return totalAntes;
    } catch (error) {
        console.error('⚠️  Error eliminando estudiantes previos:', error.message);
        return 0;
    }
}

// Función principal para generar estudiantes
async function generateRandomStudents(count = 200, clean = false) {
    try {
        console.log('🚀 Iniciando generación de estudiantes aleatorios...');
        console.log(`📊 Cantidad de estudiantes a generar: ${count}`);
        
        const estudianteModel = new Estudiante();
        const pool = await estudianteModel.getPool();
        
        // Si se solicita, limpiar estudiantes previos
        if (clean) {
            await cleanExistingStudents(pool);
        }
        
        // Obtener el siguiente número de control disponible
        console.log('🔢 Obteniendo próximo número de control disponible...');
        const nextNumControl = await getNextNumControl(pool, 0);
        console.log(`✅ Próximo número de control: ${generateNumControl(0, nextNumControl)}`);
        
        // Obtener carreras disponibles
        console.log('📚 Obteniendo carreras disponibles...');
        const carrerasRequest = pool.request();
        const carrerasResult = await carrerasRequest.query('SELECT * FROM carreras WHERE activo = 1');
        const carrerasDisponibles = carrerasResult.recordset;
        
        if (carrerasDisponibles.length === 0) {
            console.error('❌ No hay carreras disponibles en la base de datos');
            console.log('💡 Ejecuta primero el script insert_carreras.sql para crear las carreras');
            return;
        }
        
        console.log(`✅ Se encontraron ${carrerasDisponibles.length} carreras disponibles`);
        
        // Obtener materias disponibles
        console.log('📖 Obteniendo materias disponibles...');
        const materiasRequest = pool.request();
        const materiasResult = await materiasRequest.query('SELECT * FROM materias WHERE activo = 1');
        const materiasDisponibles = materiasResult.recordset;
        
        if (materiasDisponibles.length === 0) {
            console.error('❌ No hay materias disponibles en la base de datos');
            console.log('💡 Las materias se crearán automáticamente en el primer endpoint o ejecuta insert_materias.sql');
            return;
        }
        
        console.log(`✅ Se encontraron ${materiasDisponibles.length} materias disponibles`);
        
        // Obtener docentes disponibles
        console.log('👨‍🏫 Obteniendo docentes disponibles...');
        const docentesRequest = pool.request();
        const docentesResult = await docentesRequest.query('SELECT * FROM docentes WHERE estatus = \'Activo\'');
        const docentesDisponibles = docentesResult.recordset;
        
        if (docentesDisponibles.length === 0) {
            console.error('❌ No hay docentes disponibles en la base de datos');
            console.log('💡 Crea al menos un docente antes de generar estudiantes');
            return;
        }
        
        console.log(`✅ Se encontraron ${docentesDisponibles.length} docentes disponibles`);
        
        // Insertar estudiantes en la base de datos
        console.log('💾 Insertando estudiantes en la base de datos...');
        let insertados = 0;
        let duplicados = 0;
        let errores = 0;
        let gruposCreados = 0;
        let factoresCreados = 0;
        let calificacionesCreadas = 0;
        const estudiantesEjemplo = [];
        let currentNumControl = nextNumControl;
        const timestamp = Date.now();
        
        for (let i = 0; i < count; i++) {
            try {
                // Generar número de control dinámicamente
                let numControlGenerado = generateNumControl(i, currentNumControl);
                
                // Verificar si ya existe un estudiante con ese número de control
                let existente = await estudianteModel.findByNumControl(numControlGenerado);
                let intentos = 0;
                
                // Si existe, generar otro número de control
                while (existente && intentos < 10) {
                    currentNumControl++;
                    numControlGenerado = generateNumControl(i, currentNumControl);
                    existente = await estudianteModel.findByNumControl(numControlGenerado);
                    intentos++;
                }
                
                if (intentos > 0) {
                    duplicados++;
                }
                
                // Generar estudiante con el número de control válido
                const estudiante = generateStudent(i, carrerasDisponibles, numControlGenerado, timestamp + i);
                currentNumControl++;
                
                // Insertar estudiante
                const nuevoEstudiante = await estudianteModel.createEstudiante(estudiante);
                const idEstudiante = nuevoEstudiante.id_estudiante;
                insertados++;
                
                // Crear grupos para el estudiante (1-3 grupos)
                const numGrupos = await createGruposParaEstudiante(pool, idEstudiante, materiasDisponibles, docentesDisponibles, estudiante);
                gruposCreados += numGrupos;
                
                // Crear factores de riesgo (1-4 factores aleatorios)
                const numFactores = await createFactoresParaEstudiante(pool, idEstudiante);
                factoresCreados += numFactores;
                
                // Crear calificaciones para los grupos (2-3 unidades por grupo)
                // Usar el primer docente disponible como id_docente_registro
                const idDocenteRegistro = docentesDisponibles[0]?.id_docente || 1;
                const numCalificaciones = await createCalificacionesParaEstudiante(pool, idEstudiante, idDocenteRegistro);
                calificacionesCreadas += numCalificaciones;
                
                // Guardar para ejemplo
                if (estudiantesEjemplo.length < 5) {
                    estudiantesEjemplo.push(estudiante);
                }
                
                if (insertados % 10 === 0) {
                    console.log(`📊 Progreso: ${insertados}/${count} estudiantes, ${gruposCreados} grupos, ${factoresCreados} factores, ${calificacionesCreadas} calificaciones`);
                }
            } catch (error) {
                errores++;
                console.error(`❌ Error insertando estudiante:`, error.message);
            }
        }
        
        // Resumen
        console.log('\n' + '='.repeat(60));
        console.log('✅ PROCESO COMPLETADO');
        console.log('='.repeat(60));
        console.log(`📊 Resumen:`);
        console.log(`   ✓ Estudiantes insertados: ${insertados}`);
        console.log(`   📚 Grupos creados: ${gruposCreados}`);
        console.log(`   ⚠️  Factores de riesgo creados: ${factoresCreados}`);
        console.log(`   📝 Calificaciones creadas: ${calificacionesCreadas}`);
        console.log(`   ⚠️  Duplicados omitidos: ${duplicados}`);
        console.log(`   ❌ Errores: ${errores}`);
        console.log('='.repeat(60));
        
        // Mostrar algunos ejemplos de estudiantes insertados
        if (insertados > 0 && estudiantesEjemplo.length > 0) {
            console.log('\n📋 Ejemplos de estudiantes generados:');
            estudiantesEjemplo.forEach(est => {
                console.log(`   - ${est.nombre} ${est.apellido_paterno} ${est.apellido_materno} (${est.num_control})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error en generateRandomStudents:', error);
        throw error;
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    // Parsear argumentos: count y --clean
    let count = 200;
    let clean = false;
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--clean' || args[i] === '-c') {
            clean = true;
        } else if (!isNaN(parseInt(args[i]))) {
            count = parseInt(args[i]);
        }
    }
    
    if (clean) {
        console.log('⚠️  Modo CLEAN activado: Se eliminarán todos los estudiantes previos');
    }
    
    generateRandomStudents(count, clean)
        .then(() => {
            console.log('\n✅ Script ejecutado exitosamente');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error ejecutando el script:', error);
            process.exit(1);
        });
}

module.exports = { generateRandomStudents };

