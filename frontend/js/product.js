import { fetchProductById } from './utils.js';

const params = new URLSearchParams(window.location.search);
const productID = params.get('id');
const product = await fetchProductById(productID);

console.log(product);

function ProductBodyBuilder() {
    let container = document.getElementById('product-body');
    container.innerHTML = '';

    let row = document.createElement('div');
    row.className = 'row justify-content-center';
    container.appendChild(row);

    let col = document.createElement('div');
    col.className = 'col-10 col-md-auto d-flex justify-content-center align-items-center';
    row.appendChild(col); let img = document.createElement('img');
    img.src = product.imagePath || './assets/Products/missing.png';
    img.setAttribute("onerror", "this.src='./assets/Products/missing.png';this.setAttribute('onerror', '');");
    img.className = 'img-fluid rounded-5 h-md-75 my-4';
    img.id = 'product-image';
    col.appendChild(img);

    col = document.createElement('div');
    col.className = 'col-10 col-md-4';
    row.appendChild(col);

    let div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    let h1 = document.createElement('h1');
    h1.className = 'title fs-1';
    h1.id = 'product-title';
    h1.textContent = product.name;
    div.appendChild(h1);

    div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    for (let i = 0; i < product.rating; i++) {
        let i = document.createElement('i');
        i.className = 'bi bi-star-fill text-warning';
        div.appendChild(i);
    }
    if (product.rating % 1 != 0) {
        let i = document.createElement('i');
        i.className = 'bi bi-star-half text-warning';
        div.appendChild(i);
    }
    div.innerHTML += `<span class="text-muted"> ${product.rating}/5</span>`;

    div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    let h2 = document.createElement('h2');
    h2.className = 'title fs-4';
    div.appendChild(h2); if (product.discount <= 0) {
        let span = document.createElement('span');
        span.textContent = `$${product.price.toFixed(2)}`;
        h2.appendChild(span);
    } else {
        let span = document.createElement('span');
        const discountedPrice = product.finalPrice || (product.price * (1 - product.discount / 100));
        span.textContent = `$${discountedPrice.toFixed(2)} `;
        h2.appendChild(span);

        span = document.createElement('span');
        span.className = 'text-decoration-line-through text-secondary';
        span.textContent = `$${product.price.toFixed(2)}`;
        h2.appendChild(span);
    }

    div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    let p = document.createElement('p');
    p.className = 'small text-secondary';
    p.textContent = (product.description) ? product.description : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
    div.appendChild(p);

    let hr = document.createElement('hr');
    col.appendChild(hr);

    div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    h2 = document.createElement('h2');
    h2.className = 'small text-secondary';
    h2.textContent = 'Select Size';
    div.appendChild(h2); div = document.createElement('div');
    div.className = 'd-flex gap-2';
    col.appendChild(div);

    // Check if the product has available sizes
    if (product.availableSizes && product.availableSizes.length > 0) {
        product.availableSizes.forEach(size => {
            let input = document.createElement('input');
            input.type = 'radio';
            input.className = 'btn-check';
            input.name = 'size';
            input.id = size;
            input.value = size;

            let label = document.createElement('label');
            label.className = 'btn btn-outline-dark rounded-5';
            label.htmlFor = size;
            label.textContent = size;

            div.appendChild(input);
            div.appendChild(label);
        });
    } else {
        // Display a message if no sizes are available
        let noSizesMsg = document.createElement('p');
        noSizesMsg.className = 'text-muted';
        noSizesMsg.textContent = 'No sizes available';
        div.appendChild(noSizesMsg);
    }

    hr = document.createElement('hr');
    col.appendChild(hr);

    div = document.createElement('div');
    div.className = 'col-11';
    col.appendChild(div);

    h2 = document.createElement('h2');
    h2.className = 'small text-secondary';
    h2.textContent = 'Quantity';
    div.appendChild(h2);

    row = document.createElement('div');
    row.className = 'row';
    col.appendChild(row);

    div = document.createElement('div');
    div.className = 'col-5';
    row.appendChild(div);

    let div2 = document.createElement('div');
    div2.className = 'border rounded-5';
    div2.style.width = 'fit-content';
    div.appendChild(div2);

    let button = document.createElement('button');
    button.className = 'btn btn-outline-secondary rounded-5';
    button.innerHTML = `<i class="bi bi-plus"></i>`;
    button.onclick = () => {
        document.getElementById('quantity').textContent = parseInt(document.getElementById('quantity').textContent) + 1;
    }
    div2.appendChild(button);

    let span = document.createElement('span');
    span.id = 'quantity';
    span.className = 'mx-2';
    span.textContent = '1';
    div2.appendChild(span);

    button = document.createElement('button');
    button.className = 'btn btn-outline-secondary rounded-5';
    button.innerHTML = `<i class="bi bi-dash"></i>`;
    button.onclick = () => {
        let quantity = parseInt(document.getElementById('quantity').textContent);
        if (quantity > 1) {
            document.getElementById('quantity').textContent = quantity - 1;
        }
    };
    div2.appendChild(button);

    div = document.createElement('div');
    div.className = 'col-7';
    row.appendChild(div);

    button = document.createElement('button');
    button.className = 'btn btn-dark rounded-5 w-100';
    button.textContent = 'Add to Cart';
    button.id = 'add-to-cart-btn';
    button.onclick = addToCart;
    div.appendChild(button);

    // Add reviews section
    addReviewsSection(container);
}

// Function to add the reviews section
function addReviewsSection(container) {
    // Create a row for reviews
    let reviewsRow = document.createElement('div');
    reviewsRow.className = 'row justify-content-center mt-5';
    container.appendChild(reviewsRow);

    // Create column for reviews
    let reviewsCol = document.createElement('div');
    reviewsCol.className = 'col-10';
    reviewsRow.appendChild(reviewsCol);

    // Add a heading for the reviews section
    let reviewsHeading = document.createElement('h3');
    reviewsHeading.className = 'mb-4';
    reviewsHeading.textContent = 'Customer Reviews';
    reviewsCol.appendChild(reviewsHeading);

    // Display existing reviews if available
    if (product.reviews && product.reviews.length > 0) {
        let reviewsList = document.createElement('div');
        reviewsList.className = 'reviews-list mb-4';
        reviewsCol.appendChild(reviewsList);

        product.reviews.forEach(review => {
            let reviewCard = document.createElement('div');
            reviewCard.className = 'card mb-3';

            let cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Review header with user name and date
            let reviewHeader = document.createElement('div');
            reviewHeader.className = 'd-flex justify-content-between align-items-center mb-2';

            let userName = document.createElement('h5');
            userName.className = 'card-title mb-0';
            userName.textContent = review.name;

            let reviewDate = document.createElement('small');
            reviewDate.className = 'text-muted';
            reviewDate.textContent = new Date(review.createdAt).toLocaleDateString();

            reviewHeader.appendChild(userName);
            reviewHeader.appendChild(reviewDate);
            cardBody.appendChild(reviewHeader);

            // Star rating
            let ratingDiv = document.createElement('div');
            ratingDiv.className = 'mb-2';

            for (let i = 0; i < 5; i++) {
                let star = document.createElement('i');
                if (i < review.rating) {
                    star.className = 'bi bi-star-fill text-warning';
                } else {
                    star.className = 'bi bi-star text-warning';
                }
                ratingDiv.appendChild(star);
            }

            let ratingText = document.createElement('span');
            ratingText.className = 'ms-2';
            ratingText.textContent = `${review.rating}/5`;
            ratingDiv.appendChild(ratingText);

            cardBody.appendChild(ratingDiv);

            // Review comment
            if (review.comment) {
                let comment = document.createElement('p');
                comment.className = 'card-text';
                comment.textContent = review.comment;
                cardBody.appendChild(comment);
            }

            reviewCard.appendChild(cardBody);
            reviewsList.appendChild(reviewCard);
        });
    } else {
        let noReviews = document.createElement('p');
        noReviews.className = 'text-muted mb-4';
        noReviews.textContent = 'No reviews yet. Be the first to review this product!';
        reviewsCol.appendChild(noReviews);
    }

    // Add review form for logged-in users
    addReviewForm(reviewsCol);
}

// Function to add the review submission form
function addReviewForm(container) {
    // Check if user is logged in
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

    const token = getCookie('token');

    if (!token) {
        // User is not logged in, show message
        let loginMessage = document.createElement('div');
        loginMessage.className = 'alert alert-info';
        loginMessage.innerHTML = 'Please <a href="login">login</a> to leave a review.';
        container.appendChild(loginMessage);
        return;
    }

    // User is logged in, show review form
    let reviewFormCard = document.createElement('div');
    reviewFormCard.className = 'card';
    container.appendChild(reviewFormCard);

    let cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    reviewFormCard.appendChild(cardBody);

    let formTitle = document.createElement('h5');
    formTitle.className = 'card-title mb-3';
    formTitle.textContent = 'Write a Review';
    cardBody.appendChild(formTitle);

    // Rating selector
    let ratingDiv = document.createElement('div');
    ratingDiv.className = 'mb-3';

    let ratingLabel = document.createElement('label');
    ratingLabel.className = 'form-label';
    ratingLabel.textContent = 'Your Rating';
    ratingDiv.appendChild(ratingLabel);

    let starsDiv = document.createElement('div');
    starsDiv.className = 'd-flex align-items-center';
    ratingDiv.appendChild(starsDiv);

    // Create interactive star rating
    for (let i = 1; i <= 5; i++) {
        let starLabel = document.createElement('label');
        starLabel.className = 'star-rating-label me-2';
        starLabel.style.cursor = 'pointer';
        starLabel.style.fontSize = '1.5rem';
        starLabel.htmlFor = 'star-' + i;

        let starInput = document.createElement('input');
        starInput.type = 'radio';
        starInput.name = 'rating';
        starInput.value = i;
        starInput.id = 'star-' + i;
        starInput.style.display = 'none';

        let starIcon = document.createElement('i');
        starIcon.className = 'bi bi-star text-warning';
        starIcon.dataset.rating = i;

        // Add event listeners for hover effect
        starLabel.addEventListener('mouseenter', function () {
            // Fill stars up to this one
            document.querySelectorAll('.star-rating-label i').forEach(star => {
                if (parseInt(star.dataset.rating) <= i) {
                    star.className = 'bi bi-star-fill text-warning';
                } else {
                    star.className = 'bi bi-star text-warning';
                }
            });
        });

        // Add event listener for click
        starInput.addEventListener('change', function () {
            // Update all stars based on selection
            document.querySelectorAll('.star-rating-label i').forEach(star => {
                if (parseInt(star.dataset.rating) <= i) {
                    star.className = 'bi bi-star-fill text-warning';
                } else {
                    star.className = 'bi bi-star text-warning';
                }
            });
        });

        starLabel.appendChild(starInput);
        starLabel.appendChild(starIcon);
        starsDiv.appendChild(starLabel);
    }

    // Mouse leave event for the stars container
    starsDiv.addEventListener('mouseleave', function () {
        // Check which star is selected
        const selectedStar = document.querySelector('input[name="rating"]:checked');
        if (selectedStar) {
            const rating = parseInt(selectedStar.value);
            document.querySelectorAll('.star-rating-label i').forEach(star => {
                if (parseInt(star.dataset.rating) <= rating) {
                    star.className = 'bi bi-star-fill text-warning';
                } else {
                    star.className = 'bi bi-star text-warning';
                }
            });
        } else {
            // No star selected, reset all
            document.querySelectorAll('.star-rating-label i').forEach(star => {
                star.className = 'bi bi-star text-warning';
            });
        }
    });

    cardBody.appendChild(ratingDiv);

    // Text area for review comment
    let commentDiv = document.createElement('div');
    commentDiv.className = 'mb-3';

    let commentLabel = document.createElement('label');
    commentLabel.className = 'form-label';
    commentLabel.textContent = 'Your Review';
    commentLabel.htmlFor = 'review-comment';
    commentDiv.appendChild(commentLabel);

    let commentTextarea = document.createElement('textarea');
    commentTextarea.className = 'form-control';
    commentTextarea.id = 'review-comment';
    commentTextarea.rows = 4;
    commentTextarea.placeholder = 'Share your experience with this product...';
    commentDiv.appendChild(commentTextarea);

    cardBody.appendChild(commentDiv);

    // Submit button
    let submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = 'Submit Review';
    submitBtn.id = 'submit-review-btn';
    submitBtn.onclick = submitReview;
    cardBody.appendChild(submitBtn);

    // Error message container
    let errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger mt-3 d-none';
    errorDiv.id = 'review-error';
    cardBody.appendChild(errorDiv);
}

// Function to submit a review
async function submitReview() {
    try {
        // Get selected rating
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (!selectedRating) {
            document.getElementById('review-error').textContent = 'Please select a rating';
            document.getElementById('review-error').classList.remove('d-none');
            return;
        }

        const rating = selectedRating.value;
        const comment = document.getElementById('review-comment').value;

        // Get token for auth
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

        const token = getCookie('token');

        // Create loading effect on button
        const button = document.getElementById('submit-review-btn');
        const originalText = button.textContent;
        button.textContent = 'Submitting...';
        button.disabled = true;

        // Make API request to add review
        const response = await fetch(`/api/products/${productID}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                rating,
                comment
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit review');
        }

        // Show success message
        button.textContent = 'Review Submitted!';
        button.classList.add('btn-success');

        // Reload page after delay to show the new review
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (error) {
        console.error('Error submitting review:', error);

        // Show error message
        document.getElementById('review-error').textContent = 'Failed to submit review. Please try again.';
        document.getElementById('review-error').classList.remove('d-none');

        // Reset button
        const button = document.getElementById('submit-review-btn');
        button.textContent = 'Submit Review';
        button.disabled = false;
    }
}

// Add to cart functionality
async function addToCart() {
    try {
        // Get token from cookie for authentication
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

        const token = getCookie('token');

        if (!token) {
            window.location.href = 'login';
            return;
        }

        // Get selected quantity
        const quantity = parseInt(document.getElementById('quantity').textContent);

        // Create loading effect on button
        const button = document.getElementById('add-to-cart-btn');
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        button.disabled = true;

        // Make API request to add item to cart using native fetch
        const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productId: productID,
                quantity: quantity
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add to cart');
        }

        // Restore button and show success message
        button.textContent = 'Added to Cart!';
        button.classList.add('btn-success');

        // Reset button after delay
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-dark');
            button.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Error adding to cart:', error);

        // Show error on button
        const button = document.getElementById('add-to-cart-btn');
        button.textContent = 'Failed to Add';
        button.classList.add('btn-danger');

        // Reset button after delay
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.classList.remove('btn-danger');
            button.classList.add('btn-dark');
            button.disabled = false;
        }, 2000);
    }
}

ProductBodyBuilder();











/*
<div class="row justify-content-center">
<div class="col-10 col-md-auto d-flex justify-content-center">
    <img src="assets/Products/p1.png" class="img-fluid rounded-5" id="product-image" alt="Product Image">
</div>
<div class="col-10 col-md-4">
    <div class="col-11">
        <h1 class="title fs-1" id="product-title">T-Shirt</h1>
    </div>
    <div class="col-11">
        <i class="bi bi-star-fill text-warning"></i>
        <i class="bi bi-star-fill text-warning"></i>
        <i class="bi bi-star-fill text-warning"></i>
        3/5
    </div>
    <div class="col-11">
        <h2 class="title fs-4">
            <span>$260</span>
            <span class="text-decoration-line-through text-secondary">$300</span>
        </h2>
    </div>
    <div class="col-11">
        <p class="small text-secondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.</p>
    </div>
    <hr>
    <div class="col-11">
        <h2 class="small text-secondary">Select Size</h2>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-dark rounded-5" id="size-s"><small>Small</small></button>
            <button class="btn btn-outline-dark rounded-5" id="size-m"><small>Medium</small></button>
            <button class="btn btn-outline-dark rounded-5" id="size-l"><small>Large</small></button>
            <button class="btn btn-outline-dark rounded-5" id="size-xl"><small>X-Large</small></button>
        </div>
    </div>
    <hr>
    <div class="row">
        <div class="col-5">
            <div class="border rounded-5" style="width: fit-content;">
                <button class="btn btn-outline-secondary rounded-5"><i class="bi bi-plus"></i></button>
                <span class="mx-2">1</span>
                <button class="btn btn-outline-secondary rounded-5"><i class="bi bi-dash"></i></button>
            </div>
        </div>
        <div class="col-7">
            <button class="btn btn-dark rounded-5 w-100">ADD TO CART</button>
        </div>
    </div>
</div>
</div>
*/