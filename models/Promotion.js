const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Promotion code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Promotion name is required']
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'buyOneGetOne', 'freeShipping'],
        required: [true, 'Promotion type is required']
    },
    discount: {
        type: Number,
        required: function () {
            return this.type === 'percentage' || this.type === 'fixed';
        },
        min: 0,
        default: 0
    },
    minPurchase: {
        type: Number,
        default: 0,
        min: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: [true, 'Expiry date is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    maxUses: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
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

// Pre-save middleware to update the updatedAt field
promotionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to check if promotion is valid
promotionSchema.methods.isValid = function (subtotal) {
    // Check if promotion is active
    if (!this.isActive) {
        return { valid: false, message: 'Promotion is not active' };
    }

    // Check expiry date
    if (new Date(this.expiryDate) < new Date()) {
        return { valid: false, message: 'Promotion has expired' };
    }

    // Check if maximum uses reached
    if (this.maxUses !== null && this.usedCount >= this.maxUses) {
        return { valid: false, message: 'Promotion usage limit reached' };
    }

    // Check minimum purchase amount
    if (subtotal < this.minPurchase) {
        return {
            valid: false,
            message: `Minimum purchase amount for this promotion is $${this.minPurchase}`
        };
    }

    return { valid: true, promotion: this };
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function (subtotal) {
    if (this.type === 'percentage') {
        return (subtotal * this.discount) / 100;
    } else if (this.type === 'fixed') {
        return this.discount;
    } else if (this.type === 'freeShipping') {
        return 10; // Assume flat shipping cost of $10
    }

    return 0;
};

// Static method to add default promotions
promotionSchema.statics.createDefaultPromotions = async function () {
    try {
        const defaultPromotions = [
            {
                code: 'WELCOME10',
                name: 'Welcome Discount',
                description: 'Get 10% off your first purchase',
                type: 'percentage',
                discount: 10,
                minPurchase: 50,
                expiryDate: new Date('2025-12-31')
            },
            {
                code: 'SAVE20',
                name: 'Save 20%',
                description: 'Get 20% off purchases over $100',
                type: 'percentage',
                discount: 20,
                minPurchase: 100,
                expiryDate: new Date('2025-12-31')
            },
            {
                code: 'FLAT15',
                name: 'Flat $15 Off',
                description: 'Get $15 off your purchase',
                type: 'fixed',
                discount: 15,
                minPurchase: 0,
                expiryDate: new Date('2025-12-31')
            }
        ];

        for (const promo of defaultPromotions) {
            await this.findOneAndUpdate(
                { code: promo.code },
                promo,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
        }

        console.log('Default promotions created or updated');
    } catch (error) {
        console.error('Error creating default promotions:', error);
    }
};

const Promotion = mongoose.model('Promotion', promotionSchema);

// Create default promotions when the application starts
Promotion.createDefaultPromotions();

module.exports = Promotion;