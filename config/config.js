const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '24h',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce'
};