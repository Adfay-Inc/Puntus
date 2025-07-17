const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Team = sequelize.define('Team', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING(4),
    allowNull: false,
    validate: {
      len: [1, 4]
    }
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL del logo del equipo'
  },
  // Información del capitán (JSON)
  captain: {
    type: DataTypes.JSON,
    defaultValue: {
      name: null,
      uid: null,
      discord: null
    }
  },
  // Jugadores del equipo (JSON)
  players: {
    type: DataTypes.JSON,
    defaultValue: [],
    get() {
      const rawValue = this.getDataValue('players');
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
      this.setDataValue('players', value);
    }
    // Ejemplo: ["Jugador1", "Jugador2"] o [{"name": "Player1", "uid": "123", "role": "IGL"}]
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'teams'
});

// Método para verificar si el equipo está completo
Team.prototype.isComplete = function() {
  const activePlayers = this.players.filter(p => p.isActive);
  return activePlayers.length >= 4;
};

// Método para obtener solo jugadores activos
Team.prototype.getActivePlayers = function() {
  return this.players.filter(p => p.isActive);
};

// Método para agregar jugador
Team.prototype.addPlayer = function(playerData) {
  // Validar que no exceda el límite
  if (this.players.length >= 6) { // 4 principales + 2 suplentes
    throw new Error('El equipo ya tiene el máximo de jugadores');
  }
  
  // Validar UID único
  const existingPlayer = this.players.find(p => p.uid === playerData.uid);
  if (existingPlayer) {
    throw new Error('Ya existe un jugador con ese UID');
  }
  
  const newPlayer = {
    name: playerData.name,
    uid: playerData.uid,
    role: playerData.role || 'Support',
    discord: playerData.discord || null,
    isActive: true
  };
  
  this.players.push(newPlayer);
  return this.save();
};

// Método para remover jugador
Team.prototype.removePlayer = function(uid) {
  this.players = this.players.filter(p => p.uid !== uid);
  return this.save();
};

// Método para actualizar jugador
Team.prototype.updatePlayer = function(uid, updateData) {
  const playerIndex = this.players.findIndex(p => p.uid === uid);
  if (playerIndex === -1) {
    throw new Error('Jugador no encontrado');
  }
  
  // Actualizar campos permitidos
  const allowedFields = ['name', 'role', 'discord', 'isActive'];
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      this.players[playerIndex][field] = updateData[field];
    }
  });
  
  return this.save();
};

module.exports = Team;