const express = require('express');
const router = express.Router();
const MateriaController = require('../controllers/MateriaController');

const materiaController = new MateriaController();

// Rutas básicas CRUD
router.get('/', (req, res) => materiaController.getAll(req, res));
router.get('/active', (req, res) => materiaController.getActive(req, res));
router.get('/basicas', (req, res) => materiaController.getBasicas(req, res));
router.get('/carrera/:carreraId', (req, res) => materiaController.getByCarrera(req, res));
router.get('/clave/:clave', (req, res) => materiaController.getByClave(req, res));
router.get('/creditos/:creditos', (req, res) => materiaController.getByCreditos(req, res));
router.get('/search', (req, res) => materiaController.searchByNombre(req, res));
router.get('/:id/grupos', (req, res) => materiaController.getGrupos(req, res));
router.get('/:id/stats', (req, res) => materiaController.getStats(req, res));
router.get('/:id', (req, res) => materiaController.getById(req, res));
router.post('/', (req, res) => materiaController.create(req, res));
router.put('/:id', (req, res) => materiaController.update(req, res));
router.delete('/:id', (req, res) => materiaController.delete(req, res));

module.exports = router;
