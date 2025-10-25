const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Calificaciones',
        version: '1.0.0',
        status: 'running',
        database: 'not connected'
    });
});

// Rutas de la API
app.use('/api/carreras', require('./routes/carreras'));
app.use('/api/estudiantes', require('./routes/estudiantes'));
app.use('/api/docentes', require('./routes/docentes'));
app.use('/api/materias', require('./routes/materias'));
app.use('/api/grupos', require('./routes/grupos'));
app.use('/api/calificaciones', require('./routes/calificaciones'));
app.use('/api/factores', require('./routes/factores'));

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: 'La ruta solicitada no existe'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
    console.log('NOTA: Base de datos no conectada - modo desarrollo');
});

module.exports = app;
