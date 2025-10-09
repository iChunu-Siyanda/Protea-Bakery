from flask import Blueprint, request, jsonify, session
from models import db, Product, Cart, CartItem

cart_bp = Blueprint("cart", __name__)

@cart_bp.route("/get_cart")
def get_cart():
    user_id = session.get("user_id")
    cart = Cart.query.filter_by(user_id=user_id).first()

    if not cart:
        return jsonify({"items": [], "total": 0})

    items = [{
        "id": item.product_id,
        "name": item.product.name,
        "price": item.price,
        "quantity": item.quantity
    } for item in cart.items]

    total = sum(item.quantity * item.price for item in cart.items)
    return jsonify({"items": items, "total": total})


@cart_bp.route("/add_to_cart", methods=["POST"])
def add_to_cart():
    data = request.json
    user_id = session.get("user_id")

    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    product = Product.query.get(data["productId"])
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
        return jsonify({"items": cart["items"], "total": total})


# @cart_bp.route("/get_products")
# def get_products():
#     products = Product.query.all()
#     return jsonify([{"id": p.id, "name": p.name, "price": p.price} for p in products])
