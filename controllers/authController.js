const bcrypt = require('bcrypt');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = User.create({
            name,
            email,
            password: hashedPassword,
            role: 'customer'
        });

        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;

        // Generate JWT token
        const token = generateToken(user);

        res.status(200).json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = (req, res) => {
    try {
        const user = User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error in getCurrentUser:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user role (for testing purposes only)
// @route   PUT /api/auth/role/:id
// @access  admin
const updateUserRole = (req, res) => {
    try {
        const { role } = req.body;
        const userId = parseInt(req.params.id);

        // Validate role
        if (!role || (role !== 'admin' && role !== 'customer')) {
            return res.status(400).json({ message: 'Invalid role. Must be "admin" or "customer"' });
        }

        // Find and update user
        const user = User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user role
        user.role = role;
        user.updatedAt = new Date();

        // Remove password from response
        const userResponse = { ...user };
        delete userResponse.password;

        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error in updateUserRole:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    updateUserRole
};