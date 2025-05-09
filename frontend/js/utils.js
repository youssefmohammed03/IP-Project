let host = "http://localhost:3000";
export const envToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWQxYmJkYzk2Y2ExYjZkNzVhOWM4OCIsImVtYWlsIjoiYWRtaW5Ac3lzdGVtLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjczODE2MiwiZXhwIjoxNzQ2ODI0NTYyfQ.Q3PDQYrWwrL2fH5t6ckj70cNnkYsPhlJcZ79oSA18fA";


export async function fetchProducts() {
    try {
        let query = {
            limit: 0
        }
        const res = await makeRequest(`${host}/api/products`, 'GET', null, envToken, query);
        console.log(res);
        return res.products.reverse();
    } catch (err) {
        console.error('Error fetching products', err);
    }
}

export async function fetchOrders() {
    try {
        const res = await makeRequest(`${host}/api/orders`, 'GET', null, envToken);
        console.log(res);
        return res;
    } catch (err) {
        console.error('Error fetching orders', err);
    }
}

export async function fetchProductById(id) {
    try {
        const res = await makeRequest(`${host}/api/products/${id}`, 'GET', null, null);
        console.log(res);
        return res;
    } catch (err) {
        console.error('Error fetching product', err);
    }
}

export function filterProducts(productsList, filters) {
    let filteredProducts = productsList.filter((product) => {

        const price = parseInt(product.price);
        if (filters.minPrice > price || filters.maxPrice < price) {
            return false;
        }

        for (let size in filters.sizes) {
            if (filters.sizes[size] && !product.availableSizes.includes(size)) {
                return false;
            }
        }

        for (let style in filters.styles) {
            if (filters.styles[style] && !product.categories.includes(style)) {
                return false;
            }
        }

        if (filters.rating > product.rating) {
            return false;
        }

        return true;
    });
    return filteredProducts;
}

export function specialSearchProducts(productsList, searchTerm) {
    if (!searchTerm || !productsList || productsList.length === 0) {
        return productsList;
    }

    searchTerm = searchTerm.toLowerCase();

    if (searchTerm === "new") {
        console.log("Filtering for new arrivals");
        // Sort by arrival date (newest first) and take the first 10
        return [...productsList]
            .sort((a, b) => {
                const dateA = a.arrivalDate ? new Date(a.arrivalDate) : new Date(a.createdAt || 0);
                const dateB = b.arrivalDate ? new Date(b.arrivalDate) : new Date(b.createdAt || 0);
                return dateB - dateA;
            })
            .slice(0, 10);
    }

    if (searchTerm === "sale") {
        console.log("Filtering for on sale items");
        // Filter products with a discount greater than 0
        return productsList.filter(product => {
            return product.discount > 0;
        });
    }

    if (searchTerm === "shop" || searchTerm === "all") {
        console.log("Returning all products");
        return productsList;
    }

    // If none of the above, return empty array
    console.log("No matching special search for:", searchTerm);
    return [];
}

export function keyFilterProducts(productsList, keyFilter) {
    let [key, value] = keyFilter.split("-");
    return productsList.filter((product) => {
        return product[key].includes(value);
    })
}

export function searchProducts(productsList, searchTerm) {
    return productsList.filter((product) => {
        return product.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
}

export async function makeRequest(endpoint, method = 'GET', body = null, token = null, params = null) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Append query params for GET requests
        if (params && method === 'GET') {
            const query = new URLSearchParams(params).toString();
            endpoint += `?${query}`;
        }

        const options = {
            method,
            headers,
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        console.log(`Making ${method} request to ${endpoint}`, options);
        const response = await fetch(endpoint, options);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error: ${response.status} - ${response.statusText}`, errorText);
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
}

export async function addAllProducts() {
    productsList.forEach(async (product) => {
        await createProduct(product, envToken);
    })
    let products = await fetchProducts();
    for (let i = 0; i < products.length; i++) {
        let product = products[i];
        let rating = Math.floor(Math.random() * 5) + 1;
        await addProductReview(product, { rating: rating, comment: "This is a great product" }, envToken);
    }
}

export async function addAllOrders() {
    ordersList.forEach(async (order) => {
        await createOrder(order, envToken);
    })
}

export async function getAllOrders(token) {
    return await makeRequest(`${host}/api/orders`, 'GET', null, token);
}

export function addProductReview(product, review, token) {
    if (!token) {
        throw new Error("Authentication token is required");
    }

    let body = {
        rating: review.rating > 1 ? review.rating : 1,
        comment: review.comment
    }

    const endpoint = `${host}/api/products/${product.id}/reviews`;
    return makeRequest(endpoint, 'POST', body, token);
}

export async function createProduct(product, token) {
    if (!token) {
        throw new Error("Authentication token is required");
    }

    let body = {
        name: product.name,
        description: product.description,
        price: parseInt(product.price.slice(1)),
        categories: product.categories,
        availableSizes: product.availableSizes,
        brand: 'SHOP.CO',
        countInStock: product.stock,
        imagePath: product.imgPath,
        isFeatured: true,
        discount: product.discount * 100
    }

    const endpoint = `${host}/api/products`;
    return await makeRequest(endpoint, 'POST', body, token);
}

export async function createOrder(order, token) {
    if (!token) {
        throw new Error("Authentication token is required");
    }

    const body = {
        shippingAddress: {
            address: order.shippingAddress.address,
            city: order.shippingAddress.city,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
            phone: order.shippingAddress.phone
        },
        paymentMethod: order.paymentMethod || 'PayPal',
    };

    // Optionally include promoCode
    if (order.promoCode) {
        body.promoCode = order.promoCode;
    }

    const endpoint = `${host}/api/orders`;
    return await makeRequest(endpoint, 'POST', body, token);
}


export async function addToCart(itemData, token) {
    try {
        if (!itemData.productId || !itemData.quantity) {
            throw new Error('Invalid product data');
        }

        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(itemData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add item to cart');
        }

        return await response.json();
    } catch (error) {
        console.error('Error in addToCart:', error);
        throw error;
    }
}

export function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}