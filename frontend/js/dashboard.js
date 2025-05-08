import { fetchProducts } from "./utils.js";
import { ordersList } from "./utils.js";

let productsList = await fetchProducts();

function initProductsTable(){
    let tbody = document.getElementById("productTableBody");
    tbody.innerHTML = ""; // Clear existing rows
    productsList.forEach((product) => {
        const discountedPrice = product.price.slice(1) * (1 - product.discount);
        let row = document.createElement("tr");
        if(product.stock <= 0) {
            row.style.backgroundColor = "#ffcccc"; // Highlight row with light red color
        }else if(product.stock < 20) {
            row.style.backgroundColor = "#fffccc"; // Highlight row with light red color
        }
        row.innerHTML = `<td class="product-cell">${product._id}</td>
                         <td class="product-cell">${product.name}</td>
                         <td class="product-cell">${product.price}</td>
                         <td class="product-cell">${product.discount > 0 ? `$${discountedPrice.toFixed(2)} (${product.discount*100}%)` : "No Discount"}</td>
                         <td class="product-cell">${product.stock}</td>
                         <td class="product-cell">
                            <button class="btn btn-primary" onclick="openEditModal(${product._id})">Edit</button>
                            <button class="btn btn-danger" onclick="deleteProduct(${product._id})">Delete</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

initProductsTable();

document.getElementById("addProductForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const stock = parseInt(document.getElementById("productStock").value);
    const category = document.getElementById("productCategory").value;
    const imgPath = document.getElementById("productImage").value;

    const newProduct = {
        _id: productsList.length + 1,
        imgPath: imgPath,
        name: name,
        rating: 0, // Default rating for new products
        price: `$${price}`,
        discount: 0.0, // Default discount for new products
        availableSizes: [], // Default empty sizes
        categories: [category],
        arrivalDate: new Date().toISOString().split('T')[0], // Current date
        stock: stock
    };

    productsList.push(newProduct);

    alert("Product added successfully!");
    document.getElementById("addProductForm").reset();
    const modal = bootstrap.Modal.getInstance(document.getElementById("addProductModal"));
    modal.hide();

    // Optionally, refresh the product table or UI
    console.log(productsList);
    initProductsTable();
});

function deleteProduct(productId) {
    productId = parseInt(productId);
    productsList = productsList.filter(p => p._id !== productId);
    alert("Product deleted successfully!");
    console.log(productsList);
    initProductsTable();
}

function openEditModal(productId) {
    productId = parseInt(productId);
    const product = productsList.find(p => p._id === productId);
    if (!product) {
        alert("Product not found!");
        return;
    }

    document.getElementById("editProductId").value = product._id;
    document.getElementById("editProductName").value = product.name;
    document.getElementById("editProductPrice").value = parseFloat(product.price.slice(1));
    document.getElementById("editProductStock").value = product.stock;
    document.getElementById("editProductCategory").value = product.categories[0];
    document.getElementById("editProductImage").value = product.imgPath;

    const editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
    editModal.show();
}

function updateProduct() {
    const productId = parseInt(document.getElementById("editProductId").value);
    const name = document.getElementById("editProductName").value;
    const price = parseFloat(document.getElementById("editProductPrice").value);
    const stock = parseInt(document.getElementById("editProductStock").value);
    const category = document.getElementById("editProductCategory").value;
    const imgPath = document.getElementById("editProductImage").value;

    const productIndex = productsList.findIndex(p => p._id === productId);
    if (productIndex === -1) {
        alert("Product not found!");
        return;
    }

    productsList[productIndex] = {
        ...productsList[productIndex],
        name: name,
        price: `$${price}`,
        stock: stock,
        categories: [category],
        imgPath: imgPath
    };

    alert("Product updated successfully!");
    const modal = bootstrap.Modal.getInstance(document.getElementById("editProductModal"));
    modal.hide();

    // Optionally, refresh the product table or UI
    console.log(productsList);
    initProductsTable();
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
                         <td class="order-cell">${order.user}</td>
                         <td class="order-cell">${order.status}</td>
                         <td class="order-cell">$${order.totalPrice.toFixed(2)}</td>
                         <td class="order-cell">
                            <button class="btn btn-primary" onclick="viewOrderDetails('${order._id}')">View</button>
                            <button class="btn btn-danger" onclick="deleteOrder('${order._id}')">Delete</button>
                         </td>`;
        tbody.appendChild(row);
    });
}

initOrdersTable();

function deleteOrder(orderId) {
    ordersList = ordersList.filter(order => order._id !== orderId);
    alert("Order deleted successfully!");
    console.log(ordersList);
    initOrdersTable();
}

function viewOrderDetails(orderId) {
    const order = ordersList.find(order => order._id === orderId);
    if (!order) {
        alert("Order not found!");
        return;
    }

    document.getElementById("orderId").textContent = order._id;
    document.getElementById("orderUser").textContent = order.user;
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

window.deleteProduct = deleteProduct;
window.openEditModal = openEditModal;
window.updateProduct = updateProduct;
window.deleteOrder = deleteOrder;
window.viewOrderDetails = viewOrderDetails;