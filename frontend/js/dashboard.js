import { fetchProducts, fetchOrders, addAllProducts, addAllOrders } from "./utils.js";

// Global variables to store product and order data
let productsList = [];
let ordersList = [];

// Function to initialize the dashboard
async function initializeDashboard() {
    try {
        // Check if user is admin
        const userResponse = await fetch('/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        if (userData.role !== 'admin') {
            alert('You are not authorized to access this page.');
            window.location.href = '/';
            return;
        }

        // Fetch products and orders
        console.log("Fetching initial data...");
        productsList = await fetchProducts();
        ordersList = await fetchOrders();
        console.log(`Loaded ${productsList.length} products and ${ordersList.length} orders`);

        // If no products or orders, add sample data
        if (productsList.length === 0) {
            console.log("No products found, adding sample data...");
            await addAllProducts();
            productsList = await fetchProducts();
        }

        if (ordersList.length === 0) {
            console.log("No orders found, adding sample data...");
            await addAllOrders();
            ordersList = await fetchOrders();
        }

        // Initialize tables
        initProductsTable();
        initOrdersTable();
    } catch (error) {
        console.error("Error initializing dashboard:", error);
        alert(`Failed to initialize dashboard: ${error.message}`);
    }
}

// Function to refresh product data
async function refreshProductData() {
    try {
        console.log("Refreshing product data...");
        productsList = await fetchProducts();
        initProductsTable();
        console.log(`Refreshed data: ${productsList.length} products`);
    } catch (error) {
        console.error('Error refreshing product data:', error);
        alert('Failed to refresh product data. Please try again.');
    }
}

// Function to refresh order data
async function refreshOrderData() {
    try {
        console.log("Refreshing order data...");
        ordersList = await fetchOrders();
        initOrdersTable();
        console.log(`Refreshed data: ${ordersList.length} orders`);
    } catch (error) {
        console.error('Error refreshing order data:', error);
        alert('Failed to refresh order data. Please try again.');
    }
}

// Function to initialize product table
function initProductsTable() {
    let tbody = document.getElementById("productTableBody");
    if (!tbody) {
        console.error("Product table body not found!");
        return;
    }

    tbody.innerHTML = ""; // Clear existing rows

    if (!productsList || productsList.length === 0) {
        tbody.innerHTML = "<tr><td colspan='6' class='text-center'>No products found</td></tr>";
        return;
    }

    productsList.forEach(product => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${product._id}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.discount ? product.discount + '%' : '0%'}</td>
            <td>${product.countInStock || product.stock || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="openEditModal('${product._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Function to initialize order table
function initOrdersTable() {
    let tbody = document.getElementById("orderTableBody");
    if (!tbody) {
        console.error("Order table body not found!");
        return;
    }

    tbody.innerHTML = ""; // Clear existing rows

    if (!ordersList || ordersList.length === 0) {
        tbody.innerHTML = "<tr><td colspan='5' class='text-center'>No orders found</td></tr>";
        return;
    }

    ordersList.forEach((order) => {
        let row = document.createElement("tr");

        // Apply color based on order status
        if (order.status === "completed" || order.status === "delivered") {
            row.style.backgroundColor = "#d4edda"; // Light green for completed
        } else if (order.status === "processing") {
            row.style.backgroundColor = "#fff3cd"; // Light yellow for processing
        } else if (order.status === "refunded") {
            row.style.backgroundColor = "#f8d7da"; // Light red for refunded
        } else if (order.status === "pending") {
            row.style.backgroundColor = "#d1ecf1"; // Light blue for pending
        }

        row.innerHTML = `<td class="order-cell">${order._id}</td>
                         <td class="order-cell">${order.user}</td>
                         <td class="order-cell">
                            <span class="badge ${getStatusBadgeClass(order.status)}">${formatOrderStatus(order.status)}</span>
                         </td>
                         <td class="order-cell">$${order.totalPrice.toFixed(2)}</td>
                         <td class="order-cell">
                            <button class="btn btn-primary btn-sm me-1" onclick="viewOrderDetails('${order._id}')">View</button>
                            <button class="btn btn-warning btn-sm me-1" onclick="updateOrderStatus('${order._id}')">Status</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order._id}')">Delete</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

// Add Product Form Handler
document.getElementById("addProductForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const imgPath = document.getElementById("productImage").value;

    // Validate inputs
    if (!name || isNaN(price) || isNaN(stock)) {
        alert("Please fill all required fields with valid values");
        return;
    }

    try {
        // Create product object for API
        const newProduct = {
            name: name,
            price: price,
            countInStock: stock,
            categories: [category],
            imagePath: imgPath
        };

        // Make API call to create product
        console.log("Adding new product:", newProduct);
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add product');
        }

        // Reset form and close modal
        document.getElementById("addProductForm").reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"));
        modal.hide();

        // Refresh product data
        await refreshProductData();
        alert("Product added successfully!");
    } catch (error) {
        console.error('Error adding product:', error);
        alert(`Failed to add product: ${error.message}`);
    }
});

// Delete Product Function
async function deleteProduct(productId) {
    try {
        // Confirm before deleting
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        // Make API call to delete the product
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
        }

        // Refresh data
        await refreshProductData();
        alert("Product deleted successfully!");
    } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Failed to delete product: ${error.message}`);
    }
}

// Open Edit Modal Function
function openEditModal(productId) {
    const product = productsList.find(p => p._id === productId);
    if (!product) {
        alert("Product not found!");
        return;
    }

    // Populate the form with product details
    document.getElementById("editProductId").value = product._id;
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductPrice").value = product.price;
    document.getElementById("editProductStock").value = product.countInStock || product.stock || 0;

    // Handle categories - check if it's an array and get the first element
    const category = Array.isArray(product.categories) ?
        product.categories[0] : product.categories;
    document.getElementById("editProductCategory").value = category || '';

    // Handle image path - might be stored in different property names
    document.getElementById("editProductImage").value =
        product.imagePath || product.imgPath || '';

    const editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
    editModal.show();
}

// Update Product Function
async function updateProduct() {
    try {
        const productId = document.getElementById("editProductId").value;
        const name = document.getElementById("editProductName").value;
        const price = parseFloat(document.getElementById("editProductPrice").value);
        const stock = parseInt(document.getElementById("editProductStock").value);
        const category = document.getElementById("editProductCategory").value;
        const imgPath = document.getElementById("editProductImage").value;

        // Validate inputs
        if (!name || isNaN(price) || isNaN(stock)) {
            alert("Please fill all required fields with valid values");
            return;
        }

        // Prepare data for API call
        const updatedProduct = {
            name: name,
            price: price,
            countInStock: stock,
            categories: [category],
            imagePath: imgPath
        };

        // Make API call to update the product
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update product');
        }

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"));
        modal.hide();

        // Refresh data
        await refreshProductData();
        alert("Product updated successfully!");
    } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
    }
}

// Delete Order Function
async function deleteOrder(orderId) {
    try {
        // Confirm before deleting
        if (!confirm('Are you sure you want to delete this order?')) {
            return;
        }

        // Make API call to delete the order
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete order');
        }

        // Refresh order data
        await refreshOrderData();
        alert("Order deleted successfully!");
    } catch (error) {
        console.error('Error deleting order:', error);
        alert(`Failed to delete order: ${error.message}`);
    }
}

// Update Order Status Function
async function updateOrderStatus(orderId) {
    try {
        // Fetch the order to get current status
        const order = ordersList.find(order => order._id === orderId);
        if (!order) {
            alert("Order not found!");
            return;
        }

        // Allow all possible status transitions
        const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded'];

        // Create the modal for updating status
        const modalHTML = `
        <div class="modal fade" id="updateStatusModal" tabindex="-1" aria-labelledby="updateStatusModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="updateStatusModalLabel">Update Order Status</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="updateStatusForm">
                            <div class="mb-3">
                                <label for="orderStatus" class="form-label">Current Status: <span class="badge ${getStatusBadgeClass(order.status)}">${formatOrderStatus(order.status)}</span></label>
                                <select class="form-select mt-2" id="orderStatus">
                                    ${statusOptions.map(status =>
            `<option value="${status}" ${status === order.status ? 'selected' : ''}>${formatOrderStatus(status)}</option>`
        ).join('')}
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="statusNotes" class="form-label">Notes</label>
                                <textarea class="form-control" id="statusNotes" rows="3" placeholder="Add any notes about this status change..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveStatusBtn">Update Status</button>
                    </div>
                </div>
            </div>
        </div>`;

        // Add the modal to the DOM if it doesn't exist
        if (!document.getElementById('updateStatusModal')) {
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);
        } else {
            document.getElementById('updateStatusModal').outerHTML = modalHTML;
        }

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById('updateStatusModal'));
        modal.show();

        // Handle saving the status update
        document.getElementById('saveStatusBtn').onclick = async () => {
            const newStatus = document.getElementById('orderStatus').value;
            const notes = document.getElementById('statusNotes').value;

            try {
                // Determine the appropriate endpoint based on the new status
                let endpoint;
                let method = 'PUT';
                let data = { notes };

                switch (newStatus) {
                    case 'shipped':
                        endpoint = `/api/orders/${orderId}/ship`;
                        break;
                    case 'cancelled':
                        endpoint = `/api/orders/${orderId}/cancel`;
                        break;
                    case 'refund_requested':
                        endpoint = `/api/orders/${orderId}/request-refund`;
                        break;
                    case 'refunded':
                        endpoint = `/api/orders/${orderId}/process-refund`;
                        data = { ...data, approved: true };
                        break;
                    default:
                        // For other statuses, use a generic update endpoint
                        endpoint = `/api/orders/${orderId}/status`;
                        data = { ...data, status: newStatus };
                }

                const response = await fetch(endpoint, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to update order status');
                }

                // Refresh order data
                await refreshOrderData();

                // Close the update status modal
                modal.hide();

                // Update the order details modal if it's open
                if (document.getElementById("orderId")) {
                    const detailsOrderId = document.getElementById("orderId").textContent;
                    if (detailsOrderId === orderId) {
                        const updatedOrder = ordersList.find(o => o._id === orderId);
                        if (updatedOrder) {
                            document.getElementById("orderStatus").textContent = formatOrderStatus(updatedOrder.status);
                        }
                    }
                }

                alert(`Order status updated to ${formatOrderStatus(newStatus)}`);
            } catch (error) {
                console.error('Error updating order status:', error);
                alert(`Failed to update order status: ${error.message}`);
            }
        };
    } catch (error) {
        console.error('Error preparing status update:', error);
        alert(`Error: ${error.message}`);
    }
}

// View Order Details Function
function viewOrderDetails(orderId) {
    const order = ordersList.find(order => order._id === orderId);
    if (!order) {
        alert("Order not found!");
        return;
    }

    document.getElementById("orderId").textContent = order._id;
    document.getElementById("orderUser").textContent = order.user;
    document.getElementById("orderStatus").textContent = formatOrderStatus(order.status);
    document.getElementById("orderTotalPrice").textContent = order.totalPrice.toFixed(2);

    const itemsList = document.getElementById("orderItemsList");
    itemsList.innerHTML = "";
    order.orderItems.forEach(item => {
        const listItem = document.createElement("li");
        listItem.classList.add("list-group-item");
        listItem.textContent = `${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`;
        itemsList.appendChild(listItem);
    });

    const shippingAddress = order.shippingAddress;
    document.getElementById("orderShippingAddress").textContent =
        `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}`;

    document.getElementById("orderPaymentMethod").textContent = order.paymentMethod;
    document.getElementById("orderIsPaid").textContent = order.isPaid ? "Yes" : "No";
    document.getElementById("orderIsDelivered").textContent = order.isDelivered ? "Yes" : "No";

    const createdDate = new Date(order.createdAt);
    const updatedDate = new Date(order.updatedAt);

    document.getElementById("orderCreatedAt").textContent = createdDate.toLocaleString();
    document.getElementById("orderUpdatedAt").textContent = updatedDate.toLocaleString();

    // Add update status button if it doesn't exist
    const footerElement = document.querySelector("#orderDetailsModal .modal-footer");
    if (footerElement) {
        // Clear existing buttons
        footerElement.innerHTML = '';

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'btn btn-secondary';
        closeButton.setAttribute('data-bs-dismiss', 'modal');
        closeButton.textContent = 'Close';
        footerElement.appendChild(closeButton);

        // Add update status button
        const updateButton = document.createElement('button');
        updateButton.type = 'button';
        updateButton.className = 'btn btn-primary';
        updateButton.textContent = 'Update Status';
        updateButton.onclick = () => updateOrderStatus(order._id);
        footerElement.appendChild(updateButton);
    }

    const orderDetailsModal = new bootstrap.Modal(document.getElementById("orderDetailsModal"));
    orderDetailsModal.show();
}

// Helper function to format order status for display
function formatOrderStatus(status) {
    if (!status) return 'Unknown';
    return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper function to get the appropriate badge class for an order status
function getStatusBadgeClass(status) {
    switch (status) {
        case 'delivered':
        case 'completed':
            return 'bg-success';
        case 'shipped':
            return 'bg-info';
        case 'processing':
        case 'pending':
            return 'bg-warning';
        case 'cancelled':
        case 'refunded':
            return 'bg-danger';
        case 'refund_requested':
            return 'bg-secondary';
        default:
            return 'bg-primary';
    }
}

// Add product discount function
async function applyProductDiscount(event) {
    event.preventDefault();

    const productId = document.getElementById("discountProductId").value;
    const discountPercentage = parseFloat(document.getElementById("discountPercentage").value);

    if (!productId) {
        alert("Please enter a product ID");
        return;
    }

    if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        alert("Please enter a valid discount percentage (0-100)");
        return;
    }

    try {
        // Set expiry date to 30 days from now
        const now = new Date();
        const expiryDate = new Date(now.setDate(now.getDate() + 30));

        const response = await fetch(`/api/products/${productId}/discount`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                discount: discountPercentage,
                discountExpiry: expiryDate.toISOString()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to apply discount');
        }

        // Get the updated product
        const updatedProduct = await response.json();

        // Reset form
        document.getElementById("discountForm").reset();

        // Refresh products data
        await refreshProductData();

        // Display success message
        alert(`Discount of ${discountPercentage}% applied to product "${updatedProduct.name}" until ${new Date(updatedProduct.discountExpiry).toLocaleDateString()}`);
    } catch (error) {
        console.error('Error applying discount:', error);
        alert(`Failed to apply discount: ${error.message}`);
    }
}

// Make functions available globally
window.deleteProduct = deleteProduct;
window.openEditModal = openEditModal;
window.updateProduct = updateProduct;
window.deleteOrder = deleteOrder;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.applyProductDiscount = applyProductDiscount;

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDashboard);