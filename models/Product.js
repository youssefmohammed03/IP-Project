const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Product description is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['electronics', 'clothing', 'books', 'home', 'beauty', 'sports', 'other']
    },
    brand: {
        type: String,
        required: [true, 'Brand is required']
    },
    countInStock: {
        type: Number,
        required: [true, 'Stock count is required'],
        min: [0, 'Stock count cannot be negative'],
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    reviews: [reviewSchema],
    imagePath: {
        type: String,
        default: '/images/default-product.jpg'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    discountExpiry: {
        type: Date,
        default: null
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

// Add index for faster searches
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });

// Virtual field for final price after discount
productSchema.virtual('finalPrice').get(function () {
    // Check if discount is active (has a valid expiry date in the future or no expiry date set)
    const isDiscountActive = !this.discountExpiry || new Date(this.discountExpiry) > new Date();

    // Calculate final price with discount if active
    if (this.discount > 0 && isDiscountActive) {
        return this.price * (1 - this.discount / 100);
    }

    // Return original price if no discount or expired
    return this.price;
});

// Configure the schema to include virtuals when converting to JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update the updatedAt field
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;