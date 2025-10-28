const express = require('express');
const router = express.Router();
const ExportController = require('../controllers/ExportController');

const exportController = new ExportController();

// Ruta para exportar datos según el formato y tipo seleccionado
router.post('/', (req, res) => exportController.exportData(req, res));

// Ruta para descargar CSV directo
router.get('/download-csv/:dataType', (req, res) => exportController.downloadCSV(req, res));

module.exports = router;
