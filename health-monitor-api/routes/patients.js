const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get patient's assigned health watches
router.get('/:id/watches', auth, patientController.getPatientWatches);

// Get patient's recent log entries
router.get('/:id/logs/recent', auth, patientController.getRecentLogs);

// Get patient's log history
router.get('/:id/logs/history', auth, patientController.getLogHistory);

// Update patient profile
router.put('/:id/profile', auth, patientController.updateProfile);

// Update notification settings
router.put('/:id/notifications', auth, patientController.updateNotificationSettings);

// Get detailed patient information (for providers)
router.get('/:id/details', auth, patientController.getPatientDetails);

// Get patient risk assessment (for insurance)
router.get('/:id/risk-assessment', auth, patientController.getRiskAssessment);

module.exports = router;