const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;

        // Validate product ID and quantity
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Quantity must be greater than 0' });
        }

        // Check if product exists and has enough stock
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.countInStock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Find or create cart for the user
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        // Check if product already in cart
        const itemIndex = cart.items.findIndex(item =>
            item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Product exists in cart, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // Product does not exist in cart, add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                name: product.name
            });
        }

        await cart.save();

        // Populate product details before sending response
        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price imagePath'
        });

        res.status(200).json({
            cart: populatedCart,
            total: populatedCart.getTotal()
        });
    } catch (error) {
        console.error('Error in addToCart:', error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get cart for logged in user
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find cart and populate product details
        let cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price imagePath countInStock'
        });

        if (!cart) {
            // Create a new cart if one doesn't exist
            cart = await Cart.create({
                user: userId,
                items: []
            });
        }

        res.status(200).json({
            cart,
            total: cart.getTotal()
        });
    } catch (error) {
        console.error('Error in getCart:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const { itemId } = req.params;
        const userId = req.user.id;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the specific item in the cart
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Check stock availability
        const product = await Product.findById(cart.items[itemIndex].product);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.countInStock < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        // Update quantity
        cart.items[itemIndex].quantity = quantity;

        // Save cart
        await cart.save();

        // Return updated cart with product details
        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price imagePath'
        });

        res.status(200).json({
            cart: populatedCart,
            total: populatedCart.getTotal()
        });
    } catch (error) {
        console.error('Error in updateCartItem:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const userId = req.user.id;

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove item from cart
        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        // Save cart
        await cart.save();

        // Return updated cart with product details
        const populatedCart = await Cart.findById(cart._id).populate({
            path: 'items.product',
            select: 'name price imagePath'
        });

        res.status(200).json({
            cart: populatedCart,
            total: populatedCart.getTotal()
        });
    } catch (error) {
        console.error('Error in removeFromCart:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Clear all items
        cart.items = [];
        await cart.save();

        res.status(200).json({
            message: 'Cart cleared successfully',
            cart,
            total: 0
        });
    } catch (error) {
        console.error('Error in clearCart:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};