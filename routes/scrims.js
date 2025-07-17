const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Scrim, Team, ScrimTeam, Match, MatchResult, User } = require('../models');
const { authenticateToken, requireCreator } = require('../middleware/auth');

// @route   GET /api/scrims
// @desc    Obtener todas las scrims
// @access  Public
router.get('/', async (req, res) => {
  try {
    const scrims = await Scrim.findAll({
      include: [{
        model: Team,
        through: { attributes: [] },
        attributes: ['id', 'name', 'tag']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log('DEBUG GET - Scrims encontradas:', scrims.length);
    if (scrims.length > 0) {
      console.log('Primera scrim:');
      console.log('- Name:', scrims[0].name);
      console.log('- Maps:', scrims[0].maps);
      console.log('- Maps type:', typeof scrims[0].maps);
      console.log('- Maps array?:', Array.isArray(scrims[0].maps));
    }
    
    res.json(scrims);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/scrims/:id
// @desc    Obtener scrim específica
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    console.log('DEBUG - Obteniendo scrim ID:', req.params.id);
    
    const scrim = await Scrim.findByPk(req.params.id, {
      include: [{
        model: Team,
        through: { attributes: ['registeredAt', 'status', 'totalPoints'] },
        attributes: ['id', 'name', 'tag', 'logo', 'players']
      }]
    });
    
    if (!scrim) {
      console.log('DEBUG - Scrim no encontrada');
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    console.log('DEBUG - Scrim encontrada:', {
      id: scrim.id,
      name: scrim.name,
      teamsCount: scrim.Teams ? scrim.Teams.length : 0
    });
    
    if (scrim.Teams && scrim.Teams.length > 0) {
      console.log('DEBUG - Primer team:', {
        id: scrim.Teams[0].id,
        name: scrim.Teams[0].name,
        players: scrim.Teams[0].players,
        playersType: typeof scrim.Teams[0].players
      });
    }
    
    res.json(scrim);
  } catch (error) {
    console.error('DEBUG - Error en GET scrim:', error);
    console.error('DEBUG - Error stack:', error.stack);
    res.status(500).json({ msg: 'Error del servidor: ' + error.message });
  }
});

// @route   POST /api/scrims
// @desc    Crear nueva scrim
// @access  Private (Admin/Creator)
router.post('/', [
  body('name', 'El nombre es requerido').not().isEmpty(),
  body('maps', 'Debe tener al menos 1 mapa').isArray({ min: 1 }),
  body('maxTeams', 'Máximo 12 equipos').isInt({ min: 2, max: 12 })
], async (req, res) => {
  
  // Validar errores
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const {
      name,
      minTeams,
      maxTeams,
      maps,
      pointSystem,
      settings
    } = req.body;
    
    console.log('DEBUG - Datos recibidos:');
    console.log('Maps:', maps);
    console.log('Maps type:', typeof maps);
    console.log('Maps array?:', Array.isArray(maps));
    console.log('Maps length:', maps?.length);
    
    // Crear nueva scrim
    const newScrim = await Scrim.create({
      name,
      creatorId: 1, // TODO: usar req.user.id cuando esté auth
      minTeams: minTeams || 2,
      maxTeams: maxTeams || 12,
      maps: maps,
      pointSystem: pointSystem || {
        placement: {
          first: 12, second: 6, third: 4, fourth: 2, fifth: 1,
          sixth: 0, seventh: 0, eighth: 0, ninth: 0, tenth: 0, eleventh: 0, twelfth: 0
        },
        killPoints: 1
      },
      settings: settings || {}
    });
    
    console.log('DEBUG - Scrim creada:');
    console.log('Maps guardados:', newScrim.maps);
    console.log('Maps type:', typeof newScrim.maps);
    
    res.json(newScrim);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/scrims/:id
// @desc    Actualizar scrim
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const scrim = await Scrim.findByPk(req.params.id, {
      include: [Team]
    });
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Solo permitir edición si está pendiente
    if (scrim.status !== 'pending') {
      return res.status(400).json({ msg: 'No se puede editar una scrim activa' });
    }
    
    // Verificar si se está reduciendo maxTeams
    if (req.body.maxTeams !== undefined) {
      const newMaxTeams = parseInt(req.body.maxTeams);
      const currentTeamsCount = scrim.Teams ? scrim.Teams.length : 0;
      
      if (newMaxTeams < currentTeamsCount) {
        return res.status(400).json({ 
          msg: `No se puede reducir el límite a ${newMaxTeams} equipos. Ya hay ${currentTeamsCount} equipos registrados.` 
        });
      }
    }
    
    // Actualizar campos
    const updateFields = {};
    const allowedFields = ['name', 'minTeams', 'maxTeams', 'maps', 'pointSystem', 'settings', 'status'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });
    
    await scrim.update(updateFields);
    
    res.json(scrim);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/scrims/:id/teams
// @desc    Agregar equipo a scrim
// @access  Public
router.post('/:id/teams', [
  body('teamId', 'ID del equipo es requerido').not().isEmpty()
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const scrim = await Scrim.findByPk(req.params.id, {
      include: [Team]
    });
    const team = await Team.findByPk(req.body.teamId);
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    // Verificar si scrim está pendiente
    if (scrim.status !== 'pending') {
      return res.status(400).json({ msg: 'No se pueden agregar equipos a una scrim activa' });
    }
    
    // Verificar límite de equipos
    if (scrim.Teams && scrim.Teams.length >= scrim.maxTeams) {
      return res.status(400).json({ msg: 'La scrim está llena' });
    }
    
    // Verificar si el equipo ya está registrado
    const existingTeam = await ScrimTeam.findOne({
      where: { scrimId: req.params.id, teamId: req.body.teamId }
    });
    
    if (existingTeam) {
      return res.status(400).json({ msg: 'El equipo ya está registrado' });
    }
    
    // Agregar equipo a la scrim
    await ScrimTeam.create({
      scrimId: req.params.id,
      teamId: req.body.teamId,
      status: 'registered'
    });
    
    res.json({ msg: 'Equipo agregado exitosamente' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/scrims/:id/teams/:teamId
// @desc    Eliminar equipo de scrim (siempre elimina el equipo completamente)
// @access  Public
router.delete('/:id/teams/:teamId', async (req, res) => {
  try {
    const scrim = await Scrim.findByPk(req.params.id);
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Verificar si scrim está pendiente
    if (scrim.status !== 'pending') {
      return res.status(400).json({ msg: 'No se pueden eliminar equipos de una scrim activa' });
    }
    
    // Eliminar relación scrim-equipo
    const result = await ScrimTeam.destroy({
      where: {
        scrimId: req.params.id,
        teamId: req.params.teamId
      }
    });
    
    if (result === 0) {
      return res.status(404).json({ msg: 'Equipo no encontrado en la scrim' });
    }
    
    // SIEMPRE eliminar el equipo completamente (1 equipo = 1 scrim)
    await Team.destroy({
      where: { id: req.params.teamId }
    });
    
    console.log(`Equipo ${req.params.teamId} eliminado completamente de la scrim y del sistema`);
    res.json({ msg: 'Equipo eliminado de la scrim' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/scrims/:id/leaderboard
// @desc    Obtener tabla de posiciones
// @access  Public
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const scrim = await Scrim.findById(req.params.id)
      .populate('teamsRegistered', 'name tag')
      .populate('matches');
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Implementar cálculo de leaderboard
    const leaderboard = await scrim.getLeaderboard();
    
    res.json(leaderboard);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/scrims/:id
// @desc    Eliminar scrim
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const scrim = await Scrim.findByPk(req.params.id, {
      include: [Team]
    });
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Permitir eliminación en cualquier estado
    // (El frontend ya maneja la confirmación con advertencias apropiadas)
    
    // Obtener todos los equipos de esta scrim
    const teamsInThisScrim = scrim.Teams || [];
    const teamIds = teamsInThisScrim.map(team => team.id);
    
    // Eliminar matches y match results asociados si existen
    const { Match, MatchResult } = require('../models');
    const matches = await Match.findAll({ where: { scrimId: scrim.id } });
    const matchIds = matches.map(match => match.id);
    
    // Eliminar match results primero (por foreign key)
    if (matchIds.length > 0) {
      await MatchResult.destroy({ where: { matchId: matchIds } });
    }
    
    // Eliminar matches
    await Match.destroy({ where: { scrimId: scrim.id } });
    
    // Eliminar la scrim (esto también elimina las relaciones ScrimTeam automáticamente)
    await scrim.destroy();
    
    // SIEMPRE eliminar TODOS los equipos de la scrim (1 equipo = 1 scrim)
    if (teamIds.length > 0) {
      await Team.destroy({
        where: { id: teamIds }
      });
      console.log(`Scrim eliminada. También se eliminaron: ${teamIds.length} equipos, ${matchIds.length} matches`);
    }
    
    res.json({ 
      msg: `Scrim eliminada (estado: ${scrim.status})`,
      scrimStatus: scrim.status,
      teamsDeleted: teamIds.length,
      matchesDeleted: matchIds.length,
      matchResultsDeleted: matchIds.length > 0 ? 'Eliminados' : 'Ninguno'
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/scrims/:id/teams
// @desc    Obtener equipos de una scrim específica
// @access  Public
router.get('/:id/teams', async (req, res) => {
  try {
    const scrimId = req.params.id;
    
    // Buscar la scrim con sus equipos
    const scrim = await Scrim.findByPk(scrimId, {
      include: [{
        model: Team,
        through: { 
          attributes: ['registeredAt', 'status', 'totalPoints'] 
        },
        attributes: ['id', 'name', 'tag', 'logo', 'players', 'captain']
      }]
    });
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Devolver solo los equipos
    const teams = scrim.Teams || [];
    
    console.log(`DEBUG - Obteniendo equipos de scrim ${scrimId}:`, teams.length, 'equipos');
    if (teams.length > 0) {
      console.log('DEBUG - Primer equipo:', {
        id: teams[0].id,
        name: teams[0].name,
        players: teams[0].players,
        playersType: typeof teams[0].players
      });
    }
    
    res.json(teams);
    
  } catch (error) {
    console.error('Error al obtener equipos de scrim:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/scrims/:id/status
// @desc    Cambiar estado de la scrim
// @access  Public
router.put('/:id/status', [
  body('status', 'Estado es requerido').isIn(['pending', 'active', 'completed', 'cancelled'])
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const scrim = await Scrim.findByPk(req.params.id);
    
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    const { status } = req.body;
    
    // Validar transiciones de estado
    if (scrim.status === 'completed' && status !== 'completed') {
      return res.status(400).json({ msg: 'No se puede cambiar el estado de una scrim completada' });
    }
    
    if (status === 'active' && scrim.status !== 'pending') {
      return res.status(400).json({ msg: 'Solo se puede activar una scrim pendiente' });
    }
    
    await scrim.update({ status });
    
    res.json({ 
      msg: `Estado de la scrim actualizado a ${status}`,
      scrim 
    });
    
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;