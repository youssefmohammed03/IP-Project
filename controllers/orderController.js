const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { validateCoupon, calculateDiscount } = require('../utils/promotions');
const { calculateOrderTotals } = require('../utils/shipping');

// @desc    Create a new order (checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = (req, res) => {
  try {
    const { shippingAddress, paymentMethod, shippingMethod, couponCode } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: 'Please provide shipping address and payment method' });
    }

    // Get user's cart
    const cart = Cart.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Check if all products are in stock
    for (const item of cart.items) {
      const product = Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `${product ? product.name : 'A product'} does not have enough stock`
        });
      }
    }

    // Apply coupon if provided
    let discount = null;
    if (couponCode) {
      const couponValidation = validateCoupon(couponCode, cart.subtotal);
      if (couponValidation.valid) {
        discount = {
          code: couponCode,
          amount: calculateDiscount(couponValidation.coupon, cart.subtotal)
        };
      } else {
        return res.status(400).json({ message: couponValidation.message });
      }
    }

    // Calculate order totals including shipping and tax
    const totals = calculateOrderTotals(
      cart.items, 
      shippingAddress, 
      shippingMethod || 'standard', 
      discount
    );

    // Create order
    const order = Order.create({
      userId,
      items: cart.items,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      discount: totals.discount,
      total: totals.total,
      paymentMethod,
      shippingAddress,
      shippingMethod: shippingMethod || 'standard',
      couponCode: discount ? couponCode : null
    });

    // Update product stock
    cart.items.forEach(item => {
      Product.updateStock(item.productId, -item.quantity);
    });

    // Clear cart
    Cart.clearCart(userId);

    // Process payment (in a real app, this would integrate with a payment gateway)
    // For now, we'll simulate a successful payment
    const paymentResult = {
      id: 'PAY' + Date.now(),
      status: 'completed',
      updateTime: new Date(),
      email: req.user.email
    };

    // Update order with payment result
    order.paymentResult = paymentResult;
    order.status = 'paid';
    order.updatedAt = new Date();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders for the current user
// @route   GET /api/orders
// @access  Private
const getUserOrders = (req, res) => {
  try {
    const orders = Order.findByUserId(req.user.id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = (req, res) => {
  try {
    const order = Order.findById(parseInt(req.params.id));
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Make sure the user is authorized to view this order
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = (req, res) => {
  try {
    const { status } = req.body;
    const orderId = parseInt(req.params.id);

    // Check if order exists
    const order = Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update order status
    const updatedOrder = Order.updateStatus(orderId, status);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process refund
// @route   POST /api/orders/:id/refund
// @access  Private/Admin
const processRefund = (req, res) => {
  try {
    const { reason, amount } = req.body;
    const orderId = parseInt(req.params.id);

    // Check if order exists
    const order = Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Validate refund amount
    if (!amount || amount <= 0 || amount > order.total) {
      return res.status(400).json({ message: 'Invalid refund amount' });
    }

    // Process refund
    const refundData = {
      amount,
      reason: reason || 'Customer request',
      refundId: 'REF' + Date.now()
    };

    const updatedOrder = Order.processRefund(orderId, refundData);

    // Update product stock (return items to inventory)
    order.items.forEach(item => {
      Product.updateStock(item.productId, item.quantity);
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in processRefund:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all orders (admin only)
// @route   GET /api/orders/admin
// @access  Private/Admin
const getAllOrders = (req, res) => {
  try {
    const orders = Order.findAll();
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  processRefund,
  getAllOrders
};