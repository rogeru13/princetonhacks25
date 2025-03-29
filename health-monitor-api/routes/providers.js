const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Get provider dashboard summary
router.get('/:id/summary', auth, providerController.getProviderSummary);

// Get provider alerts
router.get('/:id/alerts', auth, providerController.getAlerts);

// Get provider's patients
router.get('/:id/patients', auth, providerController.getPatients);

// Get provider analytics
router.get('/:id/analytics', auth, providerController.getAnalytics);

module.exports = router;