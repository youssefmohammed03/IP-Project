import { fetchProductById } from './utils.js';

const params = new URLSearchParams(window.location.search);
const productID = params.get('id'); 
const product = await fetchProductById(productID);

console.log(product);
