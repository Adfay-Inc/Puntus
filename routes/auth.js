const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Función para generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Función para configurar cookie
const setCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  });
};

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', [
  body('username', 'El nombre de usuario es requerido').isLength({ min: 3, max: 50 }),
  body('email', 'Email válido es requerido').isEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  body('role', 'Rol inválido').optional().isIn(['admin', 'creator', 'user'])
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { username, email, password, role, profile } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El usuario o email ya existe.' 
      });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      username,
      email,
      password,
      role: role || 'user',
      profile: profile || {}
    });

    // Generar token
    const token = generateToken(newUser.id);
    setCookie(res, token);

    // Actualizar último login
    await newUser.updateLastLogin();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token: token,  // Agregar token al JSON response
      user: newUser.getPublicProfile()
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', [
  body('email', 'Email válido es requerido').isEmail(),
  body('password', 'La contraseña es requerida').exists()
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credenciales inválidas.' 
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Credenciales inválidas.' 
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cuenta desactivada.' 
      });
    }

    // Generar token
    const token = generateToken(user.id);
    setCookie(res, token);

    // Actualizar último login
    await user.updateLastLogin();

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token: token,  // Agregar token al JSON response
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// @route   GET /api/auth/me
// @desc    Obtener perfil del usuario actual
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil
// @access  Private
router.put('/profile', authenticateToken, [
  body('username', 'El nombre de usuario debe tener entre 3 y 50 caracteres').optional().isLength({ min: 3, max: 50 }),
  body('email', 'Email válido es requerido').optional().isEmail(),
  body('profile.displayName', 'El nombre debe tener menos de 100 caracteres').optional().isLength({ max: 100 }),
  body('profile.discordTag', 'Discord tag inválido').optional().matches(/^.{3,32}#\d{4}$/),
  body('profile.freeFireUID', 'UID de Free Fire inválido').optional().isNumeric().isLength({ min: 6, max: 12 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { username, email, profile } = req.body;
    const user = req.user;

    // Verificar si el username/email ya existe (excluyendo el usuario actual)
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: user.id } },
            {
              [Op.or]: [
                username ? { username } : {},
                email ? { email } : {}
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'El usuario o email ya existe.' 
        });
      }
    }

    // Actualizar campos
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (profile) {
      updateData.profile = { ...user.profile, ...profile };
    }

    await user.update(updateData);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

// @route   PUT /api/auth/password
// @desc    Cambiar contraseña
// @access  Private
router.put('/password', authenticateToken, [
  body('currentPassword', 'La contraseña actual es requerida').exists(),
  body('newPassword', 'La nueva contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'La contraseña actual es incorrecta.' 
      });
    }

    // Actualizar contraseña
    await user.update({ password: newPassword });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error del servidor' 
    });
  }
});

module.exports = router;