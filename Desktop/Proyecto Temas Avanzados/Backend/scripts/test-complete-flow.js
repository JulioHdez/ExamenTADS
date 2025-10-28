const EstudianteController = require('../controllers/EstudianteController');

async function testCompleteFlow() {
    console.log('=== INICIANDO PRUEBA COMPLETA DEL FLUJO ===');
    
    const controller = new EstudianteController();
    
    try {
        // 1. Inicializar carreras
        console.log('\n1. Inicializando carreras...');
        const carrerasResult = await controller.initializeCarreras({}, {
            json: (data) => console.log('Carreras:', data.message)
        });
        
        // 2. Inicializar materias
        console.log('\n2. Inicializando materias...');
        const materiasResult = await controller.initializeMaterias({}, {
            json: (data) => console.log('Materias:', data.message)
        });
        
        // 3. Crear un estudiante completo con todos los datos
        console.log('\n3. Creando estudiante completo...');
        const studentData = {
            num_control: '2025001',
            nombre: 'Juan',
            apellido_paterno: 'Pérez',
            apellido_materno: 'García',
            genero: 'M',
            fecha_nacimiento: '2000-01-15',
            email: 'juan.perez@test.com',
            telefono: '555-1234',
            direccion: 'Calle Test 123',
            id_carrera: 2, // Ingeniería en Sistemas
            semestre_actual: 1,
            fecha_ingreso: '2025-01-01',
            estatus: 'Activo',
            factores_seleccionados: ['Académico', 'Económico'],
            calificaciones: [
                { name: 'Matemáticas', grade: '85' },
                { name: 'Programación', grade: '90' },
                { name: 'Bases de Datos', grade: '88' }
            ],
            observaciones: 'Estudiante con buen rendimiento académico',
            grupos: [
                {
                    clave_grupo: 'GRP001',
                    semestre: '1',
                    anio: 2025,
                    periodo: '1',
                    horario: 'Lunes a Viernes 8:00-10:00',
                    aula: 'A-101'
                }
            ]
        };
        
        const createResult = await controller.createComplete({
            body: studentData,
            user: { id_docente: 1 },
            headers: { 'x-user-id': 1 }
        }, {
            status: (code) => ({
                json: (data) => {
                    console.log(`Estudiante creado con código ${code}:`, data.message);
                    if (data.success) {
                        console.log('ID del estudiante:', data.data.id_estudiante);
                    }
                }
            })
        });
        
        // 4. Verificar que se crearon los datos relacionados
        console.log('\n4. Verificando datos relacionados...');
        
        // Obtener estudiante completo
        const getResult = await controller.getCompleteById({
            params: { id: 1 }
        }, {
            json: (data) => {
                if (data.success) {
                    console.log('Estudiante encontrado:', data.data.nombre);
                    console.log('Factores:', data.data.factores?.length || 0);
                    console.log('Grupos:', data.data.grupos?.length || 0);
                    console.log('Calificaciones:', data.data.calificaciones?.length || 0);
                }
            }
        });
        
        console.log('\n=== PRUEBA COMPLETA FINALIZADA ===');
        
    } catch (error) {
        console.error('Error en la prueba:', error);
    }
}

// Ejecutar la prueba
testCompleteFlow();
