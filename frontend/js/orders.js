import { getCookie, makeRequest, host } from "./utils.js";

let userToken = getCookie("token");

async function getOrders() {
    try {
        const response = await makeRequest(`${host}/api/orders/myorders`, 'GET', null, userToken);
        populateOrdersTable(response);
    } catch (error) {
        console.error(error);
    }
}

window.getOrders = getOrders;

function populateOrdersTable(orders) {
    const tableBody = document.getElementById("orders-table-body");
    tableBody.innerHTML = "";

    orders.forEach(order => {
        const row = document.createElement("tr");
        console.log(order);
        row.innerHTML = `
            <td>${order._id}</td>
            <td>${order.paymentMethod}</td>
            <td>${order.itemsPrice.toFixed(2)}</td>
            <td>${order.shippingPrice.toFixed(2)}</td>
            <td>${order.taxPrice.toFixed(2)}</td>
            <td>${order.totalPrice.toFixed(2)}</td>
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

async function cancelOrder(orderId) {
    let res = await makeRequest(
        `${host}/api/orders/${orderId}/cancel`,
        'PUT',
        null,
        userToken
    )
    if (res.status === "cancelled") {
        await getOrders();
        alert(`Cancel order with ID: ${orderId}`);
    } else {
        alert(`Failed to cancel order with ID: ${orderId}`);
    }
    // Add logic to cancel the order
}

function requestRefund(orderId) {
    const refundModal = new bootstrap.Modal(document.getElementById('refundModal'));
    refundModal.show();

    const submitButton = document.getElementById('submitRefund');
    submitButton.onclick = async function () {
        const reason = document.getElementById('refundReason').value;
        const notes = document.getElementById('refundNotes').value;

        if (!reason | !notes) {
            alert('Reason and Notes are required');
            return;
        }

        try {
            const res = await makeRequest(
                `${host}/api/orders/${orderId}/request-refund`,
                'PUT',
                { reason, notes },
                userToken
            );

            if (res.status === 'refund_requested') {
                alert('Refund requested successfully');
                refundModal.hide();
                await getOrders();
            } else {
                alert('Failed to request refund');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while requesting a refund');
        }
    };
}

window.cancelOrder = cancelOrder;
window.requestRefund = requestRefund;

// Populate the table on page load
document.addEventListener("DOMContentLoaded", getOrders);