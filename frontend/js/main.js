import { fetchProducts, specialSearchProducts } from "./utils.js";

let productsList = await fetchProducts();

function incrementNumber(elementID, maxNumber) {
    let currentNumber = 0;
    const element = document.getElementById(elementID);
    const interval = setInterval(() => {
        if (currentNumber < maxNumber) {
            currentNumber += Math.ceil(maxNumber / 100);
            element.innerHTML = currentNumber.toLocaleString() + "+";
        } else {
            clearInterval(interval);
        }
    }, 10);
}


function productConainerBuilder(elementID, searchFilter, number) {
    let element = document.getElementById(elementID);

    var products = specialSearchProducts(productsList, searchFilter).slice(0, number);

    element.innerHTML = `<div class="container text-center my-4"><h1 class="title display-5">${elementID.replace("-", " ").toUpperCase()}</h1></div>`;
    
    let container = document.createElement("div");
    container.className = "container-fluid my-3";
    element.appendChild(container);
    
    let scrollContainer = document.createElement("div");
    scrollContainer.className = "overflow-x-auto scroll-container";
    container.appendChild(scrollContainer);

    let row = document.createElement("div");
    row.className = "row flex-nowrap";
    scrollContainer.appendChild(row);
    
    products.forEach((product) => {
        let col = document.createElement("div");
        col.className = "col-auto justify-content-center hover-card";
        col.setAttribute("onclick", `window.open('product.html?id=${product._id}', '_blank');`);
        row.appendChild(col);
        
        let img = document.createElement("img");
        img.src = product.imagePath;
        img.setAttribute("onerror", "this.src='./assets/Products/missing.png';this.setAttribute('onerror', '');");
        img.className = "img-fluid rounded my-2";
        img.style.width = "240px";
        img.style.height = "240px";
        col.appendChild(img);
        
        let productName = document.createElement("h5");
        productName.innerHTML = product.name;
        col.appendChild(productName);
        
        let productRating = document.createElement("p");
        productRating.className = "fs-6";
        for (let i = 0; i < Math.floor(product.rating); i++) {
            productRating.innerHTML += '<i class="text-warning bi bi-star-fill"></i>';
        }
        if (product.rating % 1 != 0) {
            productRating.innerHTML += '<i class="text-warning bi bi-star-half"></i>';
        }
        productRating.innerHTML += `<span class="text-muted"> ${product.rating}/5</span>`;
        col.appendChild(productRating);
        
        let productPrice = document.createElement("h5");
        if (product.discount > 0) {
            productPrice.innerHTML = `<span>$${parseInt(product.price * (1 - product.discount/100))}</span> <span class="text-decoration-line-through text-muted">$${product.price}</span>`;
        }
        else {
            productPrice.innerHTML = `$${product.price}`;
        }
        
        col.appendChild(productPrice);
    });
    
    row = document.createElement("div");
    row.className = "row justify-content-center";
    container.appendChild(row);
    
    let col = document.createElement("div");
    col.className = "col-5 col-md-auto";
    row.appendChild(col);

    let button = document.createElement("button");
    button.className = "btn btn-outline-dark btn-lg my-2 rounded-5 w-100";
    button.innerHTML = "View All";
    button.setAttribute("onclick", `window.open('products.html?search=${searchFilter}', '_blank');`);
    col.appendChild(button);

}







incrementNumber("brand-counter", 200);
incrementNumber("product-counter", 2000);
incrementNumber("customer-counter", 30000);

productConainerBuilder("New-Arrivals", "new", 4);
productConainerBuilder("On-Sale", "sale", 4);