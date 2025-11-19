const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  type: {
    type: String,
    enum: ['routine', 'repair', 'inspection', 'upgrade', 'emergency'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  completedDate: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: null
  },
  cost: {
    type: Number,
    default: null,
    min: 0
  },
  technician: {
    type: String,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
  collection: 'maintenance'
});

// Indexes
maintenanceSchema.index({ equipmentId: 1 });
maintenanceSchema.index({ scheduledDate: 1 });
maintenanceSchema.index({ status: 1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

module.exports = Maintenance;
