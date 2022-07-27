import {
    productsData
} from "./products.js";
const cartBtn = document.querySelector(".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const productsDOM = document.querySelector(".products-center")
const cartTotal = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const clearCart = document.querySelector(".clear-cart");

let buttonsDOM = [];
let cart = [];
//1.get products


class Products {
    getProduct() {
        return productsData;
    }
}

//2.display products

class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(item => {
            result += `<div class="product">
        <div class="img-container">
          <img src=${item.imageUrl} class="product-img" />
        </div>
        <div class="product-desc">
          <p class="product-price">$ ${item.price}</p>
          <p class="product-title">${item.title}</p>
        </div>
        <button class="btn add-to-cart " data-id=${item.id}>
          <i class="fas fa-shopping-cart"></i>
          add to cart
        </button>
      </div>`;
        });
        productsDOM.innerHTML = result;
    }
    getAddToCartBtns() {
        const addToCartBtn = [...document.querySelectorAll(".add-to-cart")]
        buttonsDOM = addToCartBtn;
        addToCartBtn.forEach((btn) => {
            const id = btn.dataset.id;
            const isInCart = cart.find((p) => p.id === id);
            // console.log(id);
            if (isInCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            }
            btn.addEventListener("click", (event) => {
                event.target.innerHTML = "In cart";
                event.target.disabled = true;
                // console.log(event.target.dataset.id);
                const addedProduct = {
                    ...Storage.getProduct(id),
                    quantity: 1
                };
                cart = [...cart, addedProduct];
                // save cart to local storage
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // add to cart item
                this.addCartItem(addedProduct);

                // get cart from storage
            });

        })
    }
    setCartValue(cart) {
        let tempCartItem = 0;
        const totalPrice = cart.reduce((acc, curr) => {
            tempCartItem += curr.quantity;
            return acc + curr.quantity * curr.price;
        }, 0);
        cartTotal.innerText = `Total Price:${totalPrice.toFixed(2)}`;
        cartItems.innerText = tempCartItem;

    }
    addCartItem(cartItem) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `<img class="cart-item-img" src=${cartItem.imageUrl} />
        <div class="cart-item-desc">
          <h4>${cartItem.title}</h4>
          <h5>$ ${cartItem.price}</h5>
        </div>
        <div class="cart-item-conteoller">
          <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
          <p>${cartItem.quantity}</p>
          <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
        </div>
        <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
        `;
        cartContent.appendChild(div);
    }
    setupApp() {
        //get cart from storage
        cart = Storage.getCart() || [];
        // add cart item
        cart.forEach((cartItem) => this.addCartItem(cartItem));
        // set value:
        this.setCartValue(cart);

    }
    cartLogic() {
        // clear cart:
        clearCart.addEventListener("click", () => this.clearCart());
        cartContent.addEventListener("click", (event) => {
            // console.log(event.target.dataset.id);
            if (event.target.classList.contains("fa-chevron-up")) {
                // console.log(event.target.dataset.id);
                const addQuantity = event.target;
                // get item from cart
                const addedItem = cart.find((cItem) => cItem.id == addQuantity.dataset.id);
                addedItem.quantity++;
                // save cart
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // update cart item in UI
                addQuantity.nextElementSibling.innerText = addedItem.quantity;

            } else if (event.target.classList.contains("fa-trash-alt")) {
                const removeItem = event.target;
                const _removedItem = cart.find((c) => c.id == removeItem.dataset.id);
                this.removeItem(_removedItem.id);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement);
            } else if (event.target.classList.contains("fa-chevron-down")) {
                // console.log(event.target.dataset.id);
                const subQuantity = event.target;
                // get item from cart
                const subStractedItem = cart.find((cItem) => cItem.id == subQuantity.dataset.id);
                if(subStractedItem.quantity===1){
                    this.removeItem(subStractedItem.id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                }
                subStractedItem.quantity--;
                // save cart
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // update cart item in UI
                subQuantity.previousElementSibling.innerText =subStractedItem.quantity;
            }
        })
    }
    clearCart() {
        // remove (DRY):
        cart.forEach((cItem) => this.removeItem(cItem.id));
        // remove cart content children:
        while (cartContent.children.length) {
            cartContent.removeChild(cartContent.children[0]);
        }
        closeModalFunction();

    }
    removeItem(id) {
        // updeate cart
        cart = cart.filter((cItem) => cItem.id !== id);
        // total price and cart item
        this.setCartValue(cart);
        // update storage
        Storage.saveCart(cart);
        // get add to cart btns=> update text and disable
        this.getSingleButton(id);
    }
    getSingleButton(id) {
        const button = buttonsDOM.find((btn) => btn.dataset.id == parseInt(id));
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        add to cart`;
        button.disabled = false;
    }
}


//3.storage

class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        const _products = JSON.parse(localStorage.getItem("products"));
        return _products.find((p) => p.id === parseInt(id));
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return JSON.parse(localStorage.getItem("cart"));
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const products = new Products();
    const productsData = products.getProduct();
    // set up:get cart and set up app
    const ui = new UI();
    ui.cartLogic();
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtns();
    Storage.saveProducts(productsData);
    // console.log(productsData);
})


// cart items modal
function showModalFunction() {
    backDrop.style.display = "block";
    cartModal.style.opacity = "1";
    cartModal.style.top = "20%";
}

function closeModalFunction() {
    backDrop.style.display = "none";
    cartModal.style.opacity = "0";
    cartModal.style.top = "-100%";
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);