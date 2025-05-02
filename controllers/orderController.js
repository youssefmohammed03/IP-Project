const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateShipping, calculateTax } = require('../utils/shipping');
const { applyPromotions } = require('../utils/promotions');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, promoCode } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        message: 'Shipping address and payment method are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order items from cart items
    const orderItems = cart.items.map(item => {
      return {
        product: item.product._id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        image: item.product.imagePath
      };
    });

    // Calculate prices
    const itemsPrice = orderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Calculate shipping based on address and items
    const shippingPrice = calculateShipping(shippingAddress, orderItems);

    // Apply promotions if promo code exists
    const promotionResult = await applyPromotions(
      itemsPrice,
      promoCode
    );

    // Check if promotion code is valid (if one was provided)
    if (promoCode && !promotionResult.isValid) {
      return res.status(400).json({
        message: promotionResult.message || 'Invalid promotion code'
      });
    }

    // Calculate tax based on the shipping country
    const taxPrice = calculateTax(shippingAddress, promotionResult.finalPrice);

    const totalPrice = promotionResult.finalPrice + shippingPrice + taxPrice;

    // Create the order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discount: promotionResult.discount,
      totalPrice,
      promoCode: promoCode || ''
    });

    // Update product stock
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      product.countInStock -= item.quantity;
      await product.save();
    }

    // Clear the cart after creating the order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders for admin
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .sort('-createdAt');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getMyOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the logged in user or user is admin
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to paid (Admin only)
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order payment status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: Date.now().toString(),
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: 'admin@example.com'
    };

    // Update order status to processing once paid
    order.status = 'processing';

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderToPaid:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private (Both admin and order owner)
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the logged in user or user is admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Check if order is paid (can't mark unpaid orders as delivered)
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Cannot mark unpaid order as delivered' });
    }

    // Update order delivery status
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    // Update order status to delivered
    order.status = 'delivered';

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderToDelivered:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order to shipped (Admin only)
// @route   PUT /api/orders/:id/ship
// @access  Private/Admin
const updateOrderToShipped = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is paid (can't ship unpaid orders)
    if (!order.isPaid) {
      return res.status(400).json({ message: 'Cannot ship unpaid order' });
    }

    // Check if order is already delivered
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Order is already delivered' });
    }

    // Update order status to shipped
    order.status = 'shipped';
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderToShipped:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the logged in user or user is admin
    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled (e.g., not delivered yet)
    if (order.isDelivered) {
      return res.status(400).json({ message: 'Cannot cancel a delivered order' });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    order.updatedAt = Date.now();

    // Return items to stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.countInStock += item.quantity;
        await product.save();
      }
    }

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Request a refund for an order
// @route   PUT /api/orders/:id/request-refund
// @access  Private
const requestRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the logged in user
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to request refund for this order' });
    }

    // Check if order is delivered (can only request refund for delivered orders)
    if (!order.isDelivered) {
      return res.status(400).json({ message: 'Cannot request refund for undelivered order' });
    }

    // Check if order is already cancelled or refunded
    if (order.status === 'cancelled' || order.status === 'refunded') {
      return res.status(400).json({ message: `Cannot request refund for ${order.status} order` });
    }

    // Check if refund is already requested
    if (order.status === 'refund_requested') {
      return res.status(400).json({ message: 'Refund already requested for this order' });
    }

    // Add refund reason and notes if provided
    const { reason, notes } = req.body;
    order.refundReason = reason || 'Customer requested refund';
    if (notes) order.refundNotes = notes;

    // Update order status to refund_requested
    order.status = 'refund_requested';
    order.updatedAt = Date.now();

    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in requestRefund:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Process refund for an order (Admin only)
// @route   PUT /api/orders/:id/process-refund
// @access  Private/Admin
const processRefund = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if refund is requested
    if (order.status !== 'refund_requested') {
      return res.status(400).json({ message: 'No refund requested for this order' });
    }

    // Add admin notes if provided
    const { adminNotes, approved } = req.body;

    if (adminNotes) {
      order.adminRefundNotes = adminNotes;
    }

    // Update order status based on admin decision
    if (approved === false) {
      order.status = 'delivered'; // Reset to delivered if refund is denied
      order.refundDeniedReason = req.body.reason || 'Refund request denied by admin';
    } else {
      // Process the refund
      order.status = 'refunded';
      order.refundedAt = Date.now();

      // Return items to stock if specified
      if (req.body.restoreStock) {
        for (const item of order.orderItems) {
          const product = await Product.findById(item.product);
          if (product) {
            product.countInStock += item.quantity;
            await product.save();
          }
        }
      }
    }

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in processRefund:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found - invalid ID format' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderToShipped,
  cancelOrder,
  requestRefund,
  processRefund
};