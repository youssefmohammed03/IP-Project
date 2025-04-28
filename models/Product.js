/**
 * Product Model
 * 
 * In a real implementation, this would be a database schema
 * For now, we'll use a dummy implementation
 */

// Simulating a database with an array
const products = [];
let nextId = 1;

const Product = {
    // Create a new product
    create: (productData) => {
        const product = {
            id: nextId++,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            images: productData.images || [],
            category: productData.category,
            stock: productData.stock || 0,
            ratings: [],
            reviews: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        products.push(product);
        return product;
    },

    // Find a product by ID
    findById: (id) => {
        return products.find(product => product.id === id);
    },

    // Get all products
    findAll: (filters = {}) => {
        let result = [...products];

        // Apply filters if any
        if (filters.category) {
            result = result.filter(product => product.category === filters.category);
        }

        if (filters.minPrice) {
            result = result.filter(product => product.price >= filters.minPrice);
        }

        if (filters.maxPrice) {
            result = result.filter(product => product.price <= filters.maxPrice);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        return result;
    },

    // Update a product
    update: (id, productData) => {
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return null;

        products[index] = {
            ...products[index],
            ...productData,
            updatedAt: new Date()
        };
        return products[index];
    },

    // Delete a product
    delete: (id) => {
        const index = products.findIndex(product => product.id === id);
        if (index === -1) return false;

        products.splice(index, 1);
        return true;
    },

    // Update stock
    updateStock: (id, quantity) => {
        const product = products.find(product => product.id === id);
        if (!product) return false;

        product.stock += quantity;
        product.updatedAt = new Date();
        return true;
    },

    // Add a review
    addReview: (id, review) => {
        const product = products.find(product => product.id === id);
        if (!product) return false;

        review.id = product.reviews.length + 1;
        review.createdAt = new Date();

        product.reviews.push(review);

        // Calculate average rating
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.averageRating = totalRating / product.reviews.length;

        return true;
    }
};

module.exports = Product;