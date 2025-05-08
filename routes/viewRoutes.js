const express = require('express');
const router = express.Router();
const path = require('path');

// Helper function to serve HTML files
const serveHtmlFile = (fileName) => {
    return (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend', fileName));
    };
};

// Home page
router.get('/', serveHtmlFile('index.html'));

// Login page
router.get('/login', serveHtmlFile('login.html'));

// Products listing page
router.get('/products', serveHtmlFile('products.html'));

// Single product page
router.get('/product/:id', serveHtmlFile('product.html'));

// Cart page
router.get('/cart', serveHtmlFile('cart.html'));

// Checkout page
router.get('/checkout', serveHtmlFile('checkout.html'));

// Orders page
router.get('/orders', serveHtmlFile('orders.html'));

// User profile page
router.get('/profile', serveHtmlFile('profile.html'));

// Dashboard page (likely admin only)
router.get('/dashboard', serveHtmlFile('dashboard.html'));

module.exports = router;