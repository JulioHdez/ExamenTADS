const express = require('express');
const router = express.Router();
const PreferenciaAccesibilidadController = require('../controllers/PreferenciaAccesibilidadController');
const { authenticateToken } = require('../middleware/auth');

const controller = new PreferenciaAccesibilidadController();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener preferencias del usuario autenticado
router.get('/me', (req, res) => controller.getMyPreferences(req, res));

// Guardar preferencias del usuario autenticado
router.post('/me', (req, res) => controller.saveMyPreferences(req, res));

// Actualizar una preferencia específica
router.patch('/me', (req, res) => controller.updatePreferencia(req, res));

module.exports = router;

