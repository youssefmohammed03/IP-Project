const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = (req, res, next) => {
    try {
        // Get token from header - supports multiple formats
        let token;
        const authHeader = req.header('Authorization');

        if (authHeader) {
            // Format: "Bearer [token]" or just the token
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            } else {
                token = authHeader;
            }
        }

        // Also check for token in query string or cookies for API flexibility
        if (!token) {
            token = req.query.token || (req.cookies && req.cookies.token);
        }

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // Log token information for debugging
        console.log('Token decoded:', {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        });

        // Add user from payload
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;