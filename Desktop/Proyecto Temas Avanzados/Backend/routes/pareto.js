const express = require('express');
const router = express.Router();
const ParetoController = require('../controllers/ParetoController');

const paretoController = new ParetoController();

router.get('/excel-report', paretoController.generateExcelReport.bind(paretoController));

module.exports = router;


