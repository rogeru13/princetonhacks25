
// routes/logs.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Watch = require('../models/Watch');
const LogEntry = require('../models/LogEntry');
const Alert = require('../models/Alert');

// @route   POST api/logs
// @desc    Submit a log entry
// @access  Private (patients only)
router.post('/', auth, async (req, res) => {
  try {
    // Only patients can submit logs
    if (req.user.userType !== 'patient') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const {
      watchId,
      patientId,
      value,
      unit,
      notes,
      feeling,
      image,
      timestamp
    } = req.body;
    
    // Verify patient is submitting their own log
    if (req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Verify watch exists and belongs to this patient
    const watch = await Watch.findById(watchId);
    if (!watch || watch.patientId.toString() !== patientId || !watch.isActive) {
      return res.status(404).json({ message: 'Watch not found or inactive' });
    }
    
    // Create new log entry
    const logEntry = new LogEntry({
      watchId,
      patientId,
      value: parseFloat(value),
      unit,
      notes,
      feeling,
      image,
      timestamp: timestamp || new Date()
    });
    
    // Check if value is abnormal
    if (
      watch.minValue !== undefined && 
      watch.maxValue !== undefined && 
      (logEntry.value < watch.minValue || logEntry.value > watch.maxValue)
    ) {
      logEntry.isAbnormal = true;
      
      // Create alert for abnormal value if alerts are enabled
      if (watch.enableAlerts) {
        const severity = 
          logEntry.value < watch.minValue * 0.8 || logEntry.value > watch.maxValue * 1.2
            ? 'high'
            : logEntry.value < watch.minValue * 0.9 || logEntry.value > watch.maxValue * 1.1
              ? 'medium'
              : 'low';
        
        const alert = new Alert({
          patientId,
          providerId: watch.providerId,
          watchId,
          logEntryId: logEntry._id,
          message: `Abnormal ${watch.name} value: ${logEntry.value} ${logEntry.unit}`,
          severity,
          type: 'abnormal_value'
        });
        
        await alert.save();
      }
    }
    
    await logEntry.save();
    
    res.json(logEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/:id
// @desc    Get a specific log entry
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const logId = req.params.id;
    
    // Find log
    const log = await LogEntry.findById(logId).populate('watchId', 'name providerId patientId');
    if (!log) {
      return res.status(404).json({ message: 'Log entry not found' });
    }
    
    // Verify access (patient who submitted it, provider who created watch, or insurance)
    if (
      req.user.userType === 'patient' && req.user.id !== log.patientId.toString() ||
      req.user.userType === 'provider' && req.user.id !== log.watchId.providerId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json(log);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/logs/watch/:watchId
// @desc    Get log entries for a specific watch
// @access  Private
router.get('/watch/:watchId', auth, async (req, res) => {
  try {
    const watchId = req.params.watchId;
    
    // Verify watch exists
    const watch = await Watch.findById(watchId);
    if (!watch) {
      return res.status(404).json({ message: 'Watch not found' });
    }
    
    // Verify access (patient, provider who created it, or insurance)
    if (
      req.user.userType === 'patient' && req.user.id !== watch.patientId.toString() ||
      req.user.userType === 'provider' && req.user.id !== watch.providerId.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get logs
    const logs = await LogEntry.find({ watchId })
      .sort({ timestamp: -1 });
    
    res.json(logs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;