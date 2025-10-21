// Renders the cart items inside the cart modal and syn with order page
function renderCart(cart) {
    const cartItemsDiv = document.getElementById("cartItems");
    const cartTotalEl = document.getElementById("cartTotalModal");
    const cartCountEl = document.getElementById("cartCount");
    if (!cartItemsDiv) return;

    cartItemsDiv.innerHTML = "";
    let count = 0;
    console.log(`renderCart: `)
    cart.items.forEach(item => {
        count += item.quantity;

        const itemDiv = document.createElement("div");
        itemDiv.className = "rounded-xl border flex items-center justify-between p-3 mb-3 bg-gray-50";

        // Left section: image + name + price
        const itemInfo = document.createElement("div");
        itemInfo.className = "flex items-center space-x-3";

        const imgDiv = document.createElement("div");
        imgDiv.className = "w-20 h-20 overflow-hidden rounded-lg";
        imgDiv.innerHTML = `<img src="/static/images/choc_carrot_2.jpg" alt="${item.name}" class="w-full h-full object-cover">`;

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
        minusBtn.addEventListener("click", () => {
            const newQty = Math.max(0, item.quantity - 1);
            console.log("Minus clicked for product_id:", item.product_id, "newQty:", newQty)
            updateQty(item.product_id, newQty);
        });

        const qtySpan = document.createElement("span");
        qtySpan.textContent = item.quantity;

        const plusBtn = document.createElement("button");
        plusBtn.className = "px-2 text-black text-lg";
        plusBtn.textContent = "+";
        plusBtn.addEventListener("click", () => {
            const newQty = item.quantity + 1;
            console.log("Plus clicked for product_id:", item.product_id, "newQty:", newQty)
            updateQty(item.product_id, newQty);
        });

        qtyControls.appendChild(minusBtn);
        qtyControls.appendChild(qtySpan);
        qtyControls.appendChild(plusBtn);

        itemDiv.appendChild(itemInfo);
        itemDiv.appendChild(qtyControls);
        cartItemsDiv.appendChild(itemDiv);
    });

    if (cartTotalEl) cartTotalEl.innerText = `R${cart.total.toFixed(2)}`;
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

function clearCart() {
    fetch("/clear_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    })
    .then(res => res.json())
    .then(handleCartUpdate)}
    .catch(err => console.error("Failed to clear cart:", err));
}

function handleCartUpdate(cart) {
//    if (!data || !data.items) {
//        console.error("Invalid cart data:", data);
//        return;
//    }
    renderCart(cart);
//    const orderContainer = document.getElementById("orderItems");
//    if (orderContainer) {
//        renderOrderPage(cart);
//    }
    showModalMessage("Item added to cart!");
}

// Calls update_cart on backend to set quantity for a product, then re-renders modal
function updateQty(productId, quantity) {
    console.log("UpdateQty sending update:", { productId, quantity });
    fetch("/update_cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity })
    })
    .then(res => {
        if (!res.ok) throw new Error("Bad response from server");
        return res.json();
    })
    .then(handleCartUpdate)
    .catch(err => console.error("Update failed:", err));
}