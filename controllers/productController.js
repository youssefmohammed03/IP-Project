const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;

        // Validate input data
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // Create product
        const product = Product.create({
            name,
            description,
            price,
            category,
            stock: stock || 0,
            images: images || []
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Error in createProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => {
    try {
        const { category, minPrice, maxPrice, search } = req.query;

        // Apply filters if any
        const filters = {};
        if (category) filters.category = category;
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
        if (search) filters.search = search;

        const products = Product.findAll(filters);

        res.status(200).json(products);
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = (req, res) => {
    try {
        const product = Product.findById(parseInt(req.params.id));

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = (req, res) => {
    try {
        const { name, description, price, category, stock, images } = req.body;
        const productId = parseInt(req.params.id);

        // Check if product exists
        if (!Product.findById(productId)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Update product
        const updatedProduct = Product.update(productId, {
            name,
            description,
            price,
            category,
            stock,
            images
        });

        res.status(200).json(updatedProduct);
    } catch (error) {
        console.error('Error in updateProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = (req, res) => {
    try {
        const productId = parseInt(req.params.id);

        // Check if product exists
        if (!Product.findById(productId)) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete product
        const result = Product.delete(productId);

        if (result) {
            res.status(200).json({ message: 'Product deleted successfully' });
        } else {
            res.status(500).json({ message: 'Failed to delete product' });
        }
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = parseInt(req.params.id);
        const userId = req.user.id;

        // Validate input
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Please provide a rating between 1 and 5' });
        }

        // Check if product exists
        const product = Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Add review
        const review = {
            userId,
            rating,
            comment: comment || '',
            userName: req.user.name // In a real app, this would come from the user record
        };

        const result = Product.addReview(productId, review);

        if (result) {
            // Get updated product
            const updatedProduct = Product.findById(productId);
            res.status(201).json(updatedProduct);
        } else {
            res.status(500).json({ message: 'Failed to add review' });
        }
    } catch (error) {
        console.error('Error in addProductReview:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addProductReview
};