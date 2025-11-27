const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

// Importar configuración de base de datos
const { getConnection } = require('./config/connection');

// Importar middlewares
const { corsMiddleware, corsErrorHandler } = require('./middleware/cors');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Importar rutas
const apiRoutes = require('./routes');
const path = require('path');

// Crear aplicación Express
const app = express();

// Configurar puerto
const PORT = process.env.PORT || 3001;

// Middlewares de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// Middleware de CORS
app.use(corsMiddleware);
app.use(corsErrorHandler);

// Middleware de compresión
app.use(compression());

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Middleware para asegurar UTF-8 en todas las respuestas JSON
app.use((req, res, next) => {
    res.charset = 'utf-8';
    if (res.getHeader('Content-Type') && res.getHeader('Content-Type').includes('application/json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    next();
});

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos de la carpeta EXCEL (plantillas)
const excelDir = path.join(__dirname, '..', 'EXCEL');
app.use('/static', express.static(excelDir, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.xlsx')) {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        } else if (filePath.endsWith('.csv')) {
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        }
        res.setHeader('Cache-Control', 'no-store');
    }
}));

// Middleware para manejar errores de base de datos
const handleDBError = (error, req, res, next) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({
            success: false,
            message: 'Servicio de base de datos no disponible',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
    next(error);
};
app.use(handleDBError);

// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Gestión Académica ITT TASD',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            api: '/api',
            health: '/api/health',
            info: '/api/info'
        }
    });
});

// Configurar rutas de la API
app.use('/api', apiRoutes);

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await getConnection();
        console.log('Base de datos conectada');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en puerto ${PORT}`);
            console.log(`API disponible en: http://localhost:${PORT}/api`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Documentación: http://localhost:${PORT}/api/info`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
    console.log('SIGTERM recibido, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT recibido, cerrando servidor...');
    process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    process.exit(1);
});

// Iniciar servidor
startServer();

module.exports = app;
