const express = require('express');
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    processRefund,
    getAllOrders
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { validateOrder } = require('../middleware/validation');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, validateOrder, createOrder);

// @route   GET /api/orders
// @desc    Get all orders for current user
// @access  Private
router.get('/', auth, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', auth, checkRole(['admin']), updateOrderStatus);

// @route   POST /api/orders/:id/refund
// @desc    Process refund
// @access  Private/Admin
router.post('/:id/refund', auth, checkRole(['admin']), processRefund);

// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/admin/all', auth, checkRole(['admin']), getAllOrders);

module.exports = router;