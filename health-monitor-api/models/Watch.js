
// models/Watch.js
const mongoose = require('mongoose');

const WatchSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'every_other_day', 'weekly', 'multiple_daily']
  },
  unit: {
    type: String,
    required: true
  },
  minValue: {
    type: Number
  },
  maxValue: {
    type: Number
  },
  instructions: {
    type: String
  },
  enableAlerts: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Watch', WatchSchema);

