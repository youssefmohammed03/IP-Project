class NavBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-lg my-3">
                <div class="container-fluid mx-5">
                    <a class="navbar-brand" href="./index.html"><img src="./assets/LOGO.svg" alt=""></a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                            <li class="nav-item">
                                <a class="nav-link" href="./products.html">Shop</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="./products.html?search=sale">On Sale</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="./products.html?search=new">New Arrivals</a>
                            </li>
                            <form class="d-flex" role="search">
                                <input id="nav-search" class="form-control me-2" type="search"
                                    placeholder="Search for Products..." aria-label="Search">
                                <button class="btn btn-outline-dark rounded-5" onclick="window.open(\`products.html?query=\${document.getElementById('nav-search').value}\`, '_blank');">
                                    <i class="bi bi-search"></i>
                                </button>
                            </form>
                        </ul>
                    </div>
                    <a href="./cart.html" class="mx-3 text-dark"><i class="bi bi-cart4"></i></a>
                    <a href="./profile.html" class="mx-3 text-dark"><i class="bi bi-person-circle"></i></a>
                </div>
            </nav>
        `;
    }
}

class FooterSection extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <div id="footer" class="container-fluid my-4 py-4 justify-content-center">
                <div id="news-letter"
                    class="row rounded-5 align-items-center justify-content-center mw-90 w-75 m-auto py-4 py-md-0">
                    <div class="col-10 col-md-6 rounded-5 pb-4 py-md-4">
                        <h2 class="title display-7">STAY UPTO DATE ABOUT OUR LATEST OFFERS</h2>
                    </div>
                    <div class="col-8 col-md-4">
                        <form>
                            <div class="mb-3">
                                <input type="email" class="form-control rounded-5" id="InputEmail3"
                                    placeholder="Enter your email">
                            </div>
                            <button type="submit" class="btn btn-light rounded-5 w-100">Subscribe to Newsletter</button>
                        </form>
                    </div>
                </div>
                <div id="footer-links" class="row gap-2 justify-content-center">
                    <div class="col-md-3">
                        <img src="assets/LOGO.svg" alt="" class="img-fluid mb-3">
                        <p class="text-wrapper">We have clothes that suits your style and which you're proud to wear. From women
                            to men.</p>
                        <a class="btn btn-light" href=""><i class="bi bi-twitter-x"></i></a>
                        <a class="btn btn-light" href=""><i class="bi bi-facebook"></i></a>
                        <a class="btn btn-light" href=""><i class="bi bi-instagram"></i></a>
                        <a class="btn btn-light" href=""><i class="bi bi-github"></i></a>
                    </div>
                    <div class="col-md-2">
                        <h4>Company</h4>
                        <a class="d-block">About</a>
                        <a class="d-block">Features</a>
                        <a class="d-block">Work</a>
                        <a class="d-block">Career</a>
                    </div>
                    <div class="col-md-2">
                        <h4>Help</h4>
                        <a class="d-block">Customer Support</a>
                        <a class="d-block">Delivery Details</a>
                        <a class="d-block">Terms & Conditions</a>
                        <a class="d-block">Privacy Policy</a>
                    </div>
                    <div class="col-md-2">
                        <h4>FAQ</h4>
                        <a class="d-block">Account</a>
                        <a class="d-block">Manage Deliveries</a>
                        <a class="d-block">Orders</a>
                        <a class="d-block">Payment</a>
                    </div>
                    <div class="col-md-2">
                        <h4>Resources</h4>
                        <a class="d-block">Free eBooks</a>
                        <a class="d-block">Development Tutorial</a>
                        <a class="d-block">How To - Blog</a>
                        <a class="d-block">Youtube PLaylist</a>
                    </div>
                    <hr>
                </div>
                <div id="copyright" class="row justify-content-center">
                    <div class="col-auto">
                        <p class="text-wrapper">© 2020-2025 SHOP.CO. All rights reserved.</p>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('nav-bar', NavBar);
customElements.define('footer-section', FooterSection);
