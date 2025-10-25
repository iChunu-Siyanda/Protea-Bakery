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
//--------------------------- Add To Cart -----------------------------------------
// Adds product (or sets quantity) via same backend endpoint and refreshes modal
function addToCart(product_id, quantity=0, action) {
    console.log("=======addToCartPost=====")
    fetch("/add_to_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity, action})
    })
    .then(res => res.json()
    )
    .then(data => {
        if(quantity>0) showModalMessage("Item added to cart!");
        renderCart(data);

        console.log("Cart updated:", data);
        const cartCountElement = document.getElementById("cartCount");
        if (cartCountElement && data.cart_count !== undefined) {
            cartCountElement.textContent = data.cart_count;
            cartCountElement.classList.add("animate-bounce"); // fun visual feedback
            setTimeout(() => cartCountElement.classList.remove("animate-bounce"), 500);
        }
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
    setTimeout(() => msgEl.classList.add("hidden"), 2000);
    setTimeout(() => msgEl.classList.remove("text-green-600", "mt-2"),2000);
}

//------------------------ Update Product Modal -----------------------------------
function initProductControls() {
    document.querySelectorAll(".product").forEach(productDiv => {
        const product_id = productDiv.dataset.productId;
        const product_name = productDiv.dataset.productName;
        const price = parseFloat(productDiv.dataset.productPrice);
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
            id: product_id,
            name: product_name,
            price: price,
            Qty: qtyEl,
            totalPrice: 0,
        };

        // Increase quantity
        addBtn.addEventListener("click", () => {
            quantity++;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * price).toFixed(2);
            console.log(item.totalPrice, item);

            //Subtotal
            if (msg) {
                msg.innerHTML = `Total: R${(quantity * price).toFixed(2)}`;
                msg.classList.remove("hidden");
            }
        });

        // Decrease quantity
        minusBtn.addEventListener("click", () => {
            if (quantity > 0) quantity--;
            qtyEl.textContent = quantity;
            item.totalPrice = (quantity * price).toFixed(2);
            console.log(item.totalPrice, item);

            //Subtotal
            if (msg) {
                if (quantity > 0) {
                    msg.innerHTML = `Total: R${(quantity * price).toFixed(2)}`;
                    msg.classList.remove("hidden");
                } else {
                    msg.classList.add("hidden");
                }
            }
        });

        // Add To Order: sends to backend and refresh modal cart
        if (addToCartBtn) {
            addToCartBtn.addEventListener("click", () => {
            const action = "addToCart";
                // Sends quantity to server(update_cart route)
                console.log("Sending to backend:", {product_id, quantity, action });

                if (quantity > 0) {
                    addToCart(product_id, quantity, action);
                }
                else if (!quantity || quantity <= 0) {
                    if (msg) {
                        msg.innerHTML = "Please select an item before adding to order.";
                        msg.classList.remove("hidden");
                    }
                    return;
                }

                //Add to cart
                console.log("ADD TO CART 2");

                // Reset UI quantity
                quantity = 0;
                qtyEl.textContent = "0";
                if (msg) msg.classList.add("hidden");
            });
        }
    });
}

//-------------------------- Update Cart ------------------------------------
//Cart Modal Display
function renderCart(data) {
    console.log(`renderCart: data = ${data} `);
    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotalModal");
    const cartCountEl = document.getElementById("cartCount");

    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "";
    let count = 0;
    data.items.forEach(item => {
        count += item.quantity;
        console.log(`id:${item.product_id}`);
        console.log(`quantity: ${item.quantity}`);
        console.log(`name: ${item.product_name}`);
        console.log(`price: ${item.price}`);
        console.log(`total:${item.total}`);

        const itemDiv = document.createElement("div");
        itemDiv.className = "rounded-xl border flex items-center justify-between p-3 mb-3 bg-gray-50";

        // Left section: image + name + price
        const itemInfo = document.createElement("div");
        itemInfo.className = "flex items-center space-x-3";

        const imgDiv = document.createElement("div");
        imgDiv.className = "w-20 h-20 overflow-hidden rounded-lg";
        imgDiv.innerHTML = `<img src="/static/images/choc_carrot_2.jpg" alt="${item.product_name}" class="w-full h-full object-cover">`;

        const nameDiv = document.createElement("div");
        const subtotal = (item.price * item.quantity).toFixed(2);
        nameDiv.innerHTML = `
            <p class="text-base font-semibold text-gray-900">${item.product_name}</p>
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
        minusBtn.addEventListener("click", () => {
            const action = "minus";
            console.log("Minus clicked for product_id:", item.product_id, "action:", action);
            updateQty(item.product_id, item.quantity, action);
        });

        const qtySpan = document.createElement("span");
        qtySpan.textContent = item.quantity;

        const plusBtn = document.createElement("button");
        plusBtn.className = "px-2 text-black text-lg";
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", () => {
            const action = "add";
            console.log("Add clicked for product_id:", item.product_id, "action:", action);
            updateQty(item.product_id, item.quantity, action);
        });

        qtyControls.appendChild(minusBtn);
        qtyControls.appendChild(qtySpan);
        qtyControls.appendChild(plusBtn);

        itemDiv.appendChild(itemInfo);
        itemDiv.appendChild(qtyControls);
        cartItemsDiv.appendChild(itemDiv);
    });

    if (cartTotalEl) cartTotalEl.innerText = `R${data.total.toFixed(2)}`;
    if (cartCountEl) cartCountEl.innerText = count;
}

// Order Page Items
function renderOrderCart(data) {
    console.log("renderOrderPage");

    const orderPage = document.getElementById("orderPage");
    const productCard = document.getElementById("orderItems");
    const centerTotal = document.getElementById("orderCenterTotal");

    if (!productCard) return;


    // Clear old content
    productCard.innerHTML = "";

    // Total
    centerTotal.innerHTML = `R${data.total.toFixed(2)}`;

    // Handle empty cart
    if (!data.items || data.items.length === 0) {
    orderPage.innerHTML = `
        <div class="flex items-center justify-center min-h-screen">
            <div class="text-center">
                <h2 class="text-2xl font-semibold text-gray-700">Your Cart Is Empty</h2>
                <p class="text-gray-500">Start shopping to add items to your cart!</p>
            </div>
        </div>
    `;
    return;
}


    let count = 0;

    data.items.forEach(item => {
        count += item.quantity;
        const orderSubtotal = (item.price * item.quantity).toFixed(2);

        // ---------------- Left div for image & title ----------------
        const imgTitleDiv = document.createElement("div");
        imgTitleDiv.className = "flex justify-start items-center";

        // Image
        const imageDiv = document.createElement("div");
        imageDiv.className = "max-w-xl md:w-1/3 md:h-auto overflow-hidden sm:px-18";
        imageDiv.innerHTML = `
            <img src="/static/images/choc_carrot_2.jpg"
                 alt="${item.name}"
                 class="h-28 w-auto object-cover rounded-l-xl">
        `;
        imgTitleDiv.appendChild(imageDiv);

        const titleDiv = document.createElement("div");
        titleDiv.className = "px-3 flex flex-col items-center justify-center";
        titleDiv.innerHTML = `
            <p class="text-xl font-cinzel font-semibold text-gray-900">
                ${item.product_name}
            </p>
        `;
        imgTitleDiv.appendChild(titleDiv);

        // Append to card container
        productCard.appendChild(imgTitleDiv);

        // ---------------- Right div for servings, buttons & subtotal ----------------
        const orderProducts = document.createElement("div");
        orderProducts.className = "md:w-1/3 flex items-center justify-around";

        // Servings
        const num = document.createElement("div");
        num.className = "border rounded-full py-2 px-4 flex flex-col justify-center";
        num.innerHTML = `
            <p class="flex items-center gap-2 text-gray-700">
                <i class="fa-regular fa-user"></i> 8+
            </p>`;
        orderProducts.appendChild(num);

        const updateBtn = document.createElement("div");
        updateBtn.className = "border rounded-full py-2 px-4 flex justify-between gap-3 text-xl product";
        updateBtn.dataset.productId = item.product_id;
        updateBtn.dataset.productName = item.product_name;
        updateBtn.dataset.productPrice = item.price;

        // Minus button
        const minusBtn = document.createElement("button");
        minusBtn.className = "px-1 text-black text-lg";
        minusBtn.textContent = "−";
        minusBtn.addEventListener("click", () => {
            console.log("Minus clicked for product_id:", item.product_id);
            updateQty(item.product_id, item.quantity, "minus");
        });

        // Quantity span
        const span = document.createElement("span");
        span.textContent = item.quantity;

        // Plus button
        const plusBtn = document.createElement("button");
        plusBtn.className = "px-1 text-black text-lg";
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", () => {
            console.log("Add clicked for product_id:", item.product_id);
            updateQty(item.product_id, item.quantity, "add");
        });

        updateBtn.appendChild(minusBtn);
        updateBtn.appendChild(span);
        updateBtn.appendChild(plusBtn);

        orderProducts.appendChild(updateBtn);

        // Subtotal
        const subTotal = document.createElement("div");
        subTotal.className = "border rounded-full py-2 px-3 flex flex-col justify-center";
        subTotal.innerHTML = `<p>R${orderSubtotal}</p>`;
        orderProducts.appendChild(subTotal);

        // Append product section
        productCard.appendChild(orderProducts);
    });

}


//Update Modal Items
function updateQty(product_id, quantity, action) {
    console.log("UpdateQty sending update:", { product_id, quantity, action });
    fetch("/update_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id, quantity, action })
    })
    .then(res => {
        if (!res.ok) throw new Error("UpdateQty: Bad response from server");
        return res.json();
    })
    .then(data => {
        renderCart(data);
        renderOrderCart(data);
    })
    .catch(err => console.error("Update failed:", err));
}


//Load current cart from server (used on page load and could be called when opening modal)
function loadCartAndRender() {
    fetch("/get_cart")
        .then(res => res.json())
        .then(data => {
            renderCart(data);
            renderOrderCart(data);
        })
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

