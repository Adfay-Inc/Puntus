const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MatchResult = sequelize.define('MatchResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matchId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'matches',
      key: 'id'
    }
  },
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  placement: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12
    }
  },
  kills: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  // Puntos calculados
  placementPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  killPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  
  // Estadísticas detalladas por jugador (JSON)
  playerStats: {
    type: DataTypes.JSON,
    defaultValue: []
    // Ejemplo: [{"playerName": "Player1", "kills": 3, "damage": 1500, "survived": true}]
  },
  
  // Información adicional
  eliminatedBy: {
    type: DataTypes.INTEGER,
    defaultValue: null,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  survivalTime: {
    type: DataTypes.INTEGER, // en segundos
    defaultValue: null
  }
}, {
  timestamps: true,
  tableName: 'match_results'
});

// Método para calcular puntos totales del equipo
MatchResult.prototype.calculateTotalKills = function() {
  if (!this.playerStats || this.playerStats.length === 0) {
    return this.kills;
  }
  
  return this.playerStats.reduce((total, player) => {
    return total + (player.kills || 0);
  }, 0);
};

// Método para obtener jugador con más kills
MatchResult.prototype.getTopFragger = function() {
  if (!this.playerStats || this.playerStats.length === 0) {
    return null;
  }
  
  return this.playerStats.reduce((topPlayer, currentPlayer) => {
    if (!topPlayer || currentPlayer.kills > topPlayer.kills) {
      return currentPlayer;
    }
    return topPlayer;
  }, null);
};

// Método para obtener daño total del equipo
MatchResult.prototype.getTotalDamage = function() {
  if (!this.playerStats || this.playerStats.length === 0) {
    return 0;
  }
  
  return this.playerStats.reduce((total, player) => {
    return total + (player.damage || 0);
  }, 0);
};

// Método para contar supervivientes
MatchResult.prototype.getSurvivors = function() {
  if (!this.playerStats || this.playerStats.length === 0) {
    return [];
  }
  
  return this.playerStats.filter(player => player.survived === true);
};

module.exports = MatchResult;