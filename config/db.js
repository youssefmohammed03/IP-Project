const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;