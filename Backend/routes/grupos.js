const express = require('express');
const router = express.Router();
const GrupoController = require('../controllers/GrupoController');

const grupoController = new GrupoController();

// Rutas básicas CRUD
router.get('/', (req, res) => grupoController.getAllWithDetails(req, res));
router.get('/docente/:id', (req, res) => grupoController.getByDocente(req, res));
router.get('/estudiante/:id', (req, res) => grupoController.getByEstudiante(req, res));
router.get('/materia/:id', (req, res) => grupoController.getByMateria(req, res));
router.get('/semestre/:semestre/anio/:anio', (req, res) => grupoController.getBySemestreAnio(req, res));
router.get('/:id', (req, res) => grupoController.getById(req, res));
router.post('/', (req, res) => grupoController.create(req, res));
router.put('/:id', (req, res) => grupoController.update(req, res));
router.delete('/:id', (req, res) => grupoController.delete(req, res));

module.exports = router;
