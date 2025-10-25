const cors = require('cors');

// Configuración de CORS
const corsOptions = {
    origin: function (origin, callback) {
        // Permitir requests sin origin (como mobile apps o curl)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.CORS_ORIGIN || 'http://localhost:5173',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:8080'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permitir cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
    maxAge: 86400 // 24 horas
};

// Middleware de CORS personalizado
const corsMiddleware = cors(corsOptions);

// Middleware para manejar errores de CORS
const corsErrorHandler = (err, req, res, next) => {
    if (err.message === 'No permitido por CORS') {
        return res.status(403).json({
            success: false,
            message: 'Origen no permitido por CORS',
            origin: req.headers.origin
        });
    }
    next(err);
};

module.exports = {
    corsMiddleware,
    corsErrorHandler
};
