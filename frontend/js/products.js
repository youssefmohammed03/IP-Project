import { fetchProducts, specialSearchProducts, keyFilterProducts, searchProducts, filterProducts, addAllProducts } from "./utils.js";

let maxPrice = 500;
let minPrice = 0;

let filters = {
    minPrice: minPrice,
    maxPrice: maxPrice,

    sizes: {
        "xxsmall": false,
        "xsmall": false,
        "small": false,
        "medium": false,
        "large": false,
        "xlarge": false,
        "xxlarge": false,
        "xxxlarge": false
    },

    styles: {
        "casual": false,
        "formal": false,
        "party": false,
        "gym": false
    },

    rating: 0
};

let productsList = await fetchProducts();

const params = new URLSearchParams(window.location.search);
const productSearch = params.get('search');
const productKey = params.get("key");
const productQuery = params.get("query");

if (productSearch) {
    let filteredProductsList = specialSearchProducts(productsList, productSearch);
    if (filteredProductsList) {
        productsList = filteredProductsList;
        document.getElementById('products-title').innerHTML += (" - " + productSearch);
    }
} else if (productKey) {
    let filteredProductsList = keyFilterProducts(productsList, productKey);
    if (filteredProductsList) {
        productsList = filteredProductsList;
        document.getElementById(`${productKey.split("-")[1]}-style`).checked = true;
        updateFilters(document.getElementById(`${productKey.split("-")[1]}-style`));
    }
} else if (productQuery) {
    let filteredProductsList = searchProducts(productsList, productQuery);
    productsList = filteredProductsList;
}

function updateFilters(element) {
    let filter = element.id.split("-");
    switch (filter[1]) {
        case "Price":
            switch (filter[0]) {
                case "Min":
                    filters.minPrice = element.value;
                    break;
                case "Max":
                    filters.maxPrice = element.value;
                    break;
            }
            break;
        case "size":
            filters.sizes[filter[0]] = element.checked;
            break;
        case "style":
            filters.styles[filter[0]] = element.checked;
            break;
        case "rate":
            filters.rating = parseInt(element.value);
            break;
    }
    console.log(filters);
    productBuilder("products-body", filters);
}

function setLabelValue(element) {
    let id = element.id;
    let label = document.querySelector(`label[for="${id}"]`);
    if (label) {
        label.innerHTML = id.replace("-", " ") + ": " + element.value;
    } else {
        console.error("Label not found for element with id: " + id);
    }
}

function closeFilters() {
    let filters = document.getElementById("filters");
    filters.classList.remove("show");
}

function applyFilters() {
    productBuilder("products-body", filters);
}

function productBuilder(elementID, searchFilter) {
    let element = document.getElementById(elementID);
    element.innerHTML = ""; // Clear previous content

    let products = filterProducts(productsList, searchFilter);
    const productsPerPage = 12;
    const totalPages = Math.ceil(products.length / productsPerPage);
    let currentPage = 1;

    const container = document.createElement("div");
    container.className = "container-fluid my-3";
    element.appendChild(container);

    // --- Create Page Containers ---
    for (let i = 1; i <= totalPages; i++) {
        const row = document.createElement("div");
        row.id = `page${i}`;
        row.className = "row justify-content-center";
        if (i !== 1) row.classList.add("d-none");
        container.appendChild(row);

        const pageProducts = products.slice((i - 1) * productsPerPage, i * productsPerPage);
        pageProducts.forEach((product) => {
            const col = document.createElement("div");
            col.className = "col-10 col-md-3 justify-content-center hover-card";
            col.setAttribute("onclick", `window.open('product.html?id=${product._id}', '_blank');`);
            row.appendChild(col);

            const img = document.createElement("img");
            img.src = product.imagePath;
            img.setAttribute("onerror", "this.src='./assets/Products/missing.png';this.setAttribute('onerror', '');");
            img.className = "img-fluid rounded my-2";
            img.style.aspectRatio = "1/1";
            col.appendChild(img);

            const productName = document.createElement("h5");
            productName.innerHTML = product.name;
            col.appendChild(productName);

            const productRating = document.createElement("p");
            productRating.className = "fs-6";
            for (let i = 0; i < Math.floor(product.rating); i++) {
                productRating.innerHTML += '<i class="text-warning bi bi-star-fill"></i>';
            } if (product.rating % 1 !== 0) {
                productRating.innerHTML += '<i class="text-warning bi bi-star-half"></i>';
            }
            productRating.innerHTML += `<span class="text-muted"> ${product.rating.toFixed(1)}/5</span>`;
            col.appendChild(productRating);

            const productPrice = document.createElement("h5");
            if (product.discount > 0) {
                productPrice.innerHTML = `<span>$${parseInt(product.price * (1 - product.discount / 100))}</span> <span class="text-decoration-line-through text-muted">$${product.price}</span>`;
            }
            else {
                productPrice.innerHTML = `$${product.price}`;
            }
            col.appendChild(productPrice);
        });
    }

    // --- Pagination Controls ---
    const paginationContainer = document.createElement("div");
    paginationContainer.className = "my-4";
    container.appendChild(paginationContainer);

    function renderPagination() {
        paginationContainer.innerHTML = "";

        const row = document.createElement("div");
        row.className = "row justify-content-center align-items-center gap-2 flex-wrap";
        paginationContainer.appendChild(row);

        // Prev button
        const colPrev = document.createElement("div");
        colPrev.className = "col-auto";
        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-outline-dark";
        prevBtn.textContent = "« Prev";
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => switchPage(currentPage - 1);
        colPrev.appendChild(prevBtn);
        row.appendChild(colPrev);

        // Page input
        const colInput = document.createElement("div");
        colInput.className = "col-auto d-flex align-items-center";

        const input = document.createElement("input");
        input.type = "number";
        input.min = 1;
        input.max = totalPages;
        input.value = currentPage;
        input.className = "form-control text-center mx-1";
        input.style.width = "70px";

        input.onchange = () => {
            let page = parseInt(input.value);
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                switchPage(page);
            } else {
                input.value = currentPage; // Reset if invalid
            }
        };

        const slash = document.createElement("span");
        slash.className = "mx-1";
        slash.innerText = ` / ${totalPages}`;

        colInput.appendChild(input);
        colInput.appendChild(slash);
        row.appendChild(colInput);

        // Next button
        const colNext = document.createElement("div");
        colNext.className = "col-auto";
        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-outline-dark";
        nextBtn.textContent = "Next »";
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => switchPage(currentPage + 1);
        colNext.appendChild(nextBtn);
        row.appendChild(colNext);
    }

    function switchPage(page) {
        document.getElementById(`page${currentPage}`).classList.add("d-none");
        currentPage = page;
        document.getElementById(`page${currentPage}`).classList.remove("d-none");
        renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    renderPagination();
}

window.setLabelValue = setLabelValue;
window.closeFilters = closeFilters;
window.updateFilters = updateFilters;
window.productBuilder = productBuilder;
window.applyFilters = applyFilters;
window.addAllProducts = addAllProducts;

productBuilder("products-body", filters);

document.getElementById("Min-Price").max = maxPrice;
document.getElementById("Min-Price").min = minPrice;
document.querySelector(`label[for="Min-Price"]`).innerHTML = "Min Price: " + minPrice;
document.getElementById("Min-Price").value = minPrice;

document.getElementById("Max-Price").max = maxPrice;
document.getElementById("Max-Price").min = minPrice;
document.querySelector(`label[for="Max-Price"]`).innerHTML = "Max Price: " + maxPrice;
document.getElementById("Max-Price").value = maxPrice;
