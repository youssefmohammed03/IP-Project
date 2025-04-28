const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Please provide a valid product ID and quantity' });
        }

        // Check if product exists and has enough stock
        const product = Product.findById(parseInt(productId));
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Add item to cart
        const cartItem = {
            productId: parseInt(productId),
            name: product.name,
            price: product.price,
            quantity: parseInt(quantity),
            image: product.images[0] || ''
        };

        const cart = Cart.addItem(userId, cartItem);

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error in addToCart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
const getCart = (req, res) => {
    try {
        const userId = req.user.id;
        const cart = Cart.findByUserId(userId);

        if (!cart) {
            // If no cart exists, create an empty one
            const newCart = Cart.create(userId);
            return res.status(200).json(newCart);
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
const updateCartItem = (req, res) => {
    try {
        const { quantity } = req.body;
        const productId = parseInt(req.params.productId);
        const userId = req.user.id;

        // Validate input
        if (!quantity || quantity < 0) {
            return res.status(400).json({ message: 'Please provide a valid quantity' });
        }

        // Check if product exists
        const product = Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (quantity > 0 && product.stock < quantity) {
            return res.status(400).json({ message: 'Not enough stock available' });
        }

        // Update cart item
        const cart = Cart.updateItemQuantity(userId, productId, quantity);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found or product not in cart' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error in updateCartItem:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeFromCart = (req, res) => {
    try {
        const productId = parseInt(req.params.productId);
        const userId = req.user.id;

        // Remove item from cart
        const cart = Cart.removeItem(userId, productId);

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found or product not in cart' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = (req, res) => {
    try {
        const userId = req.user.id;

        // Clear cart
        const result = Cart.clearCart(userId);

        if (!result) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Error in clearCart:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
    clearCart
};