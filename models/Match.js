const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Match = sequelize.define('Match', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  scrimId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'scrims',
      key: 'id'
    }
  },
  mapName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gameNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Estado de la partida
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  },
  // Información adicional
  startTime: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  endTime: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  roomId: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  roomPassword: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  // Screenshots de resultados (JSON)
  screenshots: {
    type: DataTypes.JSON,
    defaultValue: []
    // Ejemplo: [{"url": "image.jpg", "uploadedBy": "admin", "timestamp": "2023-01-01"}]
  },
  // Notas o comentarios
  notes: {
    type: DataTypes.TEXT,
    defaultValue: null
  }
}, {
  timestamps: true,
  tableName: 'matches'
});

// Método para calcular puntos automáticamente
Match.prototype.calculatePoints = async function(scrimPointSystem) {
  const MatchResult = require('./MatchResult');
  
  // Obtener todos los resultados de esta partida
  const results = await MatchResult.findAll({
    where: { matchId: this.id }
  });
  
  // Calcular puntos para cada resultado
  for (const result of results) {
    // Calcular puntos por placement
    result.placementPoints = this.getPlacementPoints(result.placement, scrimPointSystem);
    
    // Calcular puntos por kills
    result.killPoints = result.kills * scrimPointSystem.killPoints;
    
    // Total
    result.totalPoints = result.placementPoints + result.killPoints;
    
    await result.save();
  }
};

// Método helper para obtener puntos por posición
Match.prototype.getPlacementPoints = function(placement, pointSystem) {
  const placementMap = {
    1: pointSystem.placement.first,
    2: pointSystem.placement.second,
    3: pointSystem.placement.third,
    4: pointSystem.placement.fourth,
    5: pointSystem.placement.fifth,
    6: pointSystem.placement.sixth,
    7: pointSystem.placement.seventh,
    8: pointSystem.placement.eighth,
    9: pointSystem.placement.ninth,
    10: pointSystem.placement.tenth,
    11: pointSystem.placement.eleventh,
    12: pointSystem.placement.twelfth
  };
  
  return placementMap[placement] || 0;
};

// Método para iniciar partida
Match.prototype.startMatch = function() {
  this.status = 'in_progress';
  this.startTime = new Date();
  return this.save();
};

// Método para finalizar partida
Match.prototype.endMatch = function() {
  this.status = 'completed';
  this.endTime = new Date();
  return this.save();
};

module.exports = Match;