const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
const generateToken = (user) => {
    const payload = {
        id: user.id || user._id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });
};

module.exports = {
    generateToken
};