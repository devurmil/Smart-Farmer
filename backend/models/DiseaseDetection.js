const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiseaseDetection = sequelize.define('DiseaseDetection', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  crop_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'crops',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  farm_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'farms',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  crop_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  image_public_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Cloudinary public ID for image management'
  },
  detected_disease: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  severity_level: {
    type: DataTypes.ENUM('None', 'Low', 'Moderate', 'High', 'Very High'),
    allowNull: true
  },
  treatment_recommended: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pesticide_recommended: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  prevention_tips: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  treatment_applied: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  treatment_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  treatment_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  follow_up_required: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  follow_up_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  location: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'GPS coordinates where image was taken'
  },
  weather_conditions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Weather at time of detection'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Verified by agricultural expert'
  }
}, {
  tableName: 'disease_detections',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['crop_id']
    },
    {
      fields: ['farm_id']
    },
    {
      fields: ['crop_type']
    },
    {
      fields: ['detected_disease']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['treatment_applied']
    }
  ]
});

module.exports = DiseaseDetection;