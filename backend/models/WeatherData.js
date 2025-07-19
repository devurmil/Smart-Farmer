const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WeatherData = sequelize.define('WeatherData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  farm_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'farms',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  location: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Stores {lat, lng, city, country}'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  temperature_max: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Maximum temperature in Celsius'
  },
  temperature_min: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Minimum temperature in Celsius'
  },
  temperature_avg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Average temperature in Celsius'
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Humidity percentage'
  },
  rainfall: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    comment: 'Rainfall in mm'
  },
  wind_speed: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Wind speed in km/h'
  },
  wind_direction: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Wind direction (N, NE, E, SE, S, SW, W, NW)'
  },
  pressure: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: true,
    comment: 'Atmospheric pressure in hPa'
  },
  uv_index: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    comment: 'UV index'
  },
  visibility: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Visibility in km'
  },
  weather_condition: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Weather description (sunny, cloudy, rainy, etc.)'
  },
  weather_icon: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Weather icon code'
  },
  sunrise: {
    type: DataTypes.TIME,
    allowNull: true
  },
  sunset: {
    type: DataTypes.TIME,
    allowNull: true
  },
  data_source: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'openweather',
    comment: 'Source of weather data'
  },
  is_forecast: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'True if this is forecast data, false for historical'
  }
}, {
  tableName: 'weather_data',
  indexes: [
    {
      fields: ['farm_id']
    },
    {
      fields: ['date']
    },
    {
      fields: ['is_forecast']
    },
    {
      unique: true,
      fields: ['farm_id', 'date', 'is_forecast']
    }
  ]
});

module.exports = WeatherData;