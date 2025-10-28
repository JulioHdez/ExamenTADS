const express = require('express');
const cors = require('cors');
const { getConnection, mssql } = require('../config/connection');
const Docente = require('../models/Docente');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ message: 'Servidor de prueba funcionando', port: PORT });
});

// Ruta de login
app.post('/api/docentes/login/email', async (req, res) => {
    try {
        console.log('Recibida petición de login:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }
        
        const docenteModel = new Docente();
        const docente = await docenteModel.authenticateByEmail(email, password);
        
        if (docente) {
            res.json({
                success: true,
                message: 'Autenticación exitosa',
                data: docente
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor de prueba ejecutándose en puerto ${PORT}`);
    console.log(`Accede a http://localhost:${PORT}`);
});
