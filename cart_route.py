from flask import Blueprint, request, jsonify, session
from flask_login import current_user
from sqlalchemy.orm import joinedload

from models import db, Product, Cart, CartItem

cart_bp = Blueprint("cart", __name__)

@cart_bp.route("/get_cart")
def get_cart():
    print("====get_cart=====")
    data = request.json
    print(f"data:{data}")
    user_id = session.get("user_id")
    print(f"user_id: {user_id}")
    if user_id:
        # cart = Cart.query.filter_by(user_id=user_id).first()
        cart = Cart.query.options(joinedload(Cart.items).joinedload(CartItem.product)).filter_by(user_id=user_id).first()

        if not cart:
            print("not cart")
            return jsonify({"items": [], "total": 0})

        items = [{
            "id": item.product_id,
            "name": item.product.name,
            "price": item.price,
            "quantity": item.quantity
        } for item in cart.items]

        print(f"items:{items}")
        total = sum(item.quantity * item.price for item in cart.items)
        return jsonify({"items": items, "total": total})
    else:
        session_cart = session.get("cart", {"items": []})
        print(f"Session cart: {session_cart}")

        # Normalize items in session cart
        items = [
            {
                "id": i["id"],
                "name": i["name"],
                "price": i["price"],
                "quantity": i["quantity"]
            }
            for i in session_cart.get("items", [])
        ]

        total = sum(i["price"] * i["quantity"] for i in items)
        return jsonify({"items": items, "total": total})


@cart_bp.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    print("=========add_to_cart=========")
    data = request.json
    product_id = data.get('product_id')
    print(product_id)
    quantity = data.get('quantity', 0)

    if current_user.is_authenticated:
        user_id = current_user.id
        cart = Cart.query.filter_by(user_id=user_id).first()
        print(f"cart:{cart}, user_id:{cart.user_id}")
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()

        product = Product.query.get(data["productId"])
        print(f"product: {product}")
        if not product:
            return jsonify({"error": "Invalid product"}), 400

        item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
        if item:
            item.quantity += 1
        else:
            item = CartItem(cart_id=cart.id, product_id=product.id, quantity=1, price=product.price)
            db.session.add(item)

        db.session.commit()

        total = sum(i.quantity * i.price for i in cart.items)
        items = [{"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity} for i in cart.items]
        print(f'addToCartItems, items: {items}, total:{total}')
        return jsonify({"items": items, "total": total})
    else:
        #initialize cart
        if 'cart' not in session:
            session['cart'] = []
        #verify product exists in cart
        cart = session['cart']
        found = False
        for item in cart:
            if item['product_id'] == product_id:
                item['quantity'] += quantity
                found = True
                break
        if not found:
            cart.append({"product_id": product_id, "quantity": quantity})

        session["cart"] = cart
        session.modified = True  # ensure Flask saves session changes
        print(f"🛒 Added product {product_id} to guest cart. Cart now: {session['cart']}")
        guest_cart = session.get("cart", [])
        if not guest_cart:
            return jsonify({"items": [], "total": 0})

        items = []
        total = 0
        for item in guest_cart:
            product = Product.query.get(item["product_id"])
            if product:
                subtotal = product.price * item["quantity"]
                total += subtotal
                items.append({
                    "id": product.id,
                    "name": product.name,
                    "price": product.price,
                    "quantity": item["quantity"]
                })
        return jsonify({"items": items, "total": total})


@cart_bp.route("/update_cart", methods=["POST"])
def update_cart():
    data = request.get_json()
    print("=== DEBUG /update_cart ===")
    print("Received JSON:", data)
    print("User ID:", session.get("user_id"))

    if not data:
        return jsonify({"error": "No JSON received"}), 400

    # Convert productId to integer
    try:
        product_id = int(data.get("productId"))
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid productId"}), 400

    quantity = data.get("quantity")
    if quantity is None:
        return jsonify({"error": "Missing quantity"}), 400

    # Fetch product
    product = Product.query.get(product_id)
    print(f"Product: {product}")
    if not product:
        return jsonify({"error": "Invalid product"}), 400

    # Check if user is logged in
    user_id = session.get("user_id")

    # --- Case 1: Logged-in user ---
    if user_id:
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

    # --- Case 2: Guest user ---
    else:
        cart = session.get("cart", {"items": []})

        # Ensure IDs are integers for comparison
        found = False
        for item in cart["items"]:
            if int(item["id"]) == product_id:
                item["quantity"] = quantity
                found = True
                break

        if not found and quantity > 0:
            cart["items"].append({
                "id": product.id,   # integer
                "name": product.name,
                "price": product.price,
                "quantity": quantity
            })

        # Remove items with 0 or negative quantity
        cart["items"] = [i for i in cart["items"] if i["quantity"] > 0]

        # Save to session
        session["cart"] = cart
        session.modified = True

        total = sum(i["quantity"] * i["price"] for i in cart["items"])
        print(f"Total: {total}")
        return jsonify({"items": cart["items"], "total": total})



@cart_bp.route("/remove_item", methods=["POST"])
def remove_item():
    data = request.json
    product_id = data.get("productId")
    user_id = session.get("user_id")

    if not user_id or not product_id:
        return jsonify({"error": "Missing data"}), 400

    cart = Cart.query.filter_by(user_id=user_id).first()
    if cart:
        item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if item:
            db.session.delete(item)
            db.session.commit()

    # Return updated cart
    items = [{"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity} for i in cart.items] if cart else []
    total = sum(i.quantity * i.price for i in cart.items) if cart else 0
    return jsonify({"items": items, "total": total})


@cart_bp.route("/clear_cart", methods=["POST"])
def clear_cart():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    cart = Cart.query.filter_by(user_id=user_id).first()
    if cart:
        CartItem.query.filter_by(cart_id=cart.id).delete()
        db.session.commit()

    return jsonify({"items": [], "total": 0})



# @cart_bp.route("/get_products")
# def get_products():
#     products = Product.query.all()
#     return jsonify([{"id": p.id, "name": p.name, "price": p.price} for p in products])
