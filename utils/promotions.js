/**
 * Utility functions for promotions and discounts using Promotion model
 */
const Promotion = require('../models/Promotion');

/**
 * Validates if a promotion code is valid and applicable
 * @param {string} code - Promotion code
 * @param {number} subtotal - Cart subtotal
 * @returns {object} - Result object with valid status and promotion or message
 */
const validatePromotion = async (code, subtotal) => {
    try {
        if (!code) {
            return { valid: false, message: 'No promotion code provided' };
        }

        // Find the promotion in the database
        const promotion = await Promotion.findOne({ code: code.toUpperCase() });

        if (!promotion) {
            return { valid: false, message: 'Invalid promotion code' };
        }

        // Use the model's isValid method to check validity
        return promotion.isValid(subtotal);
    } catch (error) {
        console.error('Error validating promotion:', error);
        return { valid: false, message: 'Error processing promotion code' };
    }
};

/**
 * Apply promotions to calculate discount
 * @param {number} subtotal - Cart subtotal
 * @param {string} promoCode - Promotion code
 * @returns {object} - Discount and final price
 */
const applyPromotions = async (subtotal, promoCode) => {
    try {
        let discount = 0;

        if (promoCode) {
            const validationResult = await validatePromotion(promoCode, subtotal);

            if (validationResult.valid) {
                // Calculate discount using the model's method
                discount = validationResult.promotion.calculateDiscount(subtotal);

                // Increment usage count
                validationResult.promotion.usedCount += 1;
                await validationResult.promotion.save();
            }
        }

        // Ensure discount doesn't exceed subtotal
        discount = Math.min(discount, subtotal);

        // Calculate final price after discount
        const finalPrice = subtotal - discount;

        return {
            discount,
            finalPrice,
            promoCode: promoCode || null
        };
    } catch (error) {
        console.error('Error applying promotions:', error);
        return {
            discount: 0,
            finalPrice: subtotal,
            promoCode: null
        };
    }
};

module.exports = {
    validatePromotion,
    applyPromotions
};