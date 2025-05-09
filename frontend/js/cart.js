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
        res.data.cart.items.forEach(item => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${item.product.name}</td>
            <td>${item.product.price}</td>
            <td>
              <button class="btn btn-sm btn-danger remove-from-cart" data-id="${item._id}">Remove</button>
            </td>`;
          cartBody.appendChild(row);
        });
        totalSpan.innerText = res.data.total;
      } catch (err) {
        console.error('Error loading cart', err);
      }
    }
  
    async function addToCart(productId) {
      try {
        await axiosAuth.post('/cart', { productId });
        fetchCart();
      } catch (err) {
        console.error('Add to cart failed', err);
      }
    }
  
    async function removeFromCart(itemId) {
      try {
        await axiosAuth.delete(`/cart/${itemId}`);
        fetchCart();
      } catch (err) {
        console.error('Remove from cart failed', err);
      }
    }
    
    async function clearCart() {
        const cartBody = document.getElementById('cart-body');
        cartBody.innerHTML = '';
        document.getElementById('total').textContent = '0';
        const res = await axiosAuth.delete('/cart');
        console.log(res);
        alert('Cart has been cleared!');
    }

    document.getElementById('confirm-checkout').addEventListener('click', async () => {
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const postalCode = document.getElementById('postalCode').value;
        const country = document.getElementById('country').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const promoCode = document.getElementById('promoCode').value;

        const orderData = {
            shippingAddress: {
                address,
                city,
                postalCode,
                country
            },
            paymentMethod,
            promoCode: promoCode || undefined
        };

        try {
            const response = await axios.post('/api/orders', orderData, {
                headers: {
                    Authorization: `Bearer ${getCookie('token')}`
                }
            });

            if (response.status === 201) {
                clearCart();
                alert('Order placed successfully!');
                // Optionally, redirect or clear the cart
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    });
  
    // Event delegation
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('add-to-cart')) {
        addToCart(e.target.dataset.id);
      }
  
      if (e.target.classList.contains('remove-from-cart')) {
        removeFromCart(e.target.dataset.id);
      }

      if (e.target.classList.contains('clear-cart')) {
        clearCart();
      }
    });
  
    await fetchProducts();
    await fetchCart();
  });
