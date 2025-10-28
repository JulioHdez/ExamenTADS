const express = require('express');
const router = express.Router();
const DocenteController = require('../controllers/DocenteController');

const docenteController = new DocenteController();

// Rutas de autenticación
router.post('/login/email', (req, res) => docenteController.loginByEmail(req, res));
router.post('/login/num-empleado', (req, res) => docenteController.loginByNumEmpleado(req, res));

// Rutas básicas CRUD
router.get('/', (req, res) => docenteController.getAll(req, res));
router.get('/active', (req, res) => docenteController.getActive(req, res));
router.get('/num-empleado/:numEmpleado', (req, res) => docenteController.getByNumEmpleado(req, res));
router.get('/especialidad/:especialidad', (req, res) => docenteController.getByEspecialidad(req, res));
router.get('/:id/grupos', (req, res) => docenteController.getGrupos(req, res));
router.get('/:id/calificaciones', (req, res) => docenteController.getCalificacionesRegistradas(req, res));
router.get('/:id/stats', (req, res) => docenteController.getStats(req, res));
router.get('/:id', (req, res) => docenteController.getById(req, res));
router.post('/', (req, res) => docenteController.create(req, res));
router.post('/with-password', (req, res) => docenteController.createWithPassword(req, res));
router.put('/:id', (req, res) => docenteController.update(req, res));
router.put('/:id/password', (req, res) => docenteController.updatePassword(req, res));
router.delete('/:id', (req, res) => docenteController.delete(req, res));

module.exports = router;
