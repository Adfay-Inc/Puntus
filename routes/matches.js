const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Match, MatchResult, Scrim, Team } = require('../models');

// @route   GET /api/matches
// @desc    Obtener todas las partidas o filtrar por scrimId
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { scrimId } = req.query;
    
    const whereClause = scrimId ? { scrimId } : {};
    
    const matches = await Match.findAll({
      where: whereClause,
      include: [
        {
          model: Scrim,
          attributes: ['id', 'name']
        },
        {
          model: MatchResult,
          include: [{
            model: Team,
            attributes: ['id', 'name', 'tag']
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/matches/:id
// @desc    Obtener partida específica
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [
        {
          model: Scrim,
          attributes: ['id', 'name', 'pointSystem']
        },
        {
          model: MatchResult,
          include: [{
            model: Team,
            attributes: ['id', 'name', 'tag']
          }]
        }
      ]
    });
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    res.json(match);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/matches
// @desc    Crear nueva partida
// @access  Public
router.post('/', [
  body('scrimId', 'ID de scrim es requerido').not().isEmpty(),
  body('mapName', 'Nombre del mapa es requerido').not().isEmpty(),
  body('matchNumber', 'Número de partida es requerido').isInt({ min: 1 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { scrimId, mapName, matchNumber, roomId, roomPassword } = req.body;
    
    // Verificar que la scrim existe
    const scrim = await Scrim.findByPk(scrimId);
    if (!scrim) {
      return res.status(404).json({ msg: 'Scrim no encontrada' });
    }
    
    // Crear nueva partida
    const newMatch = await Match.create({
      scrimId,
      mapName,
      gameNumber: matchNumber,
      roomId,
      roomPassword
    });
    
    res.json(newMatch);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/matches/:id
// @desc    Actualizar partida
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    // Actualizar campos permitidos
    const allowedFields = ['mapName', 'roomId', 'roomPassword', 'status', 'notes'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await match.update(updateData);
    res.json(match);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/matches/:id/start
// @desc    Iniciar partida
// @access  Public
router.post('/:id/start', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    if (match.status !== 'pending') {
      return res.status(400).json({ msg: 'La partida ya fue iniciada' });
    }
    
    await match.startMatch();
    res.json({ msg: 'Partida iniciada', match });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/matches/:id/end
// @desc    Finalizar partida
// @access  Public
router.post('/:id/end', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    if (match.status !== 'in_progress') {
      return res.status(400).json({ msg: 'La partida no está en progreso' });
    }
    
    await match.endMatch();
    res.json({ msg: 'Partida finalizada', match });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   POST /api/matches/:id/results
// @desc    Agregar resultados de equipos
// @access  Public
router.post('/:id/results', [
  body('results', 'Los resultados son requeridos').isArray({ min: 1 }),
  body('results.*.teamId', 'ID del equipo es requerido').not().isEmpty(),
  body('results.*.placement', 'Posición es requerida').isInt({ min: 1, max: 12 }),
  body('results.*.kills', 'Kills son requeridos').isInt({ min: 0 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const match = await Match.findByPk(req.params.id, {
      include: [{ model: Scrim, attributes: ['pointSystem'] }]
    });
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    const { results } = req.body;
    
    // Crear resultados para cada equipo
    const createdResults = [];
    for (const result of results) {
      const matchResult = await MatchResult.create({
        matchId: match.id,
        teamId: result.teamId,
        placement: result.placement,
        kills: result.kills,
        playerStats: result.playerStats || [],
        eliminatedBy: result.eliminatedBy || null,
        survivalTime: result.survivalTime || null
      });
      
      createdResults.push(matchResult);
    }
    
    // Calcular puntos automáticamente
    await match.calculatePoints(match.Scrim.pointSystem);
    
    res.json({ 
      msg: 'Resultados agregados exitosamente', 
      results: createdResults 
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/matches/:id/results/:resultId
// @desc    Actualizar resultado específico
// @access  Public
router.put('/:id/results/:resultId', async (req, res) => {
  try {
    const matchResult = await MatchResult.findOne({
      where: { 
        id: req.params.resultId,
        matchId: req.params.id
      }
    });
    
    if (!matchResult) {
      return res.status(404).json({ msg: 'Resultado no encontrado' });
    }
    
    // Actualizar campos permitidos
    const allowedFields = ['placement', 'kills', 'playerStats', 'eliminatedBy', 'survivalTime'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await matchResult.update(updateData);
    
    // Recalcular puntos si es necesario
    if (updateData.placement !== undefined || updateData.kills !== undefined) {
      const match = await Match.findByPk(req.params.id, {
        include: [{ model: Scrim, attributes: ['pointSystem'] }]
      });
      await match.calculatePoints(match.Scrim.pointSystem);
    }
    
    res.json(matchResult);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/matches/:id
// @desc    Eliminar partida
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const match = await Match.findByPk(req.params.id);
    
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    // Eliminar resultados primero
    await MatchResult.destroy({ where: { matchId: req.params.id } });
    
    // Eliminar partida
    await match.destroy();
    
    res.json({ msg: 'Partida eliminada' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;