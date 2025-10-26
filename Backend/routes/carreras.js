const express = require('express');
const router = express.Router();
const CarreraController = require('../controllers/CarreraController');

const carreraController = new CarreraController();

// Rutas para carreras
router.get('/', (req, res) => carreraController.getAll(req, res));
router.get('/active', (req, res) => carreraController.findActive(req, res));
router.get('/stats', (req, res) => carreraController.getStats(req, res));
router.get('/:id', (req, res) => carreraController.getById(req, res));
router.post('/', (req, res) => carreraController.create(req, res));
router.put('/:id', (req, res) => carreraController.update(req, res));
router.delete('/:id', (req, res) => carreraController.delete(req, res));

module.exports = router;