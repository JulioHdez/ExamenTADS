const express = require('express');
const router = express.Router();
const ProfesorController = require('../controllers/ProfesorController');

const profesorController = new ProfesorController();

// Rutas de autenticación
router.post('/login/correo', (req, res) => profesorController.loginByCorreo(req, res));

// Rutas básicas CRUD
router.get('/', (req, res) => profesorController.getAll(req, res));
router.get('/:id', (req, res) => profesorController.getById(req, res));
router.get('/:id/materias', (req, res) => profesorController.getMaterias(req, res));
router.get('/:id/estudiantes', (req, res) => profesorController.getEstudiantes(req, res));
router.post('/', (req, res) => profesorController.create(req, res));
router.put('/:id', (req, res) => profesorController.update(req, res));
router.delete('/:id', (req, res) => profesorController.delete(req, res));

module.exports = router;

