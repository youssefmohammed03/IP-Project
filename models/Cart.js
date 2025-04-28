/**
 * Cart Model
 * 
 * In a real implementation, this would be a database schema
 * For now, we'll use a dummy implementation
 */

// Simulating a database with an array
const carts = [];
let nextId = 1;

const Cart = {
    // Create a new cart
    create: (userId) => {
        const cart = {
            id: nextId++,
            userId,
            items: [],
            subtotal: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        carts.push(cart);
        return cart;
    },

    // Find a cart by user ID
    findByUserId: (userId) => {
        return carts.find(cart => cart.userId === userId);
    },

    // Add item to cart
    addItem: (userId, item) => {
        let cart = Cart.findByUserId(userId);

        // Create cart if it doesn't exist
        if (!cart) {
            cart = Cart.create(userId);
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(i => i.productId === item.productId);

        if (existingItemIndex > -1) {
            // Update quantity if item exists
            cart.items[existingItemIndex].quantity += item.quantity;
        } else {
            // Add new item
            cart.items.push({
                ...item,
                addedAt: new Date()
            });
        }

        // Update subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.updatedAt = new Date();

        return cart;
    },

    // Update item quantity
    updateItemQuantity: (userId, productId, quantity) => {
        const cart = Cart.findByUserId(userId);
        if (!cart) return null;

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) return null;

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.items.splice(itemIndex, 1);
        } else {
            // Update quantity
            cart.items[itemIndex].quantity = quantity;
        }

        // Update subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.updatedAt = new Date();

        return cart;
    },

    // Remove item from cart
    removeItem: (userId, productId) => {
        const cart = Cart.findByUserId(userId);
        if (!cart) return null;

        const itemIndex = cart.items.findIndex(item => item.productId === productId);
        if (itemIndex === -1) return null;

        cart.items.splice(itemIndex, 1);

        // Update subtotal
        cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cart.updatedAt = new Date();

        return cart;
    },

    // Clear cart
    clearCart: (userId) => {
        const cart = Cart.findByUserId(userId);
        if (!cart) return false;

        cart.items = [];
        cart.subtotal = 0;
        cart.updatedAt = new Date();

        return true;
    }
};

module.exports = Cart;