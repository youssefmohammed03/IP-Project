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
    }
    div2.appendChild(button);

    div = document.createElement('div');
    div.className = 'col-7';
    row.appendChild(div);

    button = document.createElement('button');
    button.className = 'btn btn-dark rounded-5 w-100';
    button.textContent = 'Add to Cart';
    div.appendChild(button);
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