/**
 * Utility functions for shipping and tax calculations
 */

// Dummy implementation of shipping rates by region
const shippingRates = {
    'USA': {
        standard: 10,
        express: 25,
        overnight: 45
    },
    'Canada': {
        standard: 15,
        express: 35,
        overnight: 60
    },
    'Europe': {
        standard: 25,
        express: 45,
        overnight: 80
    },
    'Asia': {
        standard: 30,
        express: 50,
        overnight: 90
    },
    'default': {
        standard: 35,
        express: 60,
        overnight: 100
    }
};

// Dummy implementation of tax rates by region
const taxRates = {
    'USA': 0.10,  // 10%
    'Canada': 0.13, // 13%
    'Europe': 0.20, // 20%
    'Asia': 0.12, // 12%
    'default': 0.15 // 15%
};

/**
 * Calculate shipping cost based on destination and shipping method
 * @param {object} address - Shipping address
 * @param {string} shippingMethod - Shipping method (standard, express, overnight)
 * @param {number} weight - Total weight of the items in kg
 * @returns {number} - Shipping cost
 */
const calculateShipping = (address, shippingMethod = 'standard', weight = 1) => {
    // Get region-specific shipping rates or use default if not found
    const region = address.country || 'default';
    const rates = shippingRates[region] || shippingRates.default;

    // Get base shipping cost by method
    let baseCost = rates[shippingMethod] || rates.standard;

    // Add weight surcharge for heavy items (over 5kg)
    if (weight > 5) {
        baseCost += (weight - 5) * 2; // $2 per kg over 5kg
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
    const region = address.country || 'default';
    const taxRate = taxRates[region] || taxRates.default;

    return subtotal * taxRate;
};

/**
 * Calculate order totals including shipping and tax
 * @param {array} items - Cart items
 * @param {object} address - Shipping address
 * @param {string} shippingMethod - Shipping method (standard, express, overnight)
 * @param {object} discount - Applied discount if any
 * @returns {object} - Order totals (subtotal, shipping, tax, discount, total)
 */
const calculateOrderTotals = (items, address, shippingMethod = 'standard', discount = null) => {
    // Calculate subtotal from cart items
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate estimated total weight
    const weight = items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);

    // Calculate shipping cost
    const shipping = calculateShipping(address, shippingMethod, weight);

    // Calculate tax (tax is calculated on subtotal + shipping in most regions)
    const tax = calculateTax(address, subtotal + shipping);

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