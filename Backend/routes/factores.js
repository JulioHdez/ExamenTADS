const express = require('express');
const router = express.Router();
const FactorController = require('../controllers/FactorController');

const factorController = new FactorController();

// Rutas básicas CRUD
router.get('/', (req, res) => factorController.getAll(req, res));
router.get('/active', (req, res) => factorController.getActive(req, res));
router.get('/stats', (req, res) => factorController.getStats(req, res));
router.get('/tipos', (req, res) => factorController.getTiposFactores(req, res));
router.get('/recent', (req, res) => factorController.getRecent(req, res));
router.get('/estudiante/:id', (req, res) => factorController.getByEstudiante(req, res));
router.get('/tipo/:tipo', (req, res) => factorController.getByTipo(req, res));
router.get('/carrera/:id', (req, res) => factorController.getByCarrera(req, res));
router.get('/semestre/:semestre', (req, res) => factorController.getBySemestre(req, res));
router.get('/:id', (req, res) => factorController.getById(req, res));
router.post('/', (req, res) => factorController.create(req, res));
router.put('/:id', (req, res) => factorController.update(req, res));
router.put('/:id/activate', (req, res) => factorController.activate(req, res));
router.put('/:id/deactivate', (req, res) => factorController.deactivate(req, res));
router.delete('/:id', (req, res) => factorController.delete(req, res));

module.exports = router;
