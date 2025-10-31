const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ImportController = require('../controllers/ImportController');
const rootPath = path.join(__dirname, '..', '..');

const router = express.Router();
const importController = new ImportController();

// Configuración de almacenamiento temporal para archivos subidos
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
        return cb(new Error('Formato de archivo no permitido. Use CSV o Excel'));
    }
    cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// Endpoint de importación genérico
router.post('/', upload.single('file'), (req, res) => importController.importData(req, res));

module.exports = router;

// Descarga de plantillas
router.get('/template/excel', (req, res) => {
    const filePath = path.join(rootPath, 'EXCEL', 'plantilla_import_estudiantes.xlsx');
    if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Cache-Control', 'no-store');
    return res.download(filePath, 'plantilla_import_estudiantes.xlsx');
});

router.get('/template/csv', (req, res) => {
    const filePath = path.join(rootPath, 'EXCEL', 'plantilla_import_estudiantes.csv');
    if (!fs.existsSync(filePath)) return res.status(404).send('Archivo no encontrado');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.download(filePath, 'plantilla_import_estudiantes.csv');
});


