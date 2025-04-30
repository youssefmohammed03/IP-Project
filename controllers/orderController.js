const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateShipping } = require('../utils/shipping');
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
    const { discount, finalPrice } = applyPromotions(
      itemsPrice,
      promoCode
    );

    const taxPrice = finalPrice * 0.15; // 15% tax
    const totalPrice = finalPrice + shippingPrice + taxPrice;

    // Create the order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discount,
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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
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

    // Update order payment status
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer ? req.body.payer.email_address : req.user.email
    };

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
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    // Check if order exists
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order delivery status
    order.isDelivered = true;
    order.deliveredAt = Date.now();

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

module.exports = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  cancelOrder
};