const mongoose = require('mongoose');

const diseaseDetectionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    default: null
  },
  farm_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    default: null
  },
  crop_type: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  image_url: {
    type: String,
    required: true
  },
  image_public_id: {
    type: String,
    default: null,
    maxlength: 255
  },
  detected_disease: {
    type: String,
    required: true,
    maxlength: 255
  },
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  severity_level: {
    type: String,
    enum: ['None', 'Low', 'Moderate', 'High', 'Very High'],
    default: null
  },
  treatment_recommended: {
    type: String,
    default: null
  },
  pesticide_recommended: {
    type: String,
    default: null
  },
  prevention_tips: {
    type: String,
    default: null
  },
  treatment_applied: {
    type: Boolean,
    default: false
  },
  treatment_date: {
    type: Date,
    default: null
  },
  treatment_notes: {
    type: String,
    default: null
  },
  follow_up_required: {
    type: Boolean,
    default: false
  },
  follow_up_date: {
    type: Date,
    default: null
  },
  location: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  weather_conditions: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'disease_detections'
});

// Indexes
diseaseDetectionSchema.index({ user_id: 1 });
diseaseDetectionSchema.index({ crop_id: 1 });
diseaseDetectionSchema.index({ farm_id: 1 });
diseaseDetectionSchema.index({ crop_type: 1 });
diseaseDetectionSchema.index({ detected_disease: 1 });
diseaseDetectionSchema.index({ createdAt: 1 });
diseaseDetectionSchema.index({ treatment_applied: 1 });

const DiseaseDetection = mongoose.model('DiseaseDetection', diseaseDetectionSchema);

module.exports = DiseaseDetection;
