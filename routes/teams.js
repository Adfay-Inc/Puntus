const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Team, ScrimTeam, Scrim } = require('../models');

// @route   GET /api/teams
// @desc    Obtener todos los equipos
// @access  Public
router.get('/', async (req, res) => {
  try {
    const teams = await Team.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.json(teams);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/teams/:id
// @desc    Obtener equipo específico
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    res.json(team);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/teams
// @desc    Crear nuevo equipo
// @access  Public
router.post('/', [
  body('name', 'El nombre es requerido').not().isEmpty(),
  body('tag', 'El tag es requerido').not().isEmpty().isLength({ max: 4 }),
  body('logo', 'Logo debe ser una cadena válida').optional().isString()
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { name, tag, logo, players } = req.body;
    
    console.log('🔍 BACKEND - Datos recibidos:');
    console.log('Name:', name);
    console.log('Tag:', tag);
    console.log('Logo:', logo);
    console.log('Logo type:', typeof logo);
    console.log('Logo length:', logo?.length);
    console.log('Logo truthy?:', !!logo);
    console.log('Players:', players);
    
    // Verificar si el tag ya existe
    const existingTeam = await Team.findOne({ where: { tag: tag.toUpperCase() } });
    if (existingTeam) {
      return res.status(400).json({ msg: 'El tag ya está en uso' });
    }
    
    // Crear nuevo equipo
    // Logo por defecto si no se proporciona o está vacío
    const defaultLogo = 'https://via.placeholder.com/64x64/6366f1/ffffff?text=' + tag.toUpperCase()
    const finalLogo = (logo && logo.trim() !== '') ? logo : defaultLogo
    
    console.log('🎨 BACKEND - Logo final a usar:', finalLogo);
    
    const newTeam = await Team.create({
      name,
      tag: tag.toUpperCase(),
      logo: finalLogo,
      captain: null,
      players: players || []
    });
    
    console.log('DEBUG Team - Equipo creado:');
    console.log('Players guardados:', newTeam.players);
    
    res.json(newTeam);
    
  } catch (error) {
    console.error('DEBUG Teams POST - Error completo:', error);
    console.error('DEBUG Teams POST - Error message:', error.message);
    console.error('DEBUG Teams POST - Error stack:', error.stack);
    res.status(500).json({ msg: 'Error del servidor: ' + error.message });
  }
});

// @route   PUT /api/teams/:id
// @desc    Actualizar equipo
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    console.log('DEBUG UPDATE - Team antes:', {
      id: team.id,
      name: team.name,
      tag: team.tag,
      players: team.players,
      playersType: typeof team.players
    });
    
    console.log('DEBUG UPDATE - Datos recibidos:', req.body);
    
    // Actualizar campos permitidos
    const allowedFields = ['name', 'tag', 'logo', 'captain', 'players'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Si se actualiza el tag, verificar que no esté en uso
    if (updateData.tag) {
      updateData.tag = updateData.tag.toUpperCase();
      const existingTeam = await Team.findOne({ 
        where: { 
          tag: updateData.tag,
          id: { [Op.ne]: req.params.id }
        }
      });
      if (existingTeam) {
        return res.status(400).json({ msg: 'El tag ya está en uso' });
      }
    }
    
    await team.update(updateData);
    
    console.log('DEBUG UPDATE - Team después:', {
      id: team.id,
      name: team.name,
      tag: team.tag,
      players: team.players,
      playersType: typeof team.players
    });
    
    res.json(team);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/teams/:id/players
// @desc    Agregar jugador al equipo
// @access  Public
router.post('/:id/players', [
  body('name', 'El nombre es requerido').not().isEmpty(),
  body('uid', 'El UID es requerido').not().isEmpty(),
  body('role', 'El rol es requerido').isIn(['IGL', 'Fragger', 'Support', 'Sniper', 'Substitute'])
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    // Usar el método del modelo para agregar jugador
    await team.addPlayer(req.body);
    
    res.json({ msg: 'Jugador agregado exitosamente', team });
    
  } catch (error) {
    console.error(error);
    if (error.message.includes('El equipo ya tiene') || error.message.includes('Ya existe un jugador')) {
      return res.status(400).json({ msg: error.message });
    }
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/teams/:id/players/:uid
// @desc    Actualizar jugador del equipo
// @access  Public
router.put('/:id/players/:uid', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    // Usar el método del modelo para actualizar jugador
    await team.updatePlayer(req.params.uid, req.body);
    
    res.json({ msg: 'Jugador actualizado exitosamente', team });
    
  } catch (error) {
    console.error(error);
    if (error.message.includes('Jugador no encontrado')) {
      return res.status(404).json({ msg: error.message });
    }
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/teams/:id/players/:uid
// @desc    Remover jugador del equipo
// @access  Public
router.delete('/:id/players/:uid', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    // Usar el método del modelo para remover jugador
    await team.removePlayer(req.params.uid);
    
    res.json({ msg: 'Jugador removido exitosamente' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/teams/:id/scrims
// @desc    Obtener scrims del equipo
// @access  Public
router.get('/:id/scrims', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id, {
      include: [{
        model: Scrim,
        through: { attributes: ['registeredAt', 'status', 'totalPoints'] }
      }]
    });
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    res.json(team.Scrims);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/teams/:id
// @desc    Eliminar equipo
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    await team.destroy();
    res.json({ msg: 'Equipo eliminado' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;