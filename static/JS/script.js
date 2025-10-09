//=========================== calculation =========================================
let cart = {
    total: 0,
    products: {}
};

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

        // Main container for each cart item
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

// Calls update_cart on backend to set qty for a product, then re-renders modal
function updateQty(productId, quantity) {
    fetch("/update_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity })
    })
    .then(res => res.json())
    .then(cart => {
        renderCart(cart),
        syncOrderPage(cart)
    })
    .catch(err => console.error("Update failed:", err));
}

// Adds product (or sets qty) via same backend endpoint and refreshes modal
function addToCart(productId, quantity=1) {
    fetch("/update_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity})
    })
    .then(res => res.json())
    .then(cart => {
        renderCart(cart);
        showModalMessage("Item added to cart!");
    })
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

        // msg element below the add button (single element in modal)
        const msg = document.getElementById("modalTotalMsg");

        // Add-to-order button sits outside .product in your layout
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

        // Increase quantity UI + show per-product total
        addBtn.addEventListener("click", () => {
            quantity++;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * productPrice).toFixed(2);
            console.log(item.totalPrice, item);

            // show product-specific total in modal
            if (msg) {
                msg.innerHTML = `Total: R${(quantity * productPrice).toFixed(2)}`;
                msg.classList.remove("hidden");
            }
        });

        // Decrease quantity UI + update per-product total or hide message
        minusBtn.addEventListener("click", () => {
            if (quantity > 0) quantity--;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * productPrice).toFixed(2);
            console.log(item.totalPrice, item);

            if (msg) {
                if (quantity > 0) {
                    msg.innerHTML = `Total: R${(quantity * productPrice).toFixed(2)}`;
                    msg.classList.remove("hidden");
                } else {
                    msg.classList.add("hidden");
                }
            }
        });

        // Add To Order: send the chosen quantity to backend and refresh modal cart
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
                console.log("Sending to backend:", {productId, quantity });

                if (!quantity || quantity <= 0) {
                    // show helpful message in same place
                    if (msg) {
                        msg.innerHTML = "Please select an item before adding to order.";
                        msg.classList.remove("hidden");
                    }
                    return;
                }

                // send qty to server (this uses your update_cart route)
                addToCart(productId, quantity);

                // reset UI quantity and hide product message
                quantity = 0;
                qtyEl.textContent = "0";
                if (msg) msg.classList.add("hidden");
            });
        }
    });
}

// Load current cart from server (used on page load and could be called when opening modal)
function loadCartAndRender() {
    fetch("/get_cart")
        .then(res => res.json())
        .then(cart => {
            renderCart(cart),
            syncOrderPage(cart)
        })
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

//// Render cart items inside modal (if you want to show added items)
//function renderCart(cart) {
//    const cartItemsDiv = document.getElementById("cartItems");
//    const cartTotalEl = document.getElementById("cartTotalModal");
//    if (!cartItemsDiv) return;
//
//    cartItemsDiv.innerHTML = "";
//    let count = 0;
//
//    cart.items.forEach(item => {
//        count += item.qty;
//        const itemDiv = document.createElement("div");
//        itemDiv.className = "flex justify-between items-center bg-gray-100 p-2 rounded-lg";
//
//        const itemInfo = document.createElement("div");
//        itemInfo.innerHTML = `<p class="font-medium text-gray-800">${item.name}</p>
//                              <p class="text-sm text-gray-600">R${item.price} x ${item.qty}</p>`;
//
//        const qtyControls = document.createElement("div");
//        qtyControls.className = "flex items-center space-x-2";
//
//        const minusBtn = document.createElement("button");
//        minusBtn.className = "px-2 bg-red-500 text-white rounded";
//        minusBtn.textContent = "-";
//        minusBtn.addEventListener("click", () => updateQty(item.id, item.qty - 1));
//
//        const qtySpan = document.createElement("span");
//        qtySpan.textContent = item.qty;
//
//        const plusBtn = document.createElement("button");
//        plusBtn.className = "px-2 bg-green-500 text-white rounded";
//        plusBtn.textContent = "+";
//        plusBtn.addEventListener("click", () => updateQty(item.id, item.qty + 1));
//
//        qtyControls.appendChild(minusBtn);
//        qtyControls.appendChild(qtySpan);
//        qtyControls.appendChild(plusBtn);
//
//        itemDiv.appendChild(itemInfo);
//        itemDiv.appendChild(qtyControls);
//
//        cartItemsDiv.appendChild(itemDiv);
//    });
//
//    if (cartTotalEl) cartTotalEl.innerText = `R${cart.total}`;
//}
//
//// Add product to cart
//function addToCart(productId) {
//    fetch("/add_to_cart", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify({ productId })
//    })
//    .then(res => res.json())
//    .then(cart => {
//        renderCart(cart); // update cart modal
//    });
//}
//
//// Update quantity of a product
//function updateQty(productId, qty) {
//    fetch("/update_cart", {
//        method: "POST",
//        headers: { "Content-Type": "application/json" },
//        body: JSON.stringify({ productId, qty })
//    })
//    .then(res => res.json())
//    .then(cart => {
//        renderCart(cart); // update cart modal
//    });
//}
//
//// Load cart and initialize controls on page load
//window.addEventListener("DOMContentLoaded", () => {
//    fetch("/get_cart")
//        .then(res => res.json())
//        .then(cart => renderCart(cart));
//
//    initProductControls();
//});



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

