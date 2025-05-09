const jwt = require('jsonwebtoken');
const config = require('../config/config');

const auth = (req, res, next) => {
    try {
        // Get token from header - supports multiple formats
        let token;
        const authHeader = req.header('Authorization');

        console.log('Auth header:', authHeader);

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

        console.log('Token extracted:', token ? token.substring(0, 20) + '...' : 'No token');

        if (!token) {
            console.log('No token provided');
            res.redirect('/login');
            return;
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
        console.error('Auth error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(500).json({ message: 'Server authentication error' });
    }
};

module.exports = auth;