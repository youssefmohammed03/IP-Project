/**
 * User Model
 * 
 * In a real implementation, this would be a database schema
 * For now, we'll use a dummy implementation
 */

// Simulating a database with an array
const users = [];
let nextId = 1;

const User = {
    // Create a new user
    create: (userData) => {
        const user = {
            id: nextId++,
            name: userData.name,
            email: userData.email,
            password: userData.password, // In a real app, this would be hashed
            role: userData.role || 'customer',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(user);
        return user;
    },

    // Find a user by email
    findByEmail: (email) => {
        return users.find(user => user.email === email);
    },

    // Find a user by ID
    findById: (id) => {
        return users.find(user => user.id === id);
    },

    // Get all users
    findAll: () => {
        return [...users];
    },

    // Update a user
    update: (id, userData) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...userData,
            updatedAt: new Date()
        };
        return users[index];
    },

    // Delete a user
    delete: (id) => {
        const index = users.findIndex(user => user.id === id);
        if (index === -1) return false;

        users.splice(index, 1);
        return true;
    }
};

module.exports = User;