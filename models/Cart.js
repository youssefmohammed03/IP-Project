const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema],
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
cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate the total cart value
cartSchema.methods.getTotal = function () {
    return this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
};

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;