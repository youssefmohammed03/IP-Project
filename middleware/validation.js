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
    const { name, description, price, category, brand, countInStock } = req.body;
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

    // Validate category
    if (!category || category.trim() === '') {
        errors.push('Category is required');
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
    const { name, description, price, category, brand, countInStock } = req.body;
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

    if (category !== undefined && category.trim() === '') {
        errors.push('Category cannot be empty');
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
const validateOrder = (req, res, next) => {
    const { shippingAddress, paymentMethod } = req.body;
    const errors = [];

    // Validate shipping address
    if (!shippingAddress) {
        errors.push('Shipping address is required');
    } else {
        const { address, city, postalCode, country } = shippingAddress;
        if (!address || !city || !postalCode || !country) {
            errors.push('Complete shipping address is required');
        }
    }

    // Validate payment method
    if (!paymentMethod) {
        errors.push('Payment method is required');
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