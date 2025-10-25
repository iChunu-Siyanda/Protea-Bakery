from flask import Blueprint, request, jsonify, session
from flask_login import current_user
from sqlalchemy.orm import joinedload
from website import db
from website.models import Cart, CartItem, Product

cart_bp = Blueprint("cart", __name__)


#def add_to_cart
#def show_cart
#plus_cart
#minus_cart
#remove_cart


@cart_bp.route("/get_cart", methods=["GET"])
def get_cart():
    print("====get_cart=====")
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
            "price": float(item.price),
            "quantity": int(item.quantity)
        } for item in cart.items]

        print(f"items:{items}")
        total = sum(item.quantity * item.price for item in cart.items)
        return jsonify({"items": items, "total": total})
    else:
        cart = session.get("cart",  {"items": [], "total": 0, "total_quantity":0})

        if isinstance(cart.get("items"), list):
            for i in cart["items"]:
                if isinstance(i, str):
                    import json
                    try:
                        i = json.loads(i)
                    except Exception as error:
                        print(f"/Get_cart error json: {error}")
                        continue

                    cart["items"].append({
                        "product_id": i.get("product_id"),
                        "product_name": i.get("product_name"),
                        "price": float(i.get("price")),
                        "quantity": int(i.get("quantity"))
                    })
        else:
            cart["items "]= []

            # Recalculate totals to ensure accuracy
        total = sum(i["price"] * i["quantity"] for i in cart["items"])
        total_quantity = sum(i["quantity"] for i in cart["items"])

        # Update session to stay in sync
        session["cart"] = {"items": cart["items"], "total": total, "total_quantity": total_quantity}
        cart = session["cart"]
        session.modified = True
        print(f"/get_cart Cart: {session["cart"]}")

        return jsonify({"items": cart['items'], "total": cart["total"], "cart_count": cart["total_quantity"]})


@cart_bp.route("/add_to_cart", methods=["GET","POST"])
def add_to_cart():
    print("=========add_to_cart=========")
    data = request.json
    if not data:
        return jsonify({"error": "/add_to_cart: No JSON received"}), 400
    product_id = int(data.get('product_id'))
    print(product_id)
    quantity = int(data.get('quantity'))
    print(quantity)

    if current_user.is_authenticated:
        user_id = current_user.id
        cart = Cart.query.filter_by(user_id=user_id).first()
        print(f"cart:{cart}, user_id:{cart.user_id}")
        if not cart:
            cart = Cart(user_id=user_id)
            db.session.add(cart)
            db.session.commit()
            print("Created New Cart")

        # product = Product.query.get(data["productId"])
        product = Product.query.get(product_id)
        print(f"product: {product}")
        if not product:
            print("No Product Found.")
            return jsonify({"error": "Invalid product"}), 400

        item = CartItem.query.filter_by(cart_id=cart.id, product_id=product_id).first()
        if item:
            item.quantity += quantity
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity, price=product.price)
            db.session.add(item)
        db.session.commit()

        total = sum(i.quantity * i.price for i in cart.items)
        items = [{"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity} for i in cart.items]
        print(f'addToCartItems, items: {items}, total:{total}')
        return jsonify({"items": items, "total": total})
    else:
        #initialize cart
        if 'cart' not in session:
            session['cart'] = {"items": [], "total": 0, "total_quantity": 0}
        #verify product exists in cart
        cart = session['cart']
        #cart.items =
        print(f"Cart:{cart}")
        product = Product.query.filter_by(id=product_id).first()
        print(f"Product found: {product}")

        found = False
        for item in cart['items']:
            if int(item['product_id']) == product_id:
                print(f"Session Item Product Id: {item['product_id']}")
                item['quantity'] += quantity
                found = True
                break #break the loop when the items are found
        if not found:
            cart["items"].append({
                "product_id": int(product.id),
                "product_name": product.product_name,
                "price": float(product.product_price),
                "quantity": int(quantity)
            })

        cart["total"] = sum(i["price"] * i["quantity"] for i in cart["items"])
        cart["total_quantity"] = sum(i["quantity"] for i in cart["items"])
        session["cart"] = cart
        session.modified = True  # ensure Flask saves session changes
        print(f"🛒 Added product {product_id} to guest cart. Cart now: {session['cart']}")

        return jsonify({"items": cart['items'], "total": cart["total"], "cart_count":cart["total_quantity"]})


@cart_bp.route("/update_cart", methods=["POST"])
def update_cart():
    print("=== /update_cart ===")
    data = request.json
    if not data:
        return jsonify({"error": "/update_cart: No JSON received"}), 400
    product_id = data.get('product_id')
    print(f"product_id:{product_id}")
    quantity = data.get('quantity')
    print(f"Qty:{quantity}")
    action = data.get('action')
    print(f"Action:{action}")

    # Fetch product
    product = Product.query.filter_by(id=product_id).first()
    print(f"Product:{product}")
    user_id = session.get("user_id")

    # --- Logged in user ---
    if user_id:
        return f"Product:{product}"
    # --- Guest user ---
    else:
        print("Guest User")
         # Prevent negative quantities
        cart = session.get("cart", {"items": [], "total": 0, "total_quantity": 0})

        found = False
        for item in cart["items"]:
            if int(item["product_id"]) == product_id:
                found = True
                if action == "add":
                    item["quantity"] += 1
                elif action == "minus":
                    item["quantity"] -= 1
                    if item["quantity"] <= 0:
                        cart["items"].remove(item)
                break

        if not found and action == "addToCart":
            product = Product.query.get(product_id)
            if product:
                cart["items"].append({
                    "product_id": product.id,
                    "name": product.product_name,
                    "price": float(product.product_price),
                    "quantity": quantity
                })

        # Remove items with quantity 0
        cart["items"] = [i for i in cart["items"] if i["quantity"] > 0]

        # Save to session
        session["cart"] = cart
        session.modified = True

        # Calculate total
        total = sum(float(i["price"]) * int(i["quantity"]) for i in cart["items"])
        cart["total_quantity"] = sum(i["quantity"] for i in cart["items"])
        session["cart"] = cart
        session.modified = True
        print(f"🛒 Added product {product_id} to guest cart. Cart now: {session['cart']}")

        return jsonify({"items": cart["items"], "total": total, "cart_count": cart["total_quantity"]}), 200


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

