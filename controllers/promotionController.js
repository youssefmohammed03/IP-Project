const Promotion = require('../models/Promotion');

// @desc    Get all promotions (including inactive ones) - Admin only
// @route   GET /api/promotions
// @access  Private/Admin
const getAllPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({}).sort('-createdAt');
        res.status(200).json(promotions);
    } catch (error) {
        console.error('Error in getAllPromotions:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = async (req, res) => {
    try {
        const {
            code,
            name,
            description,
            type,
            discount,
            minPurchase,
            expiryDate,
            maxUses,
            applicableProducts
        } = req.body;

        // Validate required fields
        if (!code || !name || !type || !expiryDate) {
            return res.status(400).json({
                message: 'Please provide all required fields: code, name, type, expiryDate'
            });
        }

        // Check if percentage or fixed discount requires a discount value
        if ((type === 'percentage' || type === 'fixed') && (!discount || discount <= 0)) {
            return res.status(400).json({
                message: 'Percentage and fixed promotions require a positive discount value'
            });
        }

        // Check if promotion code already exists
        const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
        if (existingPromotion) {
            return res.status(400).json({ message: 'Promotion code already exists' });
        }

        // Create new promotion
        const promotion = await Promotion.create({
            code: code.toUpperCase(),
            name,
            description: description || '',
            type,
            discount: discount || 0,
            minPurchase: minPurchase || 0,
            startDate: new Date(),
            expiryDate: new Date(expiryDate),
            isActive: true,
            applicableProducts: applicableProducts || [],
            maxUses: maxUses || null,
            usedCount: 0
        });

        res.status(201).json(promotion);
    } catch (error) {
        console.error('Error in createPromotion:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findById(req.params.id);

        if (!promotion) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        await Promotion.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error in deletePromotion:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Promotion not found - invalid ID format' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAllPromotions,
    createPromotion,
    deletePromotion
};