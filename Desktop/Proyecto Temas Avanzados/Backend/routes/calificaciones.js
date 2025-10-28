const express = require('express');
const router = express.Router();
const CalificacionParcialController = require('../controllers/CalificacionParcialController');

const calificacionController = new CalificacionParcialController();

// Rutas básicas CRUD
router.get('/', (req, res) => calificacionController.getAllWithDetails(req, res));
router.get('/stats', (req, res) => calificacionController.getStats(req, res));
router.get('/grupo/:id', (req, res) => calificacionController.getByGrupo(req, res));
router.get('/estudiante/:id', (req, res) => calificacionController.getByEstudiante(req, res));
router.get('/docente/:id', (req, res) => calificacionController.getByDocente(req, res));
router.get('/materia/:id', (req, res) => calificacionController.getByMateria(req, res));
router.get('/unidad/:numUnidad', (req, res) => calificacionController.getByUnidad(req, res));
router.get('/:id', (req, res) => calificacionController.getById(req, res));
router.post('/', (req, res) => calificacionController.create(req, res));
router.put('/:id', (req, res) => calificacionController.update(req, res));
router.delete('/:id', (req, res) => calificacionController.delete(req, res));

module.exports = router;
