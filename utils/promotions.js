/**
 * Utility functions for promotions and discounts
 */

// Dummy implementation for coupons
const coupons = [
    { code: 'WELCOME10', discount: 10, type: 'percentage', expiryDate: '2025-12-31', minPurchase: 50 },
    { code: 'SAVE20', discount: 20, type: 'percentage', expiryDate: '2025-12-31', minPurchase: 100 },
    { code: 'FLAT15', discount: 15, type: 'fixed', expiryDate: '2025-12-31', minPurchase: 0 }
];

/**
 * Validates if a coupon is valid and applicable
 * @param {string} code - Coupon code
 * @param {number} subtotal - Cart subtotal
 * @returns {object} - Coupon object or null if invalid
 */
const validateCoupon = (code, subtotal) => {
    const coupon = coupons.find(c => c.code === code);

    if (!coupon) {
        return { valid: false, message: 'Invalid coupon code' };
    }

    // Check expiry date
    if (new Date(coupon.expiryDate) < new Date()) {
        return { valid: false, message: 'Coupon has expired' };
    }

    // Check minimum purchase amount
    if (subtotal < coupon.minPurchase) {
        return {
            valid: false,
            message: `Minimum purchase amount for this coupon is $${coupon.minPurchase}`
        };
    }

    return { valid: true, coupon };
};

/**
 * Calculates discount amount
 * @param {object} coupon - Coupon object
 * @param {number} subtotal - Cart subtotal
 * @returns {number} - Discount amount
 */
const calculateDiscount = (coupon, subtotal) => {
    if (coupon.type === 'percentage') {
        return (subtotal * coupon.discount) / 100;
    } else {
        return coupon.discount;
    }
};

/**
 * Apply special promotions (e.g., buy one get one free)
 * @param {array} items - Cart items
 * @param {string} promoType - Promotion type
 * @returns {number} - Additional discount amount
 */
const applyPromotion = (items, promoType) => {
    let additionalDiscount = 0;

    switch (promoType) {
        case 'buyOneGetOne':
            // Find eligible items (dummy implementation)
            const eligibleItems = items.filter(item => item.price > 50);
            if (eligibleItems.length > 0) {
                const cheapestItem = eligibleItems.reduce(
                    (min, item) => item.price < min.price ? item : min,
                    eligibleItems[0]
                );
                additionalDiscount = cheapestItem.price;
            }
            break;

        case 'freeShipping':
            additionalDiscount = 10; // Assume flat shipping cost of $10
            break;

        default:
            additionalDiscount = 0;
    }

    return additionalDiscount;
};

module.exports = {
    validateCoupon,
    calculateDiscount,
    applyPromotion
};