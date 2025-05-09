const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToShipped,
    cancelOrder,
    requestRefund,
    processRefund,
    getOrders
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { validateOrder } = require('../middleware/validation');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, validateOrder, createOrder);

// @route   GET /api/orders/myorders
// @desc    Get all orders for current user
// @access  Private
router.get('/myorders', auth, getMyOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, getOrderById);

// @route   PUT /api/orders/:id/ship
// @desc    Update order to shipped (Admin only)
// @access  Private/Admin
router.put('/:id/ship', auth, checkRole(['admin']), updateOrderToShipped);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', auth, cancelOrder);

// @route   PUT /api/orders/:id/request-refund
// @desc    Request a refund for a delivered order
// @access  Private
router.put('/:id/request-refund', auth, requestRefund);

// @route   PUT /api/orders/:id/process-refund
// @desc    Process (approve or deny) a refund request (Admin only)
// @access  Private/Admin
router.put('/:id/process-refund', auth, checkRole(['admin']), processRefund);

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', auth, checkRole(['admin']), getOrders);

module.exports = router;