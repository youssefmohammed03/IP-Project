/**
 * Validation middleware for request data
 */

// Validator for user registration
const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    // Validate name
    if (!name || name.trim() === '') {
        errors.push('Name is required');
    }

    // Validate email
    if (!email) {
        errors.push('Email is required');
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Invalid email format');
        }
    }

    // Validate password
    if (!password) {
        errors.push('Password is required');
    } else if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Validator for login
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Validate email
    if (!email) {
        errors.push('Email is required');
    }

    // Validate password
    if (!password) {
        errors.push('Password is required');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Validator for product creation
const validateProduct = (req, res, next) => {
    const { name, description, price, categories, availableSizes, brand, countInStock } = req.body;
    const errors = [];

    // Validate name
    if (!name || name.trim() === '') {
        errors.push('Product name is required');
    }

    // Validate description
    if (!description || description.trim() === '') {
        errors.push('Product description is required');
    }

    // Validate price
    if (!price) {
        errors.push('Price is required');
    } else if (isNaN(price) || price <= 0) {
        errors.push('Price must be a positive number');
    }

    // Validate categories array
    if (!categories) {
        errors.push('Categories are required');
    } else if (!Array.isArray(categories)) {
        errors.push('Categories must be an array');
    } else if (categories.length === 0) {
        errors.push('At least one category is required');
    } else {
        // Check that all categories are non-empty strings
        const invalidCategories = categories.filter(cat => typeof cat !== 'string' || cat.trim() === '');
        if (invalidCategories.length > 0) {
            errors.push('All categories must be non-empty strings');
        }
    }

    // Validate availableSizes array
    if (availableSizes !== undefined) {
        if (!Array.isArray(availableSizes)) {
            errors.push('Available sizes must be an array');
        } else {
            // Check that all sizes are valid
            const validSizes = ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge'];
            const invalidSizes = availableSizes.filter(size =>
                typeof size !== 'string' || !validSizes.includes(size.toLowerCase())
            );
            if (invalidSizes.length > 0) {
                errors.push(`All sizes must be valid: ${validSizes.join(', ')}`);
            }
        }
    }

    // Validate brand
    if (!brand || brand.trim() === '') {
        errors.push('Brand is required');
    }

    // Validate countInStock
    if (countInStock === undefined || countInStock === null) {
        errors.push('Count in stock is required');
    } else if (isNaN(countInStock) || countInStock < 0) {
        errors.push('Count in stock must be a non-negative number');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Validator for product updates - only validates fields that are present
const validateProductUpdate = (req, res, next) => {
    const { name, description, price, categories, availableSizes, brand, countInStock } = req.body;
    const errors = [];

    // Only validate fields that are provided in the update
    if (name !== undefined && name.trim() === '') {
        errors.push('Product name cannot be empty');
    }

    if (description !== undefined && description.trim() === '') {
        errors.push('Product description cannot be empty');
    }

    if (price !== undefined && (isNaN(price) || price <= 0)) {
        errors.push('Price must be a positive number');
    }

    // Validate categories array
    if (categories !== undefined) {
        if (!Array.isArray(categories)) {
            errors.push('Categories must be an array');
        } else if (categories.length === 0) {
            errors.push('At least one category is required');
        } else {
            // Check that all categories are non-empty strings
            const invalidCategories = categories.filter(cat => typeof cat !== 'string' || cat.trim() === '');
            if (invalidCategories.length > 0) {
                errors.push('All categories must be non-empty strings');
            }
        }
    }

    // Validate availableSizes array
    if (availableSizes !== undefined) {
        if (!Array.isArray(availableSizes)) {
            errors.push('Available sizes must be an array');
        } else {
            // Check that all sizes are valid
            const validSizes = ['xxsmall', 'xsmall', 'small', 'medium', 'large', 'xlarge', 'xxlarge', 'xxxlarge'];
            const invalidSizes = availableSizes.filter(size =>
                typeof size !== 'string' || !validSizes.includes(size.toLowerCase())
            );
            if (invalidSizes.length > 0) {
                errors.push(`All sizes must be valid: ${validSizes.join(', ')}`);
            }
        }
    }

    if (brand !== undefined && brand.trim() === '') {
        errors.push('Brand cannot be empty');
    }

    if (countInStock !== undefined && (isNaN(countInStock) || countInStock < 0)) {
        errors.push('Count in stock must be a non-negative number');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

// Validator for order creation
const validateOrder = async (req, res, next) => {
    const { shippingAddress, paymentMethod, promoCode } = req.body;
    const errors = [];

    // Validate shipping address with more comprehensive checks
    if (!shippingAddress) {
        errors.push('Shipping address is required');
    } else {
        const { address, city, postalCode, country, phone } = shippingAddress;

        // Check required shipping address fields
        if (!address || address.trim() === '') {
            errors.push('Street address is required');
        }

        if (!city || city.trim() === '') {
            errors.push('City is required');
        }

        if (!postalCode || postalCode.trim() === '') {
            errors.push('Postal code is required');
        } else if (!/^[a-zA-Z0-9\s-]{3,10}$/.test(postalCode.trim())) {
            errors.push('Invalid postal code format');
        }

        if (!country || country.trim() === '') {
            errors.push('Country is required');
        }

        // Phone validation
        if (!phone || phone.trim() === '') {
            errors.push('Phone number is required');
        } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/.test(phone.trim())) {
            errors.push('Invalid phone number format');
        }
    }

    // Validate payment method against allowed values
    const allowedPaymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery'];
    if (!paymentMethod) {
        errors.push('Payment method is required');
    } else if (!allowedPaymentMethods.includes(paymentMethod)) {
        errors.push(`Payment method must be one of: ${allowedPaymentMethods.join(', ')}`);
    }

    // Check user's cart before creating order
    try {
        const Cart = require('../models/Cart');
        const userId = req.user.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            errors.push('Cannot create an order with an empty cart');
        } else {
            // Check stock availability for all items
            const stockErrors = [];
            cart.items.forEach(item => {
                if (!item.product) {
                    stockErrors.push(`Product in cart no longer exists`);
                } else if (item.quantity > item.product.countInStock) {
                    stockErrors.push(`Not enough stock for ${item.product.name}. Available: ${item.product.countInStock}`);
                }

                // Validate quantity (must be between 1 and 10)
                if (item.quantity < 1 || item.quantity > 10) {
                    stockErrors.push(`Quantity for ${item.product.name} must be between 1 and 10`);
                }
            });

            if (stockErrors.length > 0) {
                errors.push(...stockErrors);
            }
        }
    } catch (error) {
        console.error('Error validating cart items:', error);
        errors.push('Error validating cart items');
    }

    // Return errors if any
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateProduct,
    validateProductUpdate,
    validateOrder
};