document.addEventListener('DOMContentLoaded', async () => {
    const productList = document.getElementById('product-list');
    const cartBody = document.getElementById('cart-body');
    const totalSpan = document.getElementById('total');
  
    const token = getCookie('token'); // or however you manage auth
  
    const axiosAuth = axios.create({
      baseURL: '/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    function getCookie(name) {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
          const [cookieName, cookieValue] = cookie.trim().split('=');
          if (cookieName === name) {
              return decodeURIComponent(cookieValue);
          }
      }
      return null;
    }
  
    async function fetchProducts() {
      try {
        const res = await axiosAuth.get('/products');
        productList.innerHTML = '';
        res.data.products.reverse().forEach(product => {
          const card = document.createElement('div');
          card.className = 'col-md-3';
          card.innerHTML = `
            <div class="card mb-4">
              <img src="${product.imagePath}" class="card-img-top" alt="${product.name}" onerror="this.src='./assets/Products/missing.png';this.setAttribute('onerror', '');">
              <div class="card-body">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">$${product.price}</p>
                <button class="btn btn-primary add-to-cart" data-id="${product._id}">Add to Cart</button>
              </div>
            </div>`;
          productList.appendChild(card);
        });
      } catch (err) {
        console.error('Error fetching products', err);
      }
    }
  
    async function fetchCart() {
      try {
        const res = await axiosAuth.get('/cart');
        console.log(res.data);
        cartBody.innerHTML = '';
      }

      // Check if cart is empty
      if (!data.cart.items || data.cart.items.length === 0) {
        if (cartMessage) {
          cartMessage.classList.remove('d-none');
        }
        if (checkoutBtn) {
          checkoutBtn.classList.add('disabled');
        }

        // Reset totals to zero
        if (subtotalSpan) subtotalSpan.textContent = '0.00';
        if (totalSpan) totalSpan.textContent = '0.00';
        return;
      }

      // Hide empty cart message and enable checkout
      if (cartMessage) {
        cartMessage.classList.add('d-none');
      }
      if (checkoutBtn) {
        checkoutBtn.classList.remove('disabled');
      }      // Display cart items
      data.cart.items.forEach(item => {
        if (!cartBody) return;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
              <div class="d-flex align-items-center">
                <img src="${item.product.imagePath || './assets/Products/missing.png'}" 
                    alt="${item.name}" 
                    style="width: 60px; height: 60px; object-fit: cover;" 
                    class="me-3 rounded">
                <span>${item.name}</span>
              </div>
            </td>
            <td>$${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>
              <button class="btn btn-sm btn-danger remove-from-cart" data-id="${item._id}">Remove</button>
            </td>`;

        cartBody.appendChild(row);
      });// Update totals
      if (totalSpan) totalSpan.textContent = data.total.toFixed(2);
      if (subtotalSpan) subtotalSpan.textContent = data.total.toFixed(2);

    } catch (err) {
      console.error('Error loading cart:', err);
    }
  }

  async function addToCart(productId) {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ productId })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      await fetchCart();
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  }
  async function removeFromCart(itemId) {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from cart');
      }

      await fetchCart();
    } catch (err) {
      console.error('Remove from cart failed:', err);
    }
  }

  async function clearCart() {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: headers
      });

      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }

      await fetchCart();
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  }

  // Event delegation
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart')) {
      addToCart(e.target.dataset.id);
    } if (e.target.classList.contains('remove-from-cart')) {
      removeFromCart(e.target.dataset.id);
    }
  });

  // Add Clear Cart button event listener
  const clearCartBtn = document.getElementById('clear-cart-btn');
  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', clearCart);
  }

  await fetchProducts();
  await fetchCart();
});