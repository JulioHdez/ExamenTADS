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
    res.json({ 
        message: 'Servidor funcionando', 
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Ruta de login
app.post('/api/docentes/login/email', async (req, res) => {
    try {
        console.log('🔐 Recibida petición de login:', req.body);
        
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }
        
        // Conectar a la base de datos
        const pool = await getConnection();
        console.log('✅ Conexión a BD establecida');
        
        const docenteModel = new Docente();
        const docente = await docenteModel.authenticateByEmail(email, password);
        
        if (docente) {
            console.log('✅ Login exitoso para:', email);
            res.json({
                success: true,
                message: 'Autenticación exitosa',
                data: docente
            });
        } else {
            console.log('❌ Login fallido para:', email);
            res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
});

// Ruta de prueba de conexión
app.get('/api/test-connection', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT 1 as test');
        res.json({
            success: true,
            message: 'Conexión a BD exitosa',
            data: result.recordset
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error de conexión a BD',
            error: error.message
        });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📡 Accede a http://localhost:${PORT}`);
    console.log(`🔐 Login: http://localhost:${PORT}/api/docentes/login/email`);
    console.log(`🧪 Test: http://localhost:${PORT}/api/test-connection`);
});
