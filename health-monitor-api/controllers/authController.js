// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/default');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType, specialization, companyName } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      userType,
      specialization: userType === 'provider' ? specialization : undefined,
      companyName: userType === 'insurance' ? companyName : undefined
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userType: user.userType,
          userData: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            specialization: user.specialization,
            companyName: user.companyName
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Create and return JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: config.jwtExpire },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userType: user.userType,
          userData: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            specialization: user.specialization,
            companyName: user.companyName
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/logout
// @desc    Log out user (token invalidation is client-side)
// @access  Public
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT architecture, logout is primarily client-side
    // We just return success here for API consistency
    return res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST api/auth/reset-password
// @desc    Send password reset email
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // In a real app, generate a reset token and send email
    // For demo purposes, we'll just return success
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

