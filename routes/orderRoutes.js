const express = require('express');
const router = express.Router();
const {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    cancelOrder,
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

// @route   PUT /api/orders/:id/pay
// @desc    Update order to paid
// @access  Private
router.put('/:id/pay', auth, updateOrderToPaid);

// @route   PUT /api/orders/:id/deliver
// @desc    Update order to delivered
// @access  Private/Admin
router.put('/:id/deliver', auth, checkRole(['admin']), updateOrderToDelivered);

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', auth, cancelOrder);

// @route   GET /api/orders
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/', auth, checkRole(['admin']), getOrders);

module.exports = router;