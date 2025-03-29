
// controllers/insuranceController.js
const User = require('../models/User');
const Watch = require('../models/Watch');
const LogEntry = require('../models/LogEntry');

// @route   GET api/insurance/:id/summary
// @desc    Get insurance dashboard summary
// @access  Private
exports.getInsuranceSummary = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    
    // Verify insurance exists and access rights
    const insurance = await User.findById(insuranceId);
    if (!insurance || insurance.userType !== 'insurance' || req.user.id !== insuranceId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get total patients (members)
    const totalPatients = await User.countDocuments({ userType: 'patient' });
    
    // Get active watches
    const activeWatches = await Watch.countDocuments({ isActive: true });
    
    // Calculate high risk patients (mock data)
    const highRiskCount = Math.floor(totalPatients * 0.15); // Assume 15% are high risk
    
    // Calculate mock compliance rate
    const complianceRate = Math.floor(Math.random() * 30) + 70; // 70-100%
    
    // Mock risk distribution data
    const riskDistribution = {
      low: Math.floor(totalPatients * 0.6), // 60% low risk
      medium: Math.floor(totalPatients * 0.25), // 25% medium risk
      high: highRiskCount // ~15% high risk
    };
    
    res.json({
      totalPatients,
      activeWatches,
      highRiskCount,
      complianceRate,
      riskDistribution
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/insurance/:id/high-risk-patients
// @desc    Get high risk patients for insurance
// @access  Private
exports.getHighRiskPatients = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    
    // Verify insurance exists and access rights
    const insurance = await User.findById(insuranceId);
    if (!insurance || insurance.userType !== 'insurance' || req.user.id !== insuranceId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get all patients (in a real app, we would filter by risk assessment)
    const patients = await User.find({ userType: 'patient' }).select('-password');
    
    // For demo purposes, assign random risk levels
    const highRiskPatients = patients.map(patient => {
      const riskLevel = Math.random() > 0.7 ? 'high' : 'medium'; // 30% high, 70% medium
      
      return {
        id: patient._id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        riskLevel,
        watchCount: Math.floor(Math.random() * 5) + 1 // 1-6 watches
      };
    }).filter(p => p.riskLevel === 'high');
    
    res.json(highRiskPatients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/insurance/:id/analytics
// @desc    Get analytics data for insurance
// @access  Private
exports.getAnalyticsData = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    const days = req.query.days || 30; // Default to 30 days
    
    // Verify insurance exists and access rights
    const insurance = await User.findById(insuranceId);
    if (!insurance || insurance.userType !== 'insurance' || req.user.id !== insuranceId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Define time period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(days));
    
    // Mock risk trend data
    const riskTrend = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = 0; i < 6; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      riskTrend.push({
        label: months[monthIndex],
        highRiskPercentage: Math.floor(Math.random() * 10) + 10, // 10-20%
        mediumRiskPercentage: Math.floor(Math.random() * 15) + 20, // 20-35%
        lowRiskPercentage: Math.floor(Math.random() * 15) + 50 // 50-65%
      });
    }
    riskTrend.reverse();
    
    // Mock compliance trend data
    const complianceTrend = riskTrend.map(item => ({
      label: item.label,
      rate: Math.floor(Math.random() * 20) + 75 // 75-95%
    }));
    
    // Mock cost savings data
    const costSavings = [
      { category: 'Prevention', amount: Math.floor(Math.random() * 5000) + 10000 },
      { category: 'Early Detection', amount: Math.floor(Math.random() * 8000) + 15000 },
      { category: 'Reduced ER', amount: Math.floor(Math.random() * 12000) + 20000 },
      { category: 'Medication', amount: Math.floor(Math.random() * 3000) + 5000 }
    ];
    
    // Mock insights
    const insights = [
      {
        title: 'High Compliance Rate',
        type: 'positive',
        description: 'Member compliance has reached 85%, reducing emergency visits.'
      },
      {
        title: 'Cost Reduction',
        type: 'positive',
        description: 'Preventive monitoring has reduced costs by approximately 12%.'
      },
      {
        title: 'Risk Distribution Improvement',
        type: 'positive',
        description: 'High-risk membership has decreased from 18% to 15% over 3 months.'
      }
    ];
    
    res.json({
      riskTrend,
      complianceTrend,
      costSavings,
      insights,
      averageCost: Math.floor(Math.random() * 500) + 1500, // $1500-2000 per member
      totalSavings: costSavings.reduce((sum, item) => sum + item.amount, 0)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/insurance/:id/reports/generate
// @desc    Generate a report
// @access  Private
exports.generateReport = async (req, res) => {
  try {
    const insuranceId = req.params.id;
    
    // Verify insurance exists and access rights
    const insurance = await User.findById(insuranceId);
    if (!insurance || insurance.userType !== 'insurance' || req.user.id !== insuranceId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // In a real app, we would generate a PDF report
    // For demo purposes, just return success
    res.json({
      reportId: Math.random().toString(36).substr(2, 9),
      status: 'generated',
      timestamp: new Date(),
      downloadUrl: '/api/reports/download/sample-report.pdf'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
