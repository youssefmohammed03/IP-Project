/**
 * Utility functions for shipping and tax calculations
 */

// Shipping rates by region (simplified to just location-based)
const shippingRates = {
    'USA': 10,
    'Canada': 15,
    'Europe': 25,
    'Asia': 30,
    'default': 35
};

// Tax rates by region
const taxRates = {
    'USA': 0.10,  // 10%
    'Canada': 0.13, // 13%
    'Europe': 0.20, // 20%
    'Asia': 0.12, // 12%
    'default': 0.15 // 15%
};

/**
 * Calculate shipping cost based on destination
 * @param {object} address - Shipping address
 * @param {array} items - Order items (optional, for weight calculation)
 * @returns {number} - Shipping cost
 */
const calculateShipping = (address, items = []) => {
    // Get region-specific shipping rate or use default if not found
    const region = address?.country || 'default';
    const baseCost = shippingRates[region] || shippingRates.default;

    // Calculate total weight if items are provided (optional feature)
    let weight = 0;
    if (items.length > 0) {
        weight = items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);
        
        // Add weight surcharge for heavy orders (over 5kg)
        if (weight > 5) {
            return baseCost + (weight - 5) * 2; // $2 per kg over 5kg
        }
    }

    return baseCost;
};

/**
 * Calculate tax based on destination and order subtotal
 * @param {object} address - Shipping address
 * @param {number} subtotal - Order subtotal
 * @returns {number} - Tax amount
 */
const calculateTax = (address, subtotal) => {
    // Get region-specific tax rate or use default if not found
    const region = address?.country || 'default';
    const taxRate = taxRates[region] || taxRates.default;

    return subtotal * taxRate;
};

/**
 * Calculate order totals including shipping and tax
 * @param {array} items - Cart items
 * @param {object} address - Shipping address
 * @param {object} discount - Applied discount if any
 * @returns {object} - Order totals (subtotal, shipping, tax, discount, total)
 */
const calculateOrderTotals = (items, address, discount = null) => {
    // Calculate subtotal from cart items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate shipping cost
    const shipping = calculateShipping(address, items);

    // Calculate tax based on the country in the address
    const tax = calculateTax(address, subtotal);

    // Calculate any applied discount
    const discountAmount = discount ? discount.amount : 0;

    // Calculate grand total
    const total = subtotal + shipping + tax - discountAmount;

    return {
        subtotal,
        shipping,
        tax,
        discount: discountAmount,
        total
    };
};

module.exports = {
    calculateShipping,
    calculateTax,
    calculateOrderTotals
};