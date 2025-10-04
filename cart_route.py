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
        "qty": item.quantity
    } for item in cart.items]

    total = sum(item.quantity * item.price for item in cart.items)
    return jsonify({"items": items, "total": total})


@cart_bp.route("/update_cart", methods=["POST"])
def update_cart():
    data = request.json
    user_id = session.get("user_id")

    # Ensure user has a cart
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()

    # Validate product
    product = Product.query.get(data["productId"])
    if not product:
        return jsonify({"error": "Invalid product"}), 400

    # Find existing item in cart
    item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()

    if item:
        # Update existing item
        item.quantity = data["qty"]
        if item.quantity <= 0:  # remove if zero
            db.session.delete(item)
    else:
        # Create new item
        if data["qty"] > 0:
            item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=data["qty"],
                price=product.price
            )
            db.session.add(item)

    db.session.commit()

    #SQL objects for total calculation
    total = sum(i.quantity * i.price for i in cart.items)

    #Convert to dicts only for JSON response
    items = [{
        "id": i.product_id,
        "name": i.product.name,
        "price": i.price,
        "qty": i.quantity
    } for i in cart.items]

    return jsonify({"items": items, "total": total})

