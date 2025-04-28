const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    // Database configuration would go here in a real implementation
    // DB_URI: process.env.DB_URI || 'mongodb://localhost:27017/ecommerce',
};