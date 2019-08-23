const cartBtn = document.querySelector('.cart-btn');
const closeCart = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartContent = document.querySelector('.cart-content');
const cartItem = document.querySelector('.cart-item');
const cartTotal = document.querySelector('.cart-total');
const productsDOM = document.querySelector('.products-center');
const cartItems = document.querySelector('.cart-items');
// cart
let cart = [];
// button
let buttonDOM = [];
// getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch('./products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display
class UI {
  async displayProducts(products) {
    try {
      let result = '';
      products.forEach(product => {
        result += ` <article class="product">
          <div class="img-container">
            <img class="product-img " src="${product.image}" alt="">
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to bag
            </button>
          </div>
          <h3>${product.title} </h3>
          <h4>${product.price}</h4>
        </article>`;
      });
      productsDOM.innerHTML = result;
    } catch (error) {}
  }

  async getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonDOM = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerHTML = 'In cart';
        button.disabled = true;
      } else {
        button.addEventListener('click', event => {
          event.target.innerText = 'In cart';
          event.target.disabled = true;
          // get product from products
          let cartItem = { ...Storage.getProduct(id), amount: 1 };
          //  add product in cart
          cart = [...cart, cartItem];
          // save cart in localStorage
          Storage.saveCart(cart);
          console.log(cart);
          // set value cart
          this.setCartValues(cart);
          // display cart item
          this.addCartItem(cartItem);
          // show list cart
          this.showCart();
        });
      }
    });
  }

  setCartValues(cart) {
    var tempTotal = 0;
    var itemsTotal = 0;
    // cart.map(item => {
    //   tempTotal += item.amount * item.price;
    //   itemsTotal += item.amount;
    // });

    cart.map(item => (tempTotal += item.amount * item.price));
    cart.map(item => (itemsTotal += item.amount));

    cartTotal.innerHTML = parseFloat(tempTotal.toFixed(2));
    cartItems.innerHTML = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src="${item.image}" alt="${item.name}">
                      <div>
                        <h4> ${item.title} </h4>
                        <h5>${item.price} </h5>
                        <span class="remove-item" data-id=${
                          item.id
                        }>remove</span>
                      </div>
                      <div class="item-amount">
                        <i class="fa fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fa fa-chevron-down" data-id=${item.id}></i>
                      </div> `;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCart.addEventListener('click', this.hideCart);
  }

  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  }

  cartLogic() {
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', event => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains('fa-chevron-up')) {
        let amountUp = event.target;
        console.log(amountUp);
        let id = amountUp.dataset.id;
        let tempTotal = cart.find(item => item.id);
        tempTotal.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        // console.log()
        amountUp.nextElementSibling.innerText = JSON.stringify(
          tempTotal.amount
        );
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let amountDown = event.target;
        let id = amountDown.dataset.id;
        let tempTotal = cart.find(item => item.id);
        tempTotal.amount--;
        if (tempTotal.amount < 1) {
          cartContent.removeChild(amountDown.parentElement.parentElement);
          this.removeItem(id);
        }
        Storage.saveCart(cart);
        this.setCartValues(cart);
        amountDown.previousElementSibling.innerText = JSON.stringify(
          tempTotal.amount
        );
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));

    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    // console.log(cart);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = ` <i class="fas fa-shopping-cart"></i>
    add to bag`;
  }

  getSingleButton(id) {
    return buttonDOM.find(button => button.dataset.id === id);
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProduct(id) {
    let product = JSON.parse(localStorage.getItem('products'));
    return product.find(item => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();
  // setup app
  ui.setupApp();
  // get all products
  products
    .getProducts()
    .then(data => {
      ui.displayProducts(data);
      Storage.saveProducts(data);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
