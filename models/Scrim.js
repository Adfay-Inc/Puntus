const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Scrim = sequelize.define('Scrim', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Configuración de equipos
  minTeams: {
    type: DataTypes.INTEGER,
    defaultValue: 2,
    validate: {
      min: 2
    }
  },
  maxTeams: {
    type: DataTypes.INTEGER,
    defaultValue: 12,
    validate: {
      max: 12
    }
  },
  
  // Configuración de mapas (JSON)
  maps: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('maps');
      // Si es string, intentar parsearlo
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return [];
        }
      }
      return rawValue || [];
    },
    set(value) {
      // Asegurar que siempre se guarde como JSON válido
      this.setDataValue('maps', value);
    }
    // Ejemplo: ["Bermuda", "Purgatorio", "Kalahari"]
  },
  
  // Sistema de puntuación (JSON)
  pointSystem: {
    type: DataTypes.JSON,
    defaultValue: {
      placement: {
        first: 12,
        second: 6,
        third: 4,
        fourth: 2,
        fifth: 1,
        sixth: 0,
        seventh: 0,
        eighth: 0,
        ninth: 0,
        tenth: 0,
        eleventh: 0,
        twelfth: 0
      },
      killPoints: 1
    },
    get() {
      const rawValue = this.getDataValue('pointSystem');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return this.defaultValue;
        }
      }
      return rawValue || this.defaultValue;
    },
    set(value) {
      this.setDataValue('pointSystem', value);
    }
  },
  
  // Estado de la scrim
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  
  // Configuración adicional (JSON)
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      password: null,
      isPrivate: false,
      discordChannel: null,
      rules: null,
      maxPlayersPerTeam: 4,
      allowSubstitutes: true
    },
    get() {
      const rawValue = this.getDataValue('settings');
      if (typeof rawValue === 'string') {
        try {
          return JSON.parse(rawValue);
        } catch (e) {
          return this.defaultValue;
        }
      }
      return rawValue || this.defaultValue;
    },
    set(value) {
      this.setDataValue('settings', value);
    }
  }
}, {
  timestamps: true,
  tableName: 'scrims'
});

// Método para calcular puntuación total de un equipo
Scrim.prototype.calculateTeamScore = async function(teamId) {
  // Implementa el cálculo de puntuación
  // Suma puntos de placement + kills de todas las partidas
  const Match = require('./Match');
  
  const matches = await Match.findAll({
    where: { scrimId: this.id },
    include: [{
      model: require('./MatchResult'),
      where: { teamId: teamId }
    }]
  });
  
  let totalScore = 0;
  
  for (const match of matches) {
    if (match.MatchResults && match.MatchResults.length > 0) {
      totalScore += match.MatchResults[0].totalPoints;
    }
  }
  
  return totalScore;
};

// Método para obtener tabla de posiciones
Scrim.prototype.getLeaderboard = async function() {
  // Implementa la tabla de posiciones
  const Team = require('./Team');
  const teams = await this.getTeams();
  
  const leaderboard = [];
  
  for (const team of teams) {
    const score = await this.calculateTeamScore(team.id);
    
    // Calcular estadísticas adicionales
    const matches = await Match.findAll({
      where: { scrimId: this.id },
      include: [{
        model: require('./MatchResult'),
        where: { teamId: team.id }
      }]
    });
    
    let totalKills = 0;
    let totalPlacement = 0;
    let matchesPlayed = matches.length;
    
    for (const match of matches) {
      if (match.MatchResults && match.MatchResults.length > 0) {
        totalKills += match.MatchResults[0].kills;
        totalPlacement += match.MatchResults[0].placement;
      }
    }
    
    leaderboard.push({
      team: team,
      totalScore: score,
      totalKills: totalKills,
      avgPlacement: matchesPlayed > 0 ? (totalPlacement / matchesPlayed).toFixed(2) : 0,
      matchesPlayed: matchesPlayed
    });
  }
  
  // Ordenar por puntuación total
  return leaderboard.sort((a, b) => b.totalScore - a.totalScore);
};

module.exports = Scrim;