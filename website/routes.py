from flask import Blueprint, render_template, session
from flask_login import login_required

from website.forms import RegisterForm
from . import db
from website.models import User, Product

main_bp = Blueprint('main', __name__)

@main_bp.context_processor
def inject_global_data():
    if "cart" not in session:
        session["cart"] = {"items": [], "total": 0, "total_quantity": 0}

    cart = session["cart"]
    cart_count = sum(item["quantity"] for item in cart["items"])
    cart["total_quantity"] = cart_count
    cart_total = cart["total"]
    session.modified = True
    return dict(cart_count=cart_count, cart=session['cart'], cart_total=cart_total)

@main_bp.route('/')
def home_page():
    # products = []
    # products_in_models = Product.query.all()
    # for i in range(1,len(products_in_models)+1):
    #     product = Product.query.filter_by(id=i).first()
    #     products.append(product)

    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        user = User.query.filter_by(username=username).first()
        session['username'] = user.username
    return render_template('index.html', title="Protea Bakes")
    #return render_template('index.html', title="Protea Bakes", product=products)

@main_bp.route('/base')
def base():
    return render_template('base.html', title="Base")

@main_bp.route("/checkout")
@login_required
def checkout():
    return render_template("checkout.html", Title="Checkout")

@main_bp.route("/order")
def order():
    return render_template("order.html", title="order")

@main_bp.route('/clear_session')
def clear_session():
    session.clear()
    return render_template('clear.html', title="clear", msg="Session Cleared")

@main_bp.route("/seed_products")
def seed_products():
    # Only add if no products exist
    if Product.query.count() > 0:
        return "Products already exist."

    products = [
        Product(product_name="Chocolate Carrot Cake", product_price=250.00),
        Product(product_name="Carrot Cake", product_price=230.00),
        Product(product_name="Fraiser Cake", product_price=220.00),
        Product(product_name="Chocolate Cake", product_price=220.00),
        Product(product_name="Black Forest Cake", product_price=220.00),
    ]

    db.session.add_all(products)
    db.session.commit()

    return "5 products added successfully!"
