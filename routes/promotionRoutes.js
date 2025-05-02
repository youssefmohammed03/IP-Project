const express = require('express');
const router = express.Router();
const {
    getAllPromotions,
    createPromotion,
    deletePromotion
} = require('../controllers/promotionController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// All routes are admin-only
router.get('/', auth, checkRole(['admin']), getAllPromotions);
router.post('/', auth, checkRole(['admin']), createPromotion);
router.delete('/:id', auth, checkRole(['admin']), deletePromotion);

module.exports = router;