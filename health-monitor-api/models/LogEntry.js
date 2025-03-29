// models/LogEntry.js
const mongoose = require('mongoose');

const LogEntrySchema = new mongoose.Schema({
  watchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Watch',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  notes: {
    type: String
  },
  feeling: {
    type: Number,
    min: 1,
    max: 5
  },
  image: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isAbnormal: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('LogEntry', LogEntrySchema);

