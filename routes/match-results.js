const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { MatchResult, Match, Team, Scrim } = require('../models');

// @route   POST /api/match-results
// @desc    Crear resultado de partida
// @access  Public
router.post('/', [
  body('matchId', 'ID de partida es requerido').not().isEmpty(),
  body('teamId', 'ID de equipo es requerido').not().isEmpty(),
  body('placement', 'Posición es requerida').isInt({ min: 1, max: 12 }),
  body('kills', 'Kills son requeridos').isInt({ min: 0 }),
  body('points', 'Puntos son requeridos').isInt({ min: 0 })
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { matchId, teamId, placement, kills, points, playerKills } = req.body;
    
    // Verificar que la partida existe
    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ msg: 'Partida no encontrada' });
    }
    
    // Verificar que el equipo existe
    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ msg: 'Equipo no encontrado' });
    }
    
    // Crear nuevo resultado
    const newResult = await MatchResult.create({
      matchId,
      teamId,
      placement,
      kills,
      points,
      playerStats: playerKills || {}
    });
    
    res.json(newResult);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   GET /api/match-results/:matchId
// @desc    Obtener resultados de una partida
// @access  Public
router.get('/:matchId', async (req, res) => {
  try {
    const results = await MatchResult.findAll({
      where: { matchId: req.params.matchId },
      include: [{
        model: Team,
        attributes: ['id', 'name', 'tag', 'players']
      }],
      order: [['placement', 'ASC']]
    });
    
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   PUT /api/match-results/:id
// @desc    Actualizar resultado
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const result = await MatchResult.findByPk(req.params.id);
    
    if (!result) {
      return res.status(404).json({ msg: 'Resultado no encontrado' });
    }
    
    // Actualizar campos permitidos
    const allowedFields = ['placement', 'kills', 'points', 'playerStats'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await result.update(updateData);
    res.json(result);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

// @route   DELETE /api/match-results/:id
// @desc    Eliminar resultado
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const result = await MatchResult.findByPk(req.params.id);
    
    if (!result) {
      return res.status(404).json({ msg: 'Resultado no encontrado' });
    }
    
    await result.destroy();
    res.json({ msg: 'Resultado eliminado' });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
});

module.exports = router;