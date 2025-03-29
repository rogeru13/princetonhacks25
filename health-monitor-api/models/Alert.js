// models/Alert.js
const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  watchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watch'
  },
  logEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LogEntry'
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  type: {
    type: String,
    required: true,
    enum: ['abnormal_value', 'missed_log', 'system']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', AlertSchema);
