const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema({
  farm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    default: null
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  temperature_max: {
    type: Number,
    default: null
  },
  temperature_min: {
    type: Number,
    default: null
  },
  temperature_avg: {
    type: Number,
    default: null
  },
  humidity: {
    type: Number,
    default: null
  },
  rainfall: {
    type: Number,
    default: null
  },
  wind_speed: {
    type: Number,
    default: null
  },
  wind_direction: {
    type: String,
    default: null,
    maxlength: 10
  },
  pressure: {
    type: Number,
    default: null
  },
  uv_index: {
    type: Number,
    default: null
  },
  visibility: {
    type: Number,
    default: null
  },
  weather_condition: {
    type: String,
    default: null,
    maxlength: 100
  },
  weather_icon: {
    type: String,
    default: null,
    maxlength: 10
  },
  sunrise: {
    type: String,
    default: null
  },
  sunset: {
    type: String,
    default: null
  },
  data_source: {
    type: String,
    default: 'openweather',
    maxlength: 50
  },
  is_forecast: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'weather_data'
});

// Indexes
weatherDataSchema.index({ farm_id: 1 });
weatherDataSchema.index({ date: 1 });
weatherDataSchema.index({ is_forecast: 1 });
weatherDataSchema.index({ farm_id: 1, date: 1, is_forecast: 1 }, { unique: true });

const WeatherData = mongoose.model('WeatherData', weatherDataSchema);

module.exports = WeatherData;
