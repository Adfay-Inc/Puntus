const { sequelize } = require('../config/database');
const Scrim = require('./Scrim');
const Team = require('./Team');
const Match = require('./Match');
const MatchResult = require('./MatchResult');
const ScrimTeam = require('./ScrimTeam');
const User = require('./User');

// Definir relaciones

// Scrim - Team (muchos a muchos)
Scrim.belongsToMany(Team, { through: ScrimTeam, foreignKey: 'scrimId' });
Team.belongsToMany(Scrim, { through: ScrimTeam, foreignKey: 'teamId' });

// Scrim - Match (uno a muchos)
Scrim.hasMany(Match, { foreignKey: 'scrimId' });
Match.belongsTo(Scrim, { foreignKey: 'scrimId' });

// Match - MatchResult (uno a muchos)
Match.hasMany(MatchResult, { foreignKey: 'matchId' });
MatchResult.belongsTo(Match, { foreignKey: 'matchId' });

// Team - MatchResult (uno a muchos)
Team.hasMany(MatchResult, { foreignKey: 'teamId' });
MatchResult.belongsTo(Team, { foreignKey: 'teamId' });

// ScrimTeam - relaciones directas
ScrimTeam.belongsTo(Scrim, { foreignKey: 'scrimId' });
ScrimTeam.belongsTo(Team, { foreignKey: 'teamId' });

// User - Scrim (uno a muchos) - un usuario puede crear múltiples scrims
User.hasMany(Scrim, { foreignKey: 'creatorId' });
Scrim.belongsTo(User, { foreignKey: 'creatorId', as: 'Creator' });

// User - Team (uno a muchos) - un usuario puede crear múltiples equipos
User.hasMany(Team, { foreignKey: 'createdBy' });
Team.belongsTo(User, { foreignKey: 'createdBy', as: 'CreatedBy' });

// Función para sincronizar base de datos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Base de datos sincronizada');
  } catch (error) {
    console.error('Error sincronizando base de datos:', error);
  }
};

module.exports = {
  sequelize,
  Scrim,
  Team,
  Match,
  MatchResult,
  ScrimTeam,
  User,
  syncDatabase
};