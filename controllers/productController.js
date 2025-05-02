const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            brand,
            countInStock,
            imagePath,
            isFeatured,
            discount
        } = req.body;

        // Validate input data
        if (!name || !description || !price || !category || !brand) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            price,
            category,
            brand,
            countInStock: countInStock || 0,
            imagePath: imagePath || '/images/default-product.jpg',
            isFeatured: isFeatured || false,
            discount: discount || 0
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error in createProduct:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            search,
            featured,
            sort,
            limit = 10,
            page = 1
        } = req.query;

        // Build filter object
        const filter = {};

        if (category) filter.category = category;
        if (minPrice && maxPrice) {
            filter.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        } else if (minPrice) {
            filter.price = { $gte: parseFloat(minPrice) };
        } else if (maxPrice) {
            filter.price = { $lte: parseFloat(maxPrice) };
        }

        if (featured === 'true') filter.isFeatured = true;

        // Text search if provided
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        let sortOptions = {};
        if (sort) {
            const sortParts = sort.split(':');
            if (sortParts.length === 2) {
                sortOptions[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
            }
        } else {
            // Default sort by newest
            sortOptions = { createdAt: -1 };
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination metadata
        const total = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error in getProductById:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found - invalid ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Use findByIdAndUpdate instead of save() to bypass validation for required fields
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { ...req.body, updatedAt: Date.now() },
            { new: true, runValidators: false }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found - invalid ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // Find and delete product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Product not found - invalid ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        // Validate rating input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Get user information
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize reviews array if it doesn't exist
        if (!Array.isArray(product.reviews)) {
            product.reviews = [];
        }

        // Create review object
        const newReview = {
            user: userId,
            name: user.name,
            rating: Number(rating),
            comment: comment || '',
            createdAt: Date.now()
        };

        // Add review to product
        product.reviews.push(newReview);

        // Update product rating average
        product.rating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;

        // Update review count
        product.numReviews = product.reviews.length;

        // Save product with new review
        await product.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review: newReview,
            productRating: product.rating,
            numReviews: product.numReviews
        });

    } catch (error) {
        console.error('Error in addProductReview:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid product ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Apply discount to a product
// @route   PUT /api/products/:id/discount
// @access  Private/Admin
const applyDiscount = async (req, res) => {
    try {
        const { discount, expiryDate } = req.body;
        const productId = req.params.id;

        // Validate discount input
        if (discount === undefined || discount === null) {
            return res.status(400).json({ message: 'Please provide a discount value' });
        }

        if (isNaN(discount) || discount < 0 || discount > 100) {
            return res.status(400).json({ message: 'Discount must be a number between 0 and 100' });
        }

        // Find the product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Set discount and optionally discount expiry date
        product.discount = Number(discount);

        if (expiryDate) {
            const expiry = new Date(expiryDate);
            if (isNaN(expiry.getTime())) {
                return res.status(400).json({ message: 'Invalid expiry date format' });
            }

            // Add discountExpiry field if not already in the schema
            product.discountExpiry = expiry;
        } else if (discount > 0) {
            // If no expiry provided but discount applied, set default expiry to 30 days
            const defaultExpiry = new Date();
            defaultExpiry.setDate(defaultExpiry.getDate() + 30);
            product.discountExpiry = defaultExpiry;
        } else {
            // If discount is 0 (removing discount), remove expiry date too
            product.discountExpiry = null;
        }

        // Save product with new discount
        product.price = product.price * (1 - product.discount / 100); // Update price based on discount
        await product.save();

        // Send success response
        res.status(200).json({
            success: true,
            message: discount > 0 ? 'Discount applied successfully' : 'Discount removed successfully',
            product: {
                _id: product._id,
                name: product.name,
                price: product.price,
                discount: product.discount,
                discountExpiry: product.discountExpiry,
                finalPrice: product.price * (1 - product.discount / 100)
            }
        });

    } catch (error) {
        console.error('Error in applyDiscount:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Invalid product ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addProductReview,
    applyDiscount
};