const express = require('express');
const router = express.Router();

// Importar todas las rutas
const carrerasRoutes = require('./carreras');
const estudiantesRoutes = require('./estudiantes');
const docentesRoutes = require('./docentes');
const materiasRoutes = require('./materias');
const gruposRoutes = require('./grupos');
const calificacionesRoutes = require('./calificaciones');
const factoresRoutes = require('./factores');

// Configurar rutas
router.use('/carreras', carrerasRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/docentes', docentesRoutes);
router.use('/materias', materiasRoutes);
router.use('/grupos', gruposRoutes);
router.use('/calificaciones', calificacionesRoutes);
router.use('/factores', factoresRoutes);

// Ruta de salud del API
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Ruta de información del API
router.get('/info', (req, res) => {
    res.json({
        success: true,
        message: 'Sistema de Gestión Académica ITT TASD',
        version: '1.0.0',
        description: 'API REST para el sistema de gestión académica',
        endpoints: {
            carreras: '/api/carreras',
            estudiantes: '/api/estudiantes',
            docentes: '/api/docentes',
            materias: '/api/materias',
            grupos: '/api/grupos',
            calificaciones: '/api/calificaciones',
            factores: '/api/factores'
        }
    });
});

module.exports = router;
