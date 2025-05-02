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
 * @returns {object} - Discount, final price, and validation result
 */
const applyPromotions = async (subtotal, promoCode) => {
    try {
        // If no promo code, return valid result with no discount
        if (!promoCode) {
            return {
                isValid: true,
                discount: 0,
                finalPrice: subtotal,
                promoCode: null
            };
        }

        // Validate the promotion code
        const validationResult = await validatePromotion(promoCode, subtotal);

        if (validationResult.valid) {
            // Calculate discount using the model's method
            const discount = validationResult.promotion.calculateDiscount(subtotal);

            // Increment usage count
            validationResult.promotion.usedCount += 1;
            await validationResult.promotion.save();

            // Ensure discount doesn't exceed subtotal
            const finalDiscount = Math.min(discount, subtotal);

            // Calculate final price after discount
            const finalPrice = subtotal - finalDiscount;

            return {
                isValid: true,
                discount: finalDiscount,
                finalPrice,
                promoCode
            };
        } else {
            // Return invalid result with error message
            return {
                isValid: false,
                message: validationResult.message || 'Invalid promotion code',
                discount: 0,
                finalPrice: subtotal,
                promoCode: null
            };
        }
    } catch (error) {
        console.error('Error applying promotions:', error);
        return {
            isValid: false,
            message: 'Error processing promotion code',
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