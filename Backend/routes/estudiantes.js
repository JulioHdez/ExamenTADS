const express = require('express');
const router = express.Router();
const EstudianteController = require('../controllers/EstudianteController');

const estudianteController = new EstudianteController();

// Rutas básicas CRUD
router.get('/', (req, res) => estudianteController.getAll(req, res));
router.get('/active', (req, res) => estudianteController.getActive(req, res));
router.get('/stats', (req, res) => estudianteController.getStats(req, res));
router.get('/num-control/:numControl', (req, res) => estudianteController.getByNumControl(req, res));
router.get('/carrera/:idCarrera', (req, res) => estudianteController.getByCarrera(req, res));
router.get('/semestre/:semestre', (req, res) => estudianteController.getBySemestre(req, res));
router.get('/:id/calificaciones', (req, res) => estudianteController.getCalificaciones(req, res));
router.get('/:id/factores', (req, res) => estudianteController.getFactores(req, res));
router.post('/:id/calcular-promedio', (req, res) => estudianteController.calcularPromedio(req, res));
router.get('/:id', (req, res) => estudianteController.getById(req, res));
router.post('/', (req, res) => estudianteController.create(req, res));
router.put('/:id', (req, res) => estudianteController.update(req, res));
router.delete('/:id', (req, res) => estudianteController.delete(req, res));

module.exports = router;
