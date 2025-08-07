const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Can be null for social logins
    validate: {
      len: [6, 255]
    }
  },
  profile_picture: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Cloudinary URL for user profile picture'
  },
  facebook_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Facebook user ID for social login'
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Google user ID for social login'
  },
  login_method: {
    type: DataTypes.ENUM('email', 'facebook', 'google'),
    defaultValue: 'email',
    allowNull: false
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('farmer', 'owner', 'supplier'),
    allowNull: true, // Allow null initially for social login users
    defaultValue: 'farmer',
  },
  role_selection_pending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Indicates if user needs to select their role (for social logins)'
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password') && user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;