// controllers/providerController.js
const User = require('../models/User');
const Watch = require('../models/Watch');
const LogEntry = require('../models/LogEntry');
const Alert = require('../models/Alert');
const PatientNote = require('../models/PatientNote');

// @route   GET api/providers/:id/summary
// @desc    Get provider dashboard summary
// @access  Private
exports.getProviderSummary = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Verify provider exists
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider') {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    // Verify access (providers can only see their own data)
    if (req.user.id !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get patient count
    const totalPatients = await User.countDocuments({ 
      userType: 'patient',
      // In a real app, we would have a relationship table mapping providers to patients
      // For demo, assume all patients are related to all providers
    });
    
    // Get active watches count
    const activeWatches = await Watch.countDocuments({ 
      providerId,
      isActive: true
    });
    
    // Calculate pending updates
    // Find all watches where today's log is missing
    const watches = await Watch.find({ providerId, isActive: true });
    
    let pendingUpdates = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const watch of watches) {
      const lastLog = await LogEntry.findOne({ watchId: watch._id })
        .sort({ timestamp: -1 })
        .limit(1);
      
      if (!lastLog || new Date(lastLog.timestamp) < today) {
        pendingUpdates++;
      }
    }
    
    // Get recent activities
    const alerts = await Alert.find({ providerId })
      .sort({ timestamp: -1 })
      .limit(5)
      .populate('patientId', 'firstName lastName');
    
    const recentWatches = await Watch.find({ providerId })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('patientId', 'firstName lastName');
    
    // Format activities
    const recentActivities = [
      ...alerts.map(alert => ({
        type: 'alert',
        description: `Alert for ${alert.patientId.firstName} ${alert.patientId.lastName}: ${alert.message}`,
        timestamp: alert.timestamp
      })),
      ...recentWatches.map(watch => ({
        type: 'watch_added',
        description: `Added ${watch.name} watch for ${watch.patientId.firstName} ${watch.patientId.lastName}`,
        timestamp: watch.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);
    
    res.json({
      totalPatients,
      activeWatches,
      pendingUpdates,
      recentActivities
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/providers/:id/alerts
// @desc    Get provider alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Verify provider exists and access rights
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider' || req.user.id !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get alerts
    const alerts = await Alert.find({ providerId })
      .sort({ timestamp: -1 })
      .populate('patientId', 'firstName lastName');
    
    // Format alerts
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      patientId: alert.patientId._id,
      patientName: `${alert.patientId.firstName} ${alert.patientId.lastName}`,
      watchId: alert.watchId,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.timestamp,
      isRead: alert.isRead
    }));
    
    res.json(formattedAlerts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/providers/:id/patients
// @desc    Get provider's patients
// @access  Private
exports.getPatients = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Verify provider exists and access rights
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider' || req.user.id !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get all patients (in a real app, we would filter by relationship)
    const patients = await User.find({ userType: 'patient' }).select('-password');
    
    // Get watches for each patient
    const patientsWithWatches = await Promise.all(patients.map(async (patient) => {
      const watches = await Watch.find({ 
        patientId: patient._id,
        providerId,
        isActive: true
      });
      
      // Check if each watch is updated today
      const watchesWithStatus = await Promise.all(watches.map(async (watch) => {
        const lastLog = await LogEntry.findOne({ watchId: watch._id })
          .sort({ timestamp: -1 })
          .limit(1);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return {
          ...watch.toObject(),
          isUpdatedToday: lastLog && new Date(lastLog.timestamp) >= today
        };
      }));
      
      return {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        watches: watchesWithStatus
      };
    }));
    
    res.json(patientsWithWatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/providers/:id/analytics
// @desc    Get provider analytics
// @access  Private
exports.getAnalytics = async (req, res) => {
  try {
    const providerId = req.params.id;
    const { timeframe } = req.query; // 'week', 'month', 'quarter', 'year'
    
    // Verify provider exists and access rights
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider' || req.user.id !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Define time period for query
    const endDate = new Date();
    let startDate = new Date();
    
    switch (timeframe) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(endDate.getMonth() - 1); // Default to 1 month
    }
    
    // Get watches created within timeframe
    const watches = await Watch.find({
      providerId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Get log entries within timeframe
    const logEntries = await LogEntry.find({
      watchId: { $in: watches.map(watch => watch._id) },
      timestamp: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate compliance rate
    // In a real app, we would calculate this based on expected vs actual log frequency
    const expectedLogs = watches.length * 30; // Simplification: Assuming daily logs for 30 days
    const actualLogs = logEntries.length;
    const compliance = Math.min(Math.round((actualLogs / expectedLogs) * 100), 100);
    
    // Mock risk distribution
    const riskDistribution = {
      low: Math.floor(Math.random() * 50) + 30, // 30-80%
      medium: Math.floor(Math.random() * 30) + 10, // 10-40%
      high: Math.floor(Math.random() * 20) + 5 // 5-25%
    };
    
    // Mock watch type distribution
    const watchTypes = [
      { label: 'Blood Glucose', count: Math.floor(Math.random() * 30) + 5 },
      { label: 'Blood Pressure', count: Math.floor(Math.random() * 25) + 5 },
      { label: 'Weight', count: Math.floor(Math.random() * 20) + 5 },
      { label: 'Heart Rate', count: Math.floor(Math.random() * 15) + 5 },
      { label: 'Temperature', count: Math.floor(Math.random() * 10) + 2 }
    ];
    
    // Mock compliance trend
    const complianceTrend = [];
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 6; i++) {
      complianceTrend.push({
        label: months[(currentMonth - i + 12) % 12],
        rate: Math.floor(Math.random() * 40) + 60 // 60-100%
      });
    }
    complianceTrend.reverse();
    
    res.json({
      compliance,
      riskDistribution,
      watchTypes,
      complianceTrend,
      insights: [
        {
          title: 'Improved Compliance',
          type: 'positive',
          description: 'Patient compliance has improved by 12% over the last month.'
        },
        {
          title: 'High Risk Alerts',
          type: 'negative',
          description: 'Three patients have consistently shown abnormal values.'
        }
      ],
      highRiskCount: Math.floor(Math.random() * 5) + 1, // 1-6
      activeWatches: watches.length
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/watches
// @desc    Add a new health watch
// @access  Private
exports.addWatch = async (req, res) => {
  try {
    const { 
      providerId, 
      patientId, 
      name, 
      type, 
      frequency,
      unit,
      minValue,
      maxValue,
      instructions,
      enableAlerts,
      startDate
    } = req.body;
    
    // Verify provider exists and access rights
    const provider = await User.findById(providerId);
    if (!provider || provider.userType !== 'provider' || req.user.id !== providerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Create new watch
    const watch = new Watch({
      providerId,
      patientId,
      name,
      type,
      frequency,
      unit,
      minValue,
      maxValue,
      instructions,
      enableAlerts,
      startDate: startDate || new Date()
    });
    
    await watch.save();
    
    res.json(watch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/patients/:id/notes
// @desc    Add a note to a patient's record
// @access  Private
exports.addPatientNote = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { content } = req.body;
    
    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.userType !== 'patient') {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Verify provider exists and access rights
    if (req.user.userType !== 'provider') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const provider = await User.findById(req.user.id);
    
    // Create new note
    const note = new PatientNote({
      patientId,
      authorId: req.user.id,
      authorName: provider.lastName,
      content
    });
    
    await note.save();
    
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
