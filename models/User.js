const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Static method to create default admin
userSchema.statics.createDefaultAdmin = async function() {
    try {
        const adminExists = await this.findOne({ role: 'admin' });
        if (!adminExists) {
            await this.create({
                name: 'System Admin',
                email: 'admin@system.com',
                password: 'admin123', // Will be hashed by pre-save middleware
                role: 'admin'
            });
            console.log('Default admin user created with email: admin@system.com and password: admin123');
        }
    } catch (error) {
        console.error('Error creating default admin:', error);
    }
};

const User = mongoose.model('User', userSchema);

// Create default admin user
User.createDefaultAdmin();

module.exports = User;