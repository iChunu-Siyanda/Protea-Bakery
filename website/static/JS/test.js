 const totalDiv = document.createElement("div");
    totalDiv.className =
        "border border-black rounded-xl flex justify-between items-center mt-4 p-2 w-[200px] mx-auto bg-white";
    totalDiv.innerHTML = `
        <span class="font-medium text-gray-700">Total:</span>
        <span class="font-bold text-xl">R${data.total.toFixed(2)}</span>
    `;
    orderPage.appendChild(totalDiv);

data.total.forEach(item => {
        let totalDiv = document.createElement("div");

        if (!totalDiv){
            totalDiv.className = "border border-black rounded-xl flex justify-between items-center mt-4 p-2 w-[200px] mx-auto bg-white";
            orderPage.appendChild(totalDiv);
        } else{
            totalDiv.innerHTML = `
                <span class="font-medium text-gray-700">Total:</span>
                <span class="font-bold text-xl">R${item.toFixed(2)}</span>
            `;
        }
    })

// Renders the cart items inside the cart modal and syn with order page
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

//Add to cart
function addProductToCart(product_id, product_name, price, qtyEl) {
    console.log('======= addProductToCart =======')
    if (!cart.products[product_id]) {
        cart.products[productId] = {
            id: product_id,
            name: product_name,
            price: price,
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
        total += cart.products[product_id].totalPrice;
    }
    cart.total = total;
}

function handleCartUpdate(cart) {
    const cartCountElement = document.getElementById("cartCount");
        if (cartCountElement && data.cart_count !== undefined) {
            cartCountElement.textContent = data.cart_count;
            cartCountElement.classList.add("animate-bounce");
            setTimeout(() => cartCountElement.classList.remove("animate-bounce"), 500);
        }
    showModalMessage("Item added to cart!");
}


 if user_id:
        print("Logged In User")
        cart = Cart.query.filter_by(user_id=user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()

        item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()

        if item:
            item.quantity = quantity
            if item.quantity <= 0:
                db.session.delete(item)
        else:
            if quantity > 0:
                item = CartItem(
                    cart_id=cart.id,
                    product_id=product.id,
                    quantity=quantity,
                    price=product.price
                )
                db.session.add(item)

        db.session.commit()

        total = sum(i.quantity * i.price for i in cart.items)
        items = [
            {"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity}
            for i in cart.items
        ]

        return jsonify({"items": items, "total": total})

//User
@cart_bp.route('/plus_cart')
def plus_cart():
    user_id = session.get("user_id")
    cart_id = request.args.get('cart_id')

    # CASE 1: Logged-in user
    if user_id:
        cart_item = CartItem.query.get(cart_id)
        if not cart_item:
            return jsonify({"error": "Cart item not found"}), 404

        # Increase quantity
        cart_item.quantity += 1
        db.session.commit()

        # Get all items for this user's cart
        cart_items = CartItem.query.filter_by(cart_id=cart_item.cart_id).all()
        amount = sum(item.product.price * item.quantity for item in cart_items)

        data = {
            "quantity": cart_item.quantity,
            "total": amount
        }
        return jsonify(data), 200

    #Guest(session cart)
    else:
        if "cart" not in session:
            session["cart"] = {"items": [], "total": 0}

        cart = session["cart"]
        found = False

        # Try to find item in session cart
        for item in cart["items"]:
            if str(item["id"]) == str(cart_id):
                item["quantity"] += 1
                found = True
                break

        # If item not found, add it
        if not found:
            product = Product.query.get(cart_id)
            if not product:
                return jsonify({"error": "Product not found"}), 404

            cart["items"].append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "quantity": 1
            })

        # Recalculate total
        cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
        session["cart"] = cart  # Save back to session

        # Get updated quantity
        quantity = next(i["quantity"] for i in cart["items"] if str(i["id"]) == str(cart_id))

        return jsonify({
            "quantity": quantity,
            "total": cart["total"]
        })


@cart_bp.route('/minus_cart')
def minus_cart():
    user_id = session.get("user_id")
    cart_id = request.args.get('cart_id')

    # CASE 1: Logged-in user
    if user_id:
        cart_item = CartItem.query.get(cart_id)
        if not cart_item:
            return jsonify({"error": "Cart item not found"}), 404

        # Increase quantity
        cart_item.quantity -= 1
        db.session.commit()

        # Get all items for this user's cart
        cart_items = CartItem.query.filter_by(cart_id=cart_item.cart_id).all()
        amount = sum(item.product.price * item.quantity for item in cart_items)

        data = {
            "quantity": cart_item.quantity,
            "total": amount
        }
        return jsonify(data), 200

    # Guest(session cart)
    else:
        if "cart" not in session:
            session["cart"] = {"items": [], "total": 0}

        cart = session["cart"]
        found = False

        # Try to find item in session cart
        for item in cart["items"]:
            if str(item["id"]) == str(cart_id):
                item["quantity"] -= 1
                found = True
                break

        # If item not found, add it
        if not found:
            product = Product.query.get(cart_id)
            if not product:
                return jsonify({"error": "Product not found"}), 404

            cart["items"].append({
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "quantity": 1
            })

        # Recalculate total
        cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
        session["cart"] = cart  # Save back to session

        # Get updated quantity
        quantity = next(i["quantity"] for i in cart["items"] if str(i["id"]) == str(cart_id))

        return jsonify({
            "quantity": quantity,
            "total": cart["total"]
        })