const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

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
router.get('/cart', auth, serveHtmlFile('cart.html'));

// Checkout page
router.get('/checkout', auth, serveHtmlFile('checkout.html'));

// User profile page
router.get('/profile', auth, serveHtmlFile('profile.html'));

// Dashboard page (likely admin only)
router.get('/dashboard', auth, checkRole(['admin']), serveHtmlFile('dashboard.html'));

module.exports = router;