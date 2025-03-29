// routes/watches.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Watch = require('../models/Watch');
const User = require('../models/User');
const LogEntry = require('../models/LogEntry');

// @route   GET api/watches/:id
// @desc    Get watch details
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const watchId = req.params.id;
    
    // Find watch
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
    
    // Get provider name
    const provider = await User.findById(watch.providerId);
    
    // Get last log entry
    const lastLog = await LogEntry.findOne({ watchId })
      .sort({ timestamp: -1 })
      .limit(1);
    
    // Format watch details
    const watchDetails = {
      id: watch._id,
      name: watch.name,
      type: watch.type,
      frequency: watch.frequency,
      unit: watch.unit,
      minValue: watch.minValue,
      maxValue: watch.maxValue,
      instructions: watch.instructions,
      normalRange: watch.minValue && watch.maxValue ? `${watch.minValue}-${watch.maxValue} ${watch.unit}` : undefined,
      providerName: provider ? provider.lastName : 'Unknown',
      lastLogValue: lastLog ? lastLog.value : null,
      lastLogDate: lastLog ? lastLog.timestamp : null
    };
    
    res.json(watchDetails);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/watches/:id
// @desc    Update a watch
// @access  Private (providers only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'provider') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const watchId = req.params.id;
    const {
      name,
      frequency,
      minValue,
      maxValue,
      instructions,
      enableAlerts,
      isActive,
      endDate
    } = req.body;
    
    // Find watch
    const watch = await Watch.findById(watchId);
    if (!watch) {
      return res.status(404).json({ message: 'Watch not found' });
    }
    
    // Verify provider created this watch
    if (req.user.id !== watch.providerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update watch
    const updatedWatch = await Watch.findByIdAndUpdate(
      watchId,
      {
        name: name || watch.name,
        frequency: frequency || watch.frequency,
        minValue: minValue !== undefined ? minValue : watch.minValue,
        maxValue: maxValue !== undefined ? maxValue : watch.maxValue,
        instructions: instructions || watch.instructions,
        enableAlerts: enableAlerts !== undefined ? enableAlerts : watch.enableAlerts,
        isActive: isActive !== undefined ? isActive : watch.isActive,
        endDate: endDate || watch.endDate
      },
      { new: true }
    );
    
    res.json(updatedWatch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/watches/:id
// @desc    Delete a watch
// @access  Private (providers only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'provider') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const watchId = req.params.id;
    
    // Find watch
    const watch = await Watch.findById(watchId);
    if (!watch) {
      return res.status(404).json({ message: 'Watch not found' });
    }
    
    // Verify provider created this watch
    if (req.user.id !== watch.providerId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // For safety reasons, we'll set isActive to false rather than deleting
    watch.isActive = false;
    watch.endDate = new Date();
    await watch.save();
    
    res.json({ message: 'Watch deactivated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
