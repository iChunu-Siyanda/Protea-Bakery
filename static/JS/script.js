//==========================  GSAP Animation ========================================
gsap.fromTo("#intro1", {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 1});
gsap.fromTo("#intro2", {y: 40, opacity: 0}, {y: 0, opacity: 1, duration: 1});
gsap.fromTo("#name1", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 0.5, duration: 1});
gsap.fromTo("#desc1", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 1, duration: 1});

gsap.fromTo("#nameProduct1", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 0.5, duration: 1});
gsap.fromTo("#descProduct1", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 0.5, duration: 1});
gsap.fromTo("#openModal", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 0.5, duration: 1});
gsap.fromTo("#openModalOrder", {y: 40, opacity: 0}, {y: 0, opacity: 1, delay: 0.5, duration: 1});




//=========================== calculation =========================================
//let cart = {
//    total: 0,
//    products: {}
//};

// Renders the cart items inside the cart modal and syn with order page
function renderCart(cart) {
    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotalModal");
    const cartCountEl = document.getElementById("cartCount");
    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "";
    let count = 0;

    cart.items.forEach(item => {
        count += item.quantity;

        // Container for each cart item
        const itemDiv = document.createElement("div");
        itemDiv.className = "rounded-xl border flex items-center justify-between p-3 mb-3 bg-gray-50";

        // Left section: image + name + price
        const itemInfo = document.createElement("div");
        itemInfo.className = "flex items-center space-x-3";

        // Product image
        const imgDiv = document.createElement("div");
        imgDiv.className = "w-20 h-20 overflow-hidden rounded-lg";
        imgDiv.innerHTML = `
            <img src="/static/images/choc_carrot_2.jpg"
                 alt="${item.name}"
                 class="w-full h-full object-cover">
        `;

        // Product details (name, price, subtotal)
        const nameDiv = document.createElement("div");
        const subtotal = (item.price * item.quantity).toFixed(2);
        nameDiv.innerHTML = `
            <p class="text-base font-semibold text-gray-900">${item.name}</p>
            <p class="text-sm text-gray-600">R${item.price} × ${item.quantity}</p>
            <p class="text-sm font-medium text-gray-800 mt-1">Subtotal: <span class="text-black">R${subtotal}</span></p>
        `;

        itemInfo.appendChild(imgDiv);
        itemInfo.appendChild(nameDiv);

        // Quantity controls
        const qtyControls = document.createElement("div");
        qtyControls.className = "border rounded-full bg-white flex items-center space-x-3 px-3 py-1";

        const minusBtn = document.createElement("button");
        minusBtn.className = "px-2 text-black text-lg";
        minusBtn.textContent = "−";
        minusBtn.addEventListener("click", () => updateQty(item.id, item.quantity - 1));

        const qtySpan = document.createElement("span");
        qtySpan.textContent = item.quantity;

        const plusBtn = document.createElement("button");
        plusBtn.className = "px-2 text-black text-lg";
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", () => updateQty(item.id, item.quantity + 1));

        qtyControls.appendChild(minusBtn);
        qtyControls.appendChild(qtySpan);
        qtyControls.appendChild(plusBtn);

        // Append everything to itemDiv
        itemDiv.appendChild(itemInfo);
        itemDiv.appendChild(qtyControls);
        cartItemsDiv.appendChild(itemDiv);
    });

    if (cartTotalEl) cartTotalEl.innerText = `R${cart.total}`;
    if (cartCountEl) cartCountEl.innerText = count;
}

function renderOrderPage(cart) {
    console.log("Render")
    const orderContainer = document.getElementById("orderItems");
    if (!orderContainer) {
        console.error("No #orderItems found in DOM");
        return;
    }

    console.log("renderOrderPage")

    orderContainer.innerHTML = "";
    console.log(cart.items);
    if (!cart.items || cart.items.length === 0) {
        orderContainer.innerHTML = `<p class="text-center text-gray-500 mt-4">Your cart is empty.</p>`;
        return;
    }

    cart.items.forEach(item => {
        // Outer container
        const productCard = document.createElement("div");
        productCard.className = "w-full max-w-5xl rounded-xl border flex justify-between mx-auto bg-white mb-4 p-3";

        // Left: image + name
        const leftDiv = document.createElement("div");
        leftDiv.className = "flex items-center space-x-3";

        const imgDiv = document.createElement("div");
        imgDiv.className = "w-24 h-24 overflow-hidden rounded-lg";
        imgDiv.innerHTML = `<img src="/static/images/choc_carrot_2.jpg" alt="${item.name}" class="w-full h-full object-cover">`;

        const nameDiv = document.createElement("div");
        nameDiv.innerHTML = `<p class="text-lg font-semibold text-gray-900">${item.name}</p>`;
        console.log(`Name: ${item.name}`);

        leftDiv.appendChild(imgDiv);
        leftDiv.appendChild(nameDiv);

        // Right: qty + price
        const rightDiv = document.createElement("div");
        rightDiv.className = "flex items-center space-x-4";

        //delete/clear buttons
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "px-2 py-1 bg-red-500 text-white rounded";
        removeBtn.addEventListener("click", () => removeItem(item.id));

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "Clear Cart";
        clearBtn.className = "px-4 py-2 bg-gray-700 text-white rounded mt-4";
        clearBtn.addEventListener("click", clearCart);

        rightDiv.appendChild(removeBtn);
        orderContainer.appendChild(clearBtn);

        // Quantity controls
        const qtyDiv = document.createElement("div");
        qtyDiv.className = "flex items-center space-x-2";

        const minusBtn = document.createElement("button");
        minusBtn.textContent = "−";
        minusBtn.className = "px-2 py-1 bg-gray-200 rounded";
        minusBtn.addEventListener("click", () => updateQty(item.id, item.quantity - 1));

        const qtyText = document.createElement("span");
        qtyText.textContent = item.quantity;
        qtyText.className = "w-6 text-center";

        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";
        plusBtn.className = "px-2 py-1 bg-gray-200 rounded";
        plusBtn.addEventListener("click", () => updateQty(item.id, item.quantity + 1));

        qtyDiv.appendChild(minusBtn);
        qtyDiv.appendChild(qtyText);
        qtyDiv.appendChild(plusBtn);

        // Price
        const priceDiv = document.createElement("div");
        priceDiv.textContent = `R${(item.price * item.quantity).toFixed(2)}`;
        priceDiv.className = "font-semibold";

        rightDiv.appendChild(qtyDiv);
        rightDiv.appendChild(priceDiv);

        // Combine
        productCard.appendChild(leftDiv);
        productCard.appendChild(rightDiv);

        orderContainer.appendChild(productCard);
    });

    // Total
    const totalDiv = document.createElement("div");
    totalDiv.className = "flex justify-between items-center w-full max-w-5xl mx-auto p-3 mt-4 border rounded-xl bg-white";
    totalDiv.innerHTML = `
        <span class="font-medium text-gray-700">Total:</span>
        <span class="font-bold text-xl">R${cart.total.toFixed(2)}</span>
    `;
    orderContainer.appendChild(totalDiv);
}

function removeItem(productId) {
    fetch("/remove_item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId })
    })
    .then(res => res.json())
    .then(handleCartUpdate)
    .catch(err => console.error("Failed to remove item:", err));
}

//function clearCart() {
//    fetch("/clear_cart", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" }
//    })
//    .then(res => res.json())
//    .then(handleCartUpdate)}
//    .catch(err => console.error("Failed to clear cart:", err));
//}

function syncOrderPage(cart) {
    let total = 0;

    cart.items.forEach(item => {
        total += item.price * item.quantity;

        const qtyEl = document.getElementById(`order-qty-${item.id}`);
        if (qtyEl) qtyEl.textContent = item.quantity;

        const totalEl = document.getElementById(`order-total-${item.id}`);
        if (totalEl) totalEl.textContent = (item.price * item.quantity).toFixed(2);
    });

    const totalEl = document.getElementById("order-grand-total");
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

function handleCartUpdate(cart) {
  renderCart(cart);
  const orderContainer = document.getElementById("orderItems");
  if (orderContainer) {
    renderOrderPage(cart);
  }
  showModalMessage("Item added to cart!");
}

// Calls update_cart on backend to set quantity for a product, then re-renders modal
function updateQty(productId, quantity) {
    fetch("/update_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity })
    })
    .then(res => res.json())
    .then(handleCartUpdate)
    .catch(err => console.error("Update failed:", err));
}

// Adds product (or sets quantity) via same backend endpoint and refreshes modal
function addToCart(productId, quantity=1) {
    fetch("/add_to_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity})
    })
    .then(res => res.json())
    .then(handleCartUpdate)
    .catch(err => console.error("Add to cart failed:", err));
}

// small helper to show a brief message under Add To Order button
function showModalMessage(text) {
    const msgEl = document.getElementById("modalTotalMsg");
    if (!msgEl) return;
    msgEl.innerHTML = text;
    msgEl.classList.remove("hidden");
    msgEl.classList.add("text-green-600", "mt-2");
    // hide after 2s
    setTimeout(() => msgEl.classList.add("hidden"), 2000);
}

// Set up quantity + add-to-order behavior for each product modal
function initProductControls() {
    document.querySelectorAll(".product").forEach(productDiv => {
        const productId = productDiv.dataset.productId;
        const productName = productDiv.dataset.productName;
        const productPrice = parseFloat(productDiv.dataset.productPrice);
        const qtyEl = productDiv.querySelector(".quantity");
        const addBtn = productDiv.querySelector(".addBtn");
        const minusBtn = productDiv.querySelector(".minusBtn");

        // msg below the add button
        const msg = document.getElementById("modalTotalMsg");
        // Add-to-order button
        const addToCartBtn = productDiv.parentElement.querySelector(".addToOrderBtn");
        // read initial quantity if present
        let quantity = parseInt(qtyEl.textContent) || 0;

        let item = {
            id: productId,
            name: productName,
            price: productPrice,
            Qty: qtyEl,
            totalPrice: 0,
        };

        // Increase quantity
        addBtn.addEventListener("click", () => {
            quantity++;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * productPrice).toFixed(2);
            console.log(item.totalPrice, item);

            //Subtotal
            if (msg) {
                msg.innerHTML = `Total: R${(quantity * productPrice).toFixed(2)}`;
                msg.classList.remove("hidden");
            }
        });

        // Decrease quantity
        minusBtn.addEventListener("click", () => {
            if (quantity > 0) quantity--;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * productPrice).toFixed(2);
            console.log(item.totalPrice, item);

            //Subtotal
            if (msg) {
                if (quantity > 0) {
                    msg.innerHTML = `Total: R${(quantity * productPrice).toFixed(2)}`;
                    msg.classList.remove("hidden");
                } else {
                    msg.classList.add("hidden");
                }
            }
        });

        // Add To Order: sends to backend and refresh modal cart
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
                console.log("Sending to backend:", {productId, quantity });

                if (!quantity || quantity <= 0) {
                    if (msg) {
                        msg.innerHTML = "Please select an item before adding to order.";
                        msg.classList.remove("hidden");
                    }
                    return;
                }

                //Add to cart
                console.log("ADD TO CART 2");
                addProductToCart(productId, productName, productPrice, quantity);

                // Sends quantity to server(update_cart route)
                addToCart(productId, quantity);

                // Reset UI quantity
                console.log(cart);
                console.log("Next");
                quantity = 0;
                qtyEl.textContent = "0";
                if (msg) msg.classList.add("hidden");
                console.log(cart);
            });
        }
    });
}

//Add to cart
function addProductToCart(productId, productName, productPrice, qtyEl) {
    if (!cart.products[productId]) {
        cart.products[productId] = {
            id: productId,
            name: productName,
            price: productPrice,
            Qty: qtyEl,
            totalPrice: productPrice * qtyEl
        };
        cart.total += (productPrice * qtyEl);
        console.log("ADD TO CART 0", cart);
    } else {
        console.log("ADD TO CART 1");
        cart.products[productId].Qty += qtyEl;
        cart.products[productId].totalPrice = cart.products[productId].price * cart.products[productId].Qty;
    }

    // Recalculate the total cart price
    updateCartTotal();
}

function updateCartTotal() {
  let total = 0;
  for (const productId in cart.products) {
    total += cart.products[productId].totalPrice;
  }
  cart.total = total;
}


// Load current cart from server (used on page load and could be called when opening modal)
function loadCartAndRender() {
    fetch("/get_cart")
        .then(res => res.json())
        .then(handleCartUpdate)
        .catch(err => console.error("Error loading cart:", err));
}

// initialize on DOM ready
window.addEventListener("DOMContentLoaded", () => {
    loadCartAndRender();
    initProductControls();
});



//=========================== Cart Modal =============================================
const cartBtn = document.getElementById("cartBtn");
const cartModal = document.getElementById("cartModal");

cartBtn.addEventListener("click", () => {
    cartModal.classList.toggle("translate-x-full");
});



//=========================== Delivery/Collect Toggle ================================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".type").forEach(type => {
        const deliveryBtn = type.querySelector(".deliveryBtn");
        const collectBtn = type.querySelector(".collectBtn");
        const orderTypeMsg = type.querySelector(".orderTypeMsg");

        if (!deliveryBtn || !collectBtn || !orderTypeMsg) return;

        function setActiveButton(activeBtn) {
            [deliveryBtn, collectBtn].forEach(btn => {
                btn.classList.remove("bg-black", "text-white");
                btn.classList.add("bg-white", "text-black");
            });

            activeBtn.classList.add("bg-black", "text-white");
            activeBtn.classList.remove("bg-white", "text-black");
        }

        deliveryBtn.addEventListener("click", () => {
            setActiveButton(deliveryBtn);
            orderTypeMsg.innerHTML = "When do you want your order to be delivered?";
        });

        collectBtn.addEventListener("click", () => {
            setActiveButton(collectBtn);
            orderTypeMsg.innerHTML = "When do you want to collect your order?";
        });
    });
});



//=========================== Mobile menu toggle =====================================
const btn = document.getElementById('mobile-menu-button');
const menu = document.getElementById('mobile-menu');



//=========================== Modal Cards ============================================
const openModalOrder = document.getElementById('openModalOrder');
const openModal = document.getElementById('openModal');

const closeModalOrder = document.getElementById('closeModalOrder');
const closeModal = document.getElementById('closeModal');

const popupModalOrder = document.getElementById('popupModalOrder');
const popupModal = document.getElementById('popupModal');


// Open modal
openModalOrder.addEventListener('click', (e) => {
    e.preventDefault();
    popupModalOrder.classList.remove('pointer-events-none');
    popupModalOrder.classList.add('opacity-100');
    document.body.style.overflow = 'hidden'; // lock background scroll
});
openModal.addEventListener('click', (e) => {
    e.preventDefault();
    popupModal.classList.remove('pointer-events-none');
    popupModal.classList.add('opacity-100');
    document.body.style.overflow = 'hidden'; // lock background scroll
});

// Close modal
closeModalOrder.addEventListener('click', () => {
    popupModalOrder.classList.add('pointer-events-none');
    popupModalOrder.classList.remove('opacity-100');
    document.body.style.overflow = ''; // unlock scroll
});
closeModal.addEventListener('click', () => {
    popupModal.classList.add('pointer-events-none');
    popupModal.classList.remove('opacity-100');
    document.body.style.overflow = ''; // unlock scroll
});

// Close modal when clicking outside the content
popupModalOrder.addEventListener('click', (e) => {
    if (e.target === popupModalOrder) {
        popupModalOrder.classList.add('pointer-events-none');
        popupModalOrder.classList.remove('opacity-100');
        document.body.style.overflow = '';
    }
});
popupModal.addEventListener('click', (e) => {
    if (e.target === popupModal) {
        popupModal.classList.add('pointer-events-none');
        popupModal.classList.remove('opacity-100');
        document.body.style.overflow = '';
    }
});

