const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

// Validaciones para carreras
const validateCarrera = [
    body('nombre_carrera')
        .notEmpty()
        .withMessage('El nombre de la carrera es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body('clave_carrera')
        .notEmpty()
        .withMessage('La clave de la carrera es requerida')
        .isLength({ min: 2, max: 20 })
        .withMessage('La clave debe tener entre 2 y 20 caracteres'),
    body('duracion_semestres')
        .isInt({ min: 1, max: 20 })
        .withMessage('La duración debe ser un número entre 1 y 20'),
    handleValidationErrors
];

// Validaciones para estudiantes
const validateEstudiante = [
    body('num_control')
        .notEmpty()
        .withMessage('El número de control es requerido')
        .isLength({ min: 5, max: 20 })
        .withMessage('El número de control debe tener entre 5 y 20 caracteres'),
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('apellido_paterno')
        .notEmpty()
        .withMessage('El apellido paterno es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido paterno debe tener entre 2 y 50 caracteres'),
    body('apellido_materno')
        .notEmpty()
        .withMessage('El apellido materno es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido materno debe tener entre 2 y 50 caracteres'),
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido'),
    body('genero')
        .isIn(['M', 'F', 'Otro', 'Prefiero no decir'])
        .withMessage('El género debe ser M, F, Otro o Prefiero no decir'),
    body('fecha_nacimiento')
        .isISO8601()
        .withMessage('La fecha de nacimiento debe ser válida'),
    body('id_carrera')
        .isInt({ min: 1 })
        .withMessage('El ID de la carrera debe ser un número entero positivo'),
    body('semestre_actual')
        .isInt({ min: 1, max: 12 })
        .withMessage('El semestre debe estar entre 1 y 12'),
    handleValidationErrors
];

// Validaciones para docentes
const validateDocente = [
    body('num_empleado')
        .notEmpty()
        .withMessage('El número de empleado es requerido')
        .isLength({ min: 3, max: 20 })
        .withMessage('El número de empleado debe tener entre 3 y 20 caracteres'),
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('apellido_paterno')
        .notEmpty()
        .withMessage('El apellido paterno es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido paterno debe tener entre 2 y 50 caracteres'),
    body('apellido_materno')
        .notEmpty()
        .withMessage('El apellido materno es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido materno debe tener entre 2 y 50 caracteres'),
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido'),
    body('genero')
        .isIn(['M', 'F', 'Otro', 'Prefiero no decir'])
        .withMessage('El género debe ser M, F, Otro o Prefiero no decir'),
    body('fecha_contratacion')
        .isISO8601()
        .withMessage('La fecha de contratación debe ser válida'),
    handleValidationErrors
];

// Validaciones para materias
const validateMateria = [
    body('clave_materia')
        .notEmpty()
        .withMessage('La clave de la materia es requerida')
        .isLength({ min: 3, max: 20 })
        .withMessage('La clave debe tener entre 3 y 20 caracteres'),
    body('nombre_materia')
        .notEmpty()
        .withMessage('El nombre de la materia es requerido')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    body('creditos')
        .isInt({ min: 1, max: 20 })
        .withMessage('Los créditos deben estar entre 1 y 20'),
    body('horas_teoria')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Las horas de teoría deben estar entre 0 y 100'),
    body('horas_practica')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Las horas de práctica deben estar entre 0 y 100'),
    handleValidationErrors
];

// Validaciones para grupos
const validateGrupo = [
    body('id_materia')
        .isInt({ min: 1 })
        .withMessage('El ID de la materia debe ser un número entero positivo'),
    body('id_docente')
        .isInt({ min: 1 })
        .withMessage('El ID del docente debe ser un número entero positivo'),
    body('id_estudiante')
        .isInt({ min: 1 })
        .withMessage('El ID del estudiante debe ser un número entero positivo'),
    body('clave_grupo')
        .notEmpty()
        .withMessage('La clave del grupo es requerida')
        .isLength({ min: 3, max: 20 })
        .withMessage('La clave debe tener entre 3 y 20 caracteres'),
    body('semestre')
        .notEmpty()
        .withMessage('El semestre es requerido')
        .isLength({ min: 1, max: 20 })
        .withMessage('El semestre debe tener entre 1 y 20 caracteres'),
    body('anio')
        .isInt({ min: 2020, max: 2030 })
        .withMessage('El año debe estar entre 2020 y 2030'),
    body('periodo')
        .isIn(['1', '2', 'Verano'])
        .withMessage('El período debe ser 1, 2 o Verano'),
    handleValidationErrors
];

// Validaciones para calificaciones
const validateCalificacion = [
    body('id_grupo')
        .isInt({ min: 1 })
        .withMessage('El ID del grupo debe ser un número entero positivo'),
    body('num_unidad')
        .isInt({ min: 1, max: 3 })
        .withMessage('La unidad debe estar entre 1 y 3'),
    body('calificacion')
        .isFloat({ min: 0, max: 100 })
        .withMessage('La calificación debe estar entre 0 y 100'),
    body('asistencia')
        .isFloat({ min: 0, max: 100 })
        .withMessage('La asistencia debe estar entre 0 y 100'),
    body('fecha_evaluacion')
        .isISO8601()
        .withMessage('La fecha de evaluación debe ser válida'),
    body('id_docente_registro')
        .isInt({ min: 1 })
        .withMessage('El ID del docente debe ser un número entero positivo'),
    handleValidationErrors
];

// Validaciones para factores
const validateFactor = [
    body('id_estudiante')
        .isInt({ min: 1 })
        .withMessage('El ID del estudiante debe ser un número entero positivo'),
    body('nombre_factor')
        .isIn(['Motivacional', 'Social', 'Académico', 'Transporte', 'Trabajo', 'Salud', 'Familiar', 'Económico'])
        .withMessage('El tipo de factor debe ser uno de los valores permitidos'),
    body('descripcion')
        .optional()
        .isLength({ max: 200 })
        .withMessage('La descripción no debe exceder 200 caracteres'),
    handleValidationErrors
];

// Validaciones para parámetros de ruta
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    handleValidationErrors
];

// Validaciones para consultas
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe estar entre 1 y 100'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateCarrera,
    validateEstudiante,
    validateDocente,
    validateMateria,
    validateGrupo,
    validateCalificacion,
    validateFactor,
    validateId,
    validatePagination
};
