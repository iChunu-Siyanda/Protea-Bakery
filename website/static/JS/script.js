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
// Adds product (or sets quantity) via same backend endpoint and refreshes modal
function addToCart(productId, quantity=0) {
    console.log("=======addToCartPost=====")
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

                // Sends quantity to server(update_cart route)
                addToCart(productId, quantity);

                if (!quantity || quantity <= 0) {
                    if (msg) {
                        msg.innerHTML = "Please select an item before adding to order.";
                        msg.classList.remove("hidden");
                    }
                    return;
                }

                //Add to cart
                console.log("ADD TO CART 2");

//                addProductToCart(productId, productName, productPrice, quantity);

                // Reset UI quantity
                quantity = 0;
                qtyEl.textContent = "0";
                if (msg) msg.classList.add("hidden");
            });
        }
    });
}

//Add to cart
function addProductToCart(productId, productName, productPrice, qtyEl) {
    console.log('======= addProductToCart =======')
    if (!cart.products[productId]) {
        cart.products[productId] = {
            id: productId,
            name: productName,
            price: productPrice,
            Qty: qtyEl,
            totalPrice: productPrice * qtyEl
        };
        cart.total += (productPrice * qtyEl);
        console.log("ADD TO NEW CART", cart);
    } else {
        console.log("ADD TO EXISTING CART");
        cart.products[productId].Qty += qtyEl;
        console.log(`Cart.products[productId].Qty: ${cart.products[productId].Qty}`)
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

//initialize on DOM ready
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

