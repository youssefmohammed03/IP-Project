/**
 * Order Model
 * 
 * In a real implementation, this would be a database schema
 * For now, we'll use a dummy implementation
 */

// Simulating a database with an array
const orders = [];
let nextId = 1;

const Order = {
    // Create a new order
    create: (orderData) => {
        const order = {
            id: nextId++,
            userId: orderData.userId,
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax || 0,
            shipping: orderData.shipping || 0,
            total: orderData.total,
            paymentMethod: orderData.paymentMethod,
            shippingAddress: orderData.shippingAddress,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        orders.push(order);
        return order;
    },

    // Find an order by ID
    findById: (id) => {
        return orders.find(order => order.id === id);
    },

    // Get all orders for a user
    findByUserId: (userId) => {
        return orders.filter(order => order.userId === userId);
    },

    // Get all orders
    findAll: () => {
        return [...orders];
    },

    // Update order status
    updateStatus: (id, status) => {
        const order = orders.find(order => order.id === id);
        if (!order) return null;

        order.status = status;
        order.updatedAt = new Date();

        return order;
    },

    // Process refund
    processRefund: (id, refundData) => {
        const order = orders.find(order => order.id === id);
        if (!order) return null;

        order.refund = {
            ...refundData,
            processedAt: new Date()
        };
        order.status = 'refunded';
        order.updatedAt = new Date();

        return order;
    }
};

module.exports = Order;