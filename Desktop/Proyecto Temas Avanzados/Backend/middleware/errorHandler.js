// Middleware para manejo de errores
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: Object.values(err.errors).map(e => ({
                field: e.path,
                message: e.message,
                value: e.value
            }))
        });
    }

    // Error de duplicado
    if (err.code === 'ER_DUP_ENTRY' || err.number === 2627) {
        return res.status(409).json({
            success: false,
            message: 'El registro ya existe',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error de referencia foránea
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.number === 547) {
        return res.status(400).json({
            success: false,
            message: 'Referencia a registro inexistente',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error de conexión a base de datos
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'Servicio de base de datos no disponible',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error de timeout
    if (err.code === 'ETIMEDOUT') {
        return res.status(504).json({
            success: false,
            message: 'Timeout en la operación',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expirado'
        });
    }

    // Error de sintaxis SQL
    if (err.name === 'SyntaxError' && err.message.includes('SQL')) {
        return res.status(500).json({
            success: false,
            message: 'Error en la consulta SQL',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }

    // Error genérico
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Ruta ${req.originalUrl} no encontrada`,
        method: req.method
    });
};

// Middleware para manejo de errores asíncronos
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler
};
