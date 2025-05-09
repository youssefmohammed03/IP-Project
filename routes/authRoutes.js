const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, updateUserRole, getAllUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateRegistration, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   PUT /api/auth/role/:id
// @desc    Update user role (testing purposes only)
// @access  Admin only
router.put('/role/:id', auth, checkRole(['admin']), updateUserRole);

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Admin only
router.get('/users', auth, checkRole(['admin']), getAllUsers);

module.exports = router;