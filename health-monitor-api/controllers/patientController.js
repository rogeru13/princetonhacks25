// controllers/patientController.js
const User = require('../models/User');
const Watch = require('../models/Watch');
const LogEntry = require('../models/LogEntry');
const Alert = require('../models/Alert');
const PatientNote = require('../models/PatientNote');

// @route   GET api/patients/:id/watches
// @desc    Get patient's assigned health watches
// @access  Private
exports.getPatientWatches = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify access (only the patient or their provider can access)
    if (req.user.userType === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get watches
    const watches = await Watch.find({ 
      patientId,
      isActive: true
    }).populate('providerId', 'firstName lastName');
    
    // Get last log entry for each watch
    const watchesWithStatus = await Promise.all(watches.map(async (watch) => {
      const lastLog = await LogEntry.findOne({ watchId: watch._id })
        .sort({ timestamp: -1 })
        .limit(1);
      
      // Check if the watch has been logged today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isLoggedToday = lastLog && new Date(lastLog.timestamp) >= today;
      
      return {
        id: watch._id,
        name: watch.name,
        type: watch.type,
        frequency: watch.frequency,
        unit: watch.unit,
        minValue: watch.minValue,
        maxValue: watch.maxValue,
        instructions: watch.instructions,
        providerName: `${watch.providerId.firstName} ${watch.providerId.lastName}`,
        startDate: watch.startDate,
        lastLogDate: lastLog ? lastLog.timestamp : null,
        lastLogValue: lastLog ? lastLog.value : null,
        isLoggedToday: isLoggedToday
      };
    }));
    
    res.json(watchesWithStatus);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/patients/:id/logs/recent
// @desc    Get patient's recent log entries
// @access  Private
exports.getRecentLogs = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify access (only the patient or their provider can access)
    if (req.user.userType === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get recent logs
    const logs = await LogEntry.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('watchId', 'name');
    
    const formattedLogs = logs.map(log => ({
      id: log._id,
      watchId: log.watchId._id,
      watchName: log.watchId.name,
      value: log.value,
      unit: log.unit,
      notes: log.notes,
      feeling: log.feeling,
      image: log.image,
      timestamp: log.timestamp,
      isAbnormal: log.isAbnormal
    }));
    
    res.json(formattedLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/patients/:id/logs/history
// @desc    Get patient's log history within date range
// @access  Private
exports.getLogHistory = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { startDate, endDate } = req.query;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify access (only the patient or their provider can access)
    if (req.user.userType === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Build date range query
    const dateQuery = {};
    if (startDate) dateQuery['$gte'] = new Date(startDate);
    if (endDate) dateQuery['$lte'] = new Date(endDate);
    
    // Get logs within date range
    const logs = await LogEntry.find({ 
      patientId,
      ...(Object.keys(dateQuery).length > 0 ? { timestamp: dateQuery } : {})
    })
      .sort({ timestamp: -1 })
      .populate('watchId', 'name');
    
    const formattedLogs = logs.map(log => ({
      id: log._id,
      watchId: log.watchId._id,
      watchName: log.watchId.name,
      value: log.value,
      unit: log.unit,
      notes: log.notes,
      feeling: log.feeling,
      image: log.image,
      timestamp: log.timestamp,
      isAbnormal: log.isAbnormal
    }));
    
    res.json(formattedLogs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/patients/:id/profile
// @desc    Update patient profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify access (only the patient can update their own profile)
    if (req.user.userType === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { firstName, lastName, dateOfBirth } = req.body;
    
    // Update patient profile
    const updatedPatient = await User.findByIdAndUpdate(
      patientId,
      { 
        firstName: firstName || patient.firstName,
        lastName: lastName || patient.lastName,
        dateOfBirth: dateOfBirth || patient.dateOfBirth
      },
      { new: true }
    ).select('-password');
    
    res.json(updatedPatient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT api/patients/:id/notifications
// @desc    Update patient notification settings
// @access  Private
exports.updateNotificationSettings = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify access (only the patient can update their own notification settings)
    if (req.user.id !== patientId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // In a real app, we would update notification settings in a separate model
    // For demo purposes, we'll just return success
    res.json({ message: 'Notification settings updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/patients/:id/details
// @desc    Get detailed patient information (for providers)
// @access  Private
exports.getPatientDetails = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get watches
    const watches = await Watch.find({ patientId, isActive: true });
    
    // Get last log for each watch
    const watchesWithStatus = await Promise.all(watches.map(async (watch) => {
      const lastLog = await LogEntry.findOne({ watchId: watch._id })
        .sort({ timestamp: -1 })
        .limit(1);
      
      // Check if logged today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isUpdatedToday = lastLog && new Date(lastLog.timestamp) >= today;
      
      return {
        id: watch._id,
        name: watch.name,
        type: watch.type,
        frequency: watch.frequency,
        unit: watch.unit,
        minValue: watch.minValue,
        maxValue: watch.maxValue,
        isUpdatedToday,
        lastUpdated: lastLog ? lastLog.timestamp : null
      };
    }));
    
    // Get patient notes
    const notes = await PatientNote.find({ patientId })
      .sort({ timestamp: -1 });
    
    // Format patient data
    const patientDetails = {
      id: patient._id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      email: patient.email,
      watches: watchesWithStatus,
      notes
    };
    
    res.json(patientDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/patients/:id/risk-assessment
// @desc    Get patient risk assessment (for insurance)
// @access  Private
exports.getRiskAssessment = async (req, res) => {
  try {
    const patientId = req.params.id;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // In a real app, we would calculate risk based on log history and health metrics
    // For demo purposes, we'll return mock data
    const riskAssessment = {
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      riskScore: Math.floor(Math.random() * 100),
      riskLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      complianceRate: Math.floor(Math.random() * 100),
      riskFactors: [
        { name: 'Blood Glucose', status: Math.random() > 0.5 ? 'normal' : 'elevated' },
        { name: 'Blood Pressure', status: Math.random() > 0.5 ? 'normal' : 'elevated' },
        { name: 'Heart Rate', status: Math.random() > 0.5 ? 'normal' : 'elevated' }
      ],
      recommendations: [
        'Maintain consistent monitoring schedule',
        'Follow prescribed medication regimen',
        'Schedule regular provider check-ins'
      ]
    };
    
    res.json(riskAssessment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

