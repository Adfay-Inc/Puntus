const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Tabla de unión para la relación muchos-a-muchos entre Scrims y Teams
const ScrimTeam = sequelize.define('ScrimTeam', {
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
  teamId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teams',
      key: 'id'
    }
  },
  // Fecha de registro
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Estado del equipo en la scrim
  status: {
    type: DataTypes.ENUM('registered', 'confirmed', 'disqualified', 'withdrew'),
    defaultValue: 'registered'
  },
  // Posición final en la scrim (calculada al final)
  finalPosition: {
    type: DataTypes.INTEGER,
    defaultValue: null
  },
  // Puntos totales en la scrim
  totalPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Estadísticas totales
  totalKills: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalMatches: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Mejor posición obtenida
  bestPlacement: {
    type: DataTypes.INTEGER,
    defaultValue: null
  }
}, {
  timestamps: true,
  tableName: 'scrim_teams',
  indexes: [
    {
      unique: true,
      fields: ['scrimId', 'teamId']
    }
  ]
});

// Método para actualizar estadísticas
ScrimTeam.prototype.updateStats = async function() {
  const MatchResult = require('./MatchResult');
  const Match = require('./Match');
  
  // Obtener todos los resultados de este equipo en esta scrim
  const results = await MatchResult.findAll({
    where: { teamId: this.teamId },
    include: [{
      model: Match,
      where: { scrimId: this.scrimId }
    }]
  });
  
  // Calcular estadísticas
  this.totalPoints = results.reduce((sum, result) => sum + result.totalPoints, 0);
  this.totalKills = results.reduce((sum, result) => sum + result.kills, 0);
  this.totalMatches = results.length;
  this.bestPlacement = results.length > 0 ? Math.min(...results.map(r => r.placement)) : null;
  
  return this.save();
};

module.exports = ScrimTeam;