const shippingRates = {
    'USA': 10,
    'Canada': 15,
    'Europe': 25,
    'Asia': 30,
    'default': 35
};

const taxRates = {
    'USA': 0.10,  // 10%
    'Canada': 0.13, // 13%
    'Europe': 0.20, // 20%
    'Asia': 0.12, // 12%
    'default': 0.15 // 15%
};

/**
 * 
 * @param {object} address 
 * @param {array} items 
 * @returns {number} 
 */
const calculateShipping = (address, items = []) => {
    const region = address?.country || 'default';
    const baseCost = shippingRates[region] || shippingRates.default;

    let weight = 0;
    if (items.length > 0) {
        weight = items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);
        
        if (weight > 5) {
            return baseCost + (weight - 5) * 2; 
        }
    }

    return baseCost;
};

/**
 * 
 * @param {object} address 
 * @param {number} subtotal 
 * @returns {number} 
 */
const calculateTax = (address, subtotal) => {
    const region = address?.country || 'default';
    const taxRate = taxRates[region] || taxRates.default;

    return subtotal * taxRate;
};

/**
 * 
 * @param {array} items 
 * @param {object} address 
 * @param {object} discount 
 * @returns {object} 
 */
const calculateOrderTotals = (items, address, discount = null) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const shipping = calculateShipping(address, items);

    const tax = calculateTax(address, subtotal);

    const discountAmount = discount ? discount.amount : 0;

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