const express = require('express');
const router = express.Router();
const MockController = require('../controllers/MockController');

const mockController = new MockController();

// Rutas para carreras
router.get('/', (req, res) => mockController.getAll(req, res));
router.get('/:id', (req, res) => mockController.getById(req, res));
router.post('/', (req, res) => mockController.create(req, res));
router.put('/:id', (req, res) => mockController.update(req, res));
router.delete('/:id', (req, res) => mockController.delete(req, res));

module.exports = router;