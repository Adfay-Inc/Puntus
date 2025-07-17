const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 100]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'creator', 'user'),
    defaultValue: 'user'
  },
  profile: {
    type: DataTypes.JSON,
    defaultValue: {
      displayName: null,
      avatar: null,
      discordTag: null,
      freeFireUID: null,
      bio: null
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verificationToken: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    defaultValue: null
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    defaultValue: null
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para verificar contraseña
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
User.prototype.getPublicProfile = function() {
  return {
    id: this.id,
    username: this.username,
    email: this.email,
    role: this.role,
    profile: this.profile,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt
  };
};

// Método para verificar si es admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Método para verificar si puede crear scrims
User.prototype.canCreateScrims = function() {
  return this.role === 'admin' || this.role === 'creator';
};

// Método para actualizar último login
User.prototype.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = User;