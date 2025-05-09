const orders = [
    {
        paymentResult: {
            id: "1746225269319",
            status: "COMPLETED",
            update_time: "2025-05-07T18:15:00.000Z",
            email_address: "user4@example.com"
        },
        _id: "681547e896864a9a815d5b5b",
        user: null,
        orderItems: [
            {
                product: "68121198f1aefe8008bbdcec",
                quantity: 1,
                price: 20.99,
                name: "Brave New World",
                _id: "681547e896864a9a815d5b5c"
            }
        ],
        shippingAddress: {
            address: "303 Dystopia Avenue",
            city: "Dystopia City",
            postalCode: "5566",
            country: "USA",
            phone: "34567890",
            _id: "681547e896864a9a815d5b5d"
        },
        paymentMethod: "credit_card",
        itemsPrice: 20.99,
        shippingPrice: 4,
        taxPrice: 1.6792,
        totalPrice: 26.6692,
        isPaid: true,
        isDelivered: false,
        status: "processing",
        createdAt: "2025-05-07T18:00:00.000Z",
        updatedAt: "2025-05-07T18:30:00.000Z",
        paidAt: "2025-05-07T18:15:00.000Z"
    }
];

function populateOrdersTable() {
    const tableBody = document.getElementById("orders-table-body");

    orders.forEach(order => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${order._id}</td>
            <td>${order.paymentResult.status}</td>
            <td>${order.paymentMethod}</td>
            <td>${order.itemsPrice.toFixed(2)}</td>
            <td>${order.shippingPrice.toFixed(2)}</td>
            <td>${order.taxPrice.toFixed(2)}</td>
            <td>${order.totalPrice.toFixed(2)}</td>
            <td>${order.isPaid ? "Yes" : "No"}</td>
            <td>${order.isDelivered ? "Yes" : "No"}</td>
            <td>${order.status}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="cancelOrder('${order._id}')">Cancel Order</button>
                <button class="btn btn-warning btn-sm" onclick="requestRefund('${order._id}')">Request Refund</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

function cancelOrder(orderId) {
    alert(`Cancel order with ID: ${orderId}`);
    // Add logic to cancel the order
}

function requestRefund(orderId) {
    alert(`Request refund for order with ID: ${orderId}`);
    // Add logic to request a refund
}

// Populate the table on page load
document.addEventListener("DOMContentLoaded", populateOrdersTable);