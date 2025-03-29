// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Logout user
router.post('/logout', authController.logout);

// Reset password
router.post('/reset-password', authController.resetPassword);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

module.exports = router;