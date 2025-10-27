const express = require('express');
const router = express.Router();
const EstudianteController = require('../controllers/EstudianteController');
const { authenticateToken } = require('../middleware/auth');

const estudianteController = new EstudianteController();

// Rutas específicas (deben ir antes que las rutas con parámetros)
router.post('/initialize-carreras', (req, res) => estudianteController.initializeCarreras(req, res));
router.post('/initialize-materias', (req, res) => estudianteController.initializeMaterias(req, res));
router.post('/initialize-all-tables', (req, res) => estudianteController.initializeAllTables(req, res));
router.post('/simple', (req, res) => estudianteController.createSimple(req, res));
router.post('/complete', authenticateToken, (req, res) => estudianteController.createComplete(req, res));

// Rutas básicas CRUD
router.get('/', (req, res) => estudianteController.getAll(req, res));
router.get('/with-carreras', (req, res) => estudianteController.getAllWithCarreras(req, res));
router.get('/active', (req, res) => estudianteController.getActive(req, res));
router.get('/stats', (req, res) => estudianteController.getStats(req, res));
router.get('/num-control/:numControl', (req, res) => estudianteController.getByNumControl(req, res));
router.get('/carrera/:idCarrera', (req, res) => estudianteController.getByCarrera(req, res));
router.get('/semestre/:semestre', (req, res) => estudianteController.getBySemestre(req, res));
router.get('/:id/calificaciones', (req, res) => estudianteController.getCalificaciones(req, res));
router.get('/:id/factores', (req, res) => estudianteController.getFactores(req, res));
router.post('/:id/calcular-promedio', (req, res) => estudianteController.calcularPromedio(req, res));
router.get('/:id/complete', (req, res) => estudianteController.getCompleteById(req, res));
router.post('/', (req, res) => estudianteController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => estudianteController.update(req, res));
router.delete('/:id', (req, res) => estudianteController.delete(req, res));

module.exports = router;
