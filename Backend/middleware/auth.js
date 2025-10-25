const jwt = require('jsonwebtoken');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }
        req.user = user;
        next();
    });
};

// Middleware para verificar roles (ejemplo básico)
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Permisos insuficientes'
            });
        }

        next();
    };
};

// Middleware para verificar si es administrador
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Se requieren permisos de administrador'
        });
    }
    next();
};

// Middleware para verificar si es docente
const requireDocente = (req, res, next) => {
    if (!req.user || req.user.role !== 'docente') {
        return res.status(403).json({
            success: false,
            message: 'Se requieren permisos de docente'
        });
    }
    next();
};

// Middleware para verificar si es estudiante
const requireEstudiante = (req, res, next) => {
    if (!req.user || req.user.role !== 'estudiante') {
        return res.status(403).json({
            success: false,
            message: 'Se requieren permisos de estudiante'
        });
    }
    next();
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireDocente,
    requireEstudiante,
    optionalAuth
};
