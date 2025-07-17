const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware para verificar token JWT en cookies
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acceso denegado. No hay token de autenticación.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o usuario inactivo.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido.' 
    });
  }
};

// Middleware para verificar roles específicos
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario no autenticado.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes permisos para realizar esta acción.' 
      });
    }

    next();
  };
};

// Middleware para verificar si puede crear scrims
const canCreateScrims = (req, res, next) => {
  if (!req.user || !req.user.canCreateScrims()) {
    return res.status(403).json({ 
      success: false, 
      message: 'Solo administradores y creadores pueden crear scrims.' 
    });
  }
  next();
};

// Middleware para verificar si es admin
const requireAdmin = requireRole(['admin']);

// Middleware para verificar si es admin o creator
const requireCreator = requireRole(['admin', 'creator']);

// Middleware opcional - no falla si no hay token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Simplemente continúa sin usuario autenticado
  }
  
  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireCreator,
  canCreateScrims,
  optionalAuth
};