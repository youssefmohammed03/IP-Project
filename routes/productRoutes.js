const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addProductReview
} = require('../controllers/productController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get a product by ID
// @access  Public
router.get('/:id', getProductById);

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Admin
router.post('/', auth, checkRole(['admin']), validateProduct, createProduct);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Admin
router.put('/:id', auth, checkRole(['admin']), validateProductUpdate, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Admin
router.delete('/:id', auth, checkRole(['admin']), deleteProduct);

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', auth, addProductReview);

module.exports = router;