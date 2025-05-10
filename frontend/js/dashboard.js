import { fetchProducts, fetchOrders, addAllProducts, addAllOrders, makeRequest, getCookie, host } from "./utils.js";

let productsList = await fetchProducts();
let ordersList = await fetchOrders();
let token = getCookie('token');

async function fetchUsers(){
    try {
        const res = await makeRequest(`${host}/api/auth/users`, 'GET', null, token);
        console.log(res);
        return res;
    } catch (err) {
        console.error('Error fetching users', err);
    }
}

let users = await fetchUsers();

async function initializeTables() {
    if (productsList.length === 0) {
        await addAllProducts();
        initProductsTable();
    }

    if (ordersList.length === 0) {
        await addAllOrders();
        initOrdersTable();
    }
}

initializeTables();

fetch('/api/auth/me', {
    method: 'GET'
}).then(response => {
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
}).then(data => {
    if (data.role !== 'admin') {
        alert('You are not authorized to access this page.');
        window.location.href = '/';
    } else {
        initProductsTable();
        initOrdersTable();
    }
})

function initProductsTable() {
    let tbody = document.getElementById("productTableBody");
    tbody.innerHTML = ""; // Clear existing rows
    productsList.forEach((product) => {
        const discountedPrice = product.price * (1 - product.discount / 100);
        let row = document.createElement("tr");
        if (product.countInStock <= 0) {
            row.style.backgroundColor = "#ffcccc"; // Highlight row with light red color
        } else if (product.countInStock < 20) {
            row.style.backgroundColor = "#fffccc"; // Highlight row with light red color
        }
        row.innerHTML = `<td class="product-cell">${product._id}</td>
                         <td class="product-cell">${product.name}</td>
                         <td class="product-cell">$${product.price}</td>
                         <td class="product-cell">${product.discount > 0 ? `$${discountedPrice.toFixed(2)} (${product.discount}%)` : "No Discount"}</td>
                         <td class="product-cell">${product.countInStock}</td>
                         <td class="product-cell">
                            <button class="btn btn-primary" onclick="openEditModal('${product._id}')">Edit</button>
                            <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Delete</button>
                            <button class="btn btn-secondary" onclick="openDiscountModal('${product._id}')">Set Discount</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

function initUsersTable() {
    let tbody = document.getElementById("rolesTableBody");
    tbody.innerHTML = ""; // Clear existing rows
    users.forEach((user) => {
        let row = document.createElement("tr");
        row.innerHTML = `<td class="user-cell">${user._id}</td>
                         <td class="user-cell">${user.name}</td>
                         <td class="user-cell">${user.role}</td>
                         <td class="user-cell">
                            <select class="form-select" id="userRoleSelect-${user._id}">
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                            </select>
                         </td>
                         <td class="user-cell">
                            <button class="btn btn-primary" onclick="updateUserRole('${user._id}')">Apply</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

initUsersTable();

async function updateUserRole(userId) {
    const role = document.getElementById(`userRoleSelect-${userId}`).value;
    let data = await makeRequest(`${host}/api/auth/role/${userId}`, 'PUT', { role: role }, token);
    console.log(data);
    if (data.role !== role) {
        alert("Failed to update user role!");
        return;
    }
    alert("User role updated successfully!");
    users = await fetchUsers();
    initUsersTable();
}

function openDiscountModal(productId) {
    const product = productsList.find(p => p._id === productId);
    if (!product) {
        alert("Product not found!");
        return;
    }
    const modal = new bootstrap.Modal(document.getElementById("discountModal"));
    modal.show();
    document.getElementById("discountInput").value = product.discount;
    document.getElementById("discountProductId").value = product._id;
}

document.getElementById("applyDiscountButton").addEventListener("click", async () => {

        const discount = parseInt(document.getElementById("discountInput").value);
        const productId = document.getElementById("discountProductId").value;

        if (isNaN(discount) || discount < 0 || discount > 100) {
            alert("Invalid discount percentage!");
            return;
        }

        const expiryDate = new Date(new Date().now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        console.log(expiryDate);

        const data = await makeRequest(`${host}/api/products/${productId}/discount`, 'PUT', { discount: discount, expirayDate: expiryDate }, token);
        console.log(data);
        if (!data.success){
            alert("Failed to set discount!");
            return;
        }
        alert("Discount set successfully!");
        const modal = bootstrap.Modal.getInstance(document.getElementById("discountModal"));
        modal.hide();
        productsList = await fetchProducts();
        initProductsTable();
    
});

async function addProduct () {

    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const imgPath = document.getElementById("productImage").value;

    const newProduct = {
        name: name,
        description: description,
        price: price,
        categories: [category],
        brand: 'SHOP.CO',
        countInStock: stock,
        imagePath: imgPath,
        isFeatured: true,
        discount: 0.0, // Default discount for new products
    };

    let data = await makeRequest(`${host}/api/products`, 'POST', newProduct, token);

    if (!data._id){
        alert("Failed to add product!");
        return;
    }

    alert("Product added successfully!");
    document.getElementById("addProductForm").reset();
    const modal = new bootstrap.Modal(document.getElementById("addProductModal"));
    modal.hide();

    // Optionally, refresh the product table or UI
    console.log(productsList);
    window.open('./dashboard', '_self');
};

async function deleteProduct(productId) {
    const product = productsList.find(p => p._id === productId);
    if (!product) {
        alert("Product not found!");
        return;
    }

    let res = await makeRequest(`${host}/api/products/${productId}`, 'DELETE', null, token);

    productsList = productsList.filter(p => p._id !== productId);
    alert("Product deleted successfully!");
    console.log(productsList);
    initProductsTable();
}

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
    document.getElementById("editProductStock").value = product.countInStock;

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

        // Get updated product from response
        const updatedProductData = await response.json();

        // Update local data
        const productIndex = productsList.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
            productsList[productIndex] = updatedProductData;
        } else {
            // If not found, refresh the entire list
            productsList = await fetchProducts();
        }

        // Close modal and refresh UI
        const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"));
        modal.hide();
        initProductsTable();
        alert("Product updated successfully!");
    } catch (error) {
        console.error('Error updating product:', error);
        alert(`Failed to update product: ${error.message}`);
    }
}

function initOrdersTable() {
    let tbody = document.getElementById("orderTableBody");
    tbody.innerHTML = ""; // Clear existing rows
    ordersList.forEach((order) => {
        let row = document.createElement("tr");

        // Apply color based on order status
        if (order.status === "completed") {
            row.style.backgroundColor = "#d4edda"; // Light green for completed
        } else if (order.status === "processing") {
            row.style.backgroundColor = "#fff3cd"; // Light yellow for processing
        } else if (order.status === "refunded") {
            row.style.backgroundColor = "#f8d7da"; // Light red for refunded
        } else if (order.status === "pending") {
            row.style.backgroundColor = "#d1ecf1"; // Light blue for pending
        }

        row.innerHTML = `<td class="order-cell">${order._id}</td>
                         <td class="order-cell">${order.user._id}</td>
                         <td class="order-cell">${order.status}</td>
                         <td class="order-cell">$${order.totalPrice.toFixed(2)}</td>
                         <td class="order-cell">
                            <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">View</button>
                            <button class="btn btn-warning" onclick="updateOrderStatus('${order._id}')">Update Status</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

initOrdersTable();

function updateOrderStatus(orderId) {
    const order = ordersList.find(order => order._id === orderId);
    if (!order) {
        alert("Order not found!");
        return;
    }

    document.getElementById("orderStatusId").textContent = order._id;
    const modal = new bootstrap.Modal(document.getElementById("updateOrderStatusModal"));
    modal.show();

    console.log(ordersList);
    initOrdersTable();
}

document.getElementById("confirmUpdateOrderStatus").addEventListener("click", function () {
    const selectedStatus = document.querySelector('input[name="orderStatus"]:checked');
    if (!selectedStatus) {
        alert("Please select a status to update.");
        return;
    }

    const orderId = document.getElementById("orderStatusId").textContent;
    const statusValue = selectedStatus.value;

    let body = (statusValue == 'process-refund') ? {aproved: true, adminNotes: "Refund approved", restoreStock: true} : null;
    let state = (statusValue == 'process-refund') ? "refunded" : "shipped";

    // Make an API call to update the order status
    makeRequest(`/api/orders/${orderId}/${statusValue}`, 'PUT', body, token)
        .then(async (response) => {
            console.log("Order status updated:", response);
            if (response.status === state) {
                ordersList = await fetchOrders();
                alert("Order status updated successfully!");
                const modal = bootstrap.Modal.getInstance(document.getElementById("updateOrderStatusModal"));
                modal.hide();
                initOrdersTable();
            } else {
                alert("Failed to update order status.");
            }
        })
        .catch(error => {
            console.error("Error updating order status:", error);
            alert("An error occurred while updating the order status.");
        });
});

function viewOrderDetails(orderId) {
    const order = ordersList.find(order => order._id === orderId);
    if (!order) {
        alert("Order not found!");
        return;
    }

    document.getElementById("orderId").textContent = order._id;
    document.getElementById("orderUser").textContent = order.user._id;
    document.getElementById("orderUserName").textContent = order.user.name;
    document.getElementById("orderStatus").textContent = order.status;
    document.getElementById("orderTotalPrice").textContent = order.totalPrice.toFixed(2);

    const itemsList = document.getElementById("orderItemsList");
    itemsList.innerHTML = "";
    order.orderItems.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = `${item.name} (x${item.quantity}) - $${item.price.toFixed(2)}`;
        itemsList.appendChild(listItem);
    });

    const shippingAddress = order.shippingAddress;
    document.getElementById("orderShippingAddress").textContent = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}`;

    document.getElementById("orderPaymentMethod").textContent = order.paymentMethod;
    document.getElementById("orderIsPaid").textContent = order.isPaid ? "Yes" : "No";
    document.getElementById("orderIsDelivered").textContent = order.isDelivered ? "Yes" : "No";
    document.getElementById("orderCreatedAt").textContent = order.createdAt.split('T')[0] + " " + order.createdAt.split('T')[1].split('.')[0];
    document.getElementById("orderUpdatedAt").textContent = order.updatedAt.split('T')[0] + " " + order.updatedAt.split('T')[1].split('.')[0];

    const orderDetailsModal = new bootstrap.Modal(document.getElementById("orderDetailsModal"));
    orderDetailsModal.show();
}


let promotions = await fetchPromotions();

async function fetchPromotions(){
    let res = await makeRequest(`${host}/api/promotions`, 'GET', null, token);
    console.log(res);
    return res;
}

document.getElementById('promotionForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const code = form.code.value;
  const name = form.name.value;
  const description = form.description.value;
  const discount = parseInt(form.discount.value);
  const minPurchase = parseFloat(form.minPurchase.value);
  const period = parseInt(form.period.value);

  const expiryDate = new Date(Date.now() + period * 24 * 60 * 60 * 1000);

  const body = {
    code: code,
    name: name,
    description: description,
    type: "percentage",
    discount: discount,
    minPurchase: minPurchase,
    expiryDate: expiryDate.toISOString().split('T')[0]
  };

  let res = await makeRequest(`${host}/api/promotions`, 'POST', body, token);
  console.log(res);

  if(res.code !== code){
    alert("Failed to add promotion!");
    return;
  }

  promotions = await fetchPromotions();
  renderPromotions();
  const modal = bootstrap.Modal.getInstance(document.getElementById("addPromotionModal"));
  modal.hide();
  form.reset();
});

function renderPromotions() {
  const tbody = document.getElementById('promotionTableBody');
  tbody.innerHTML = '';

  promotions.forEach(promo => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${promo._id}</td>
      <td>${promo.code}</td>
      <td>${promo.name}</td>
      <td>${promo.discount}%</td>
      <td>${promo.expiryDate.split('T')[0]}</td>
      <td>${promo.isActive ? 'Yes' : 'No'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deletePromotion('${promo._id}')">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

renderPromotions();

async function deletePromotion(id) {
    console.log(id);
    let res = await makeRequest(`${host}/api/promotions/${id}`, 'DELETE', null, token);
    if(res.message != "Promotion deleted successfully"){
        alert("Failed to delete promotion!");
        return;
    }
    promotions = await fetchPromotions();
    renderPromotions();
}


window.addProduct = addProduct;
window.deleteProduct = deleteProduct;
window.openEditModal = openEditModal;
window.updateProduct = updateProduct;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.openDiscountModal = openDiscountModal;
window.updateUserRole = updateUserRole;
window.deletePromotion = deletePromotion;