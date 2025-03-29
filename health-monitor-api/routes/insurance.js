const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const auth = require('../middleware/auth');

// Get insurance dashboard summary
router.get('/:id/summary', auth, insuranceController.getInsuranceSummary);

// Get high risk patients
router.get('/:id/high-risk-patients', auth, insuranceController.getHighRiskPatients);

// Get analytics data
router.get('/:id/analytics', auth, insuranceController.getAnalyticsData);

// Generate report
router.post('/:id/reports/generate', auth, insuranceController.generateReport);

module.exports = router;
