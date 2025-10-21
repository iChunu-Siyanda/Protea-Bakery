from flask import Blueprint, render_template, session
from website.forms import RegisterForm
from . import db
from website.models import User, Product

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home_page():
    products = Product.query.all()
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        user = User.query.filter_by(username=username).first()
        session['username'] = user.username
    return render_template('index.html', title="Protea Bakes", products=products)

@main_bp.route('/base')
def base():
    return render_template('base.html', title="Base")


@main_bp.route('/clear_session')
def clear_session():
    session.clear()
    return render_template('clear.html', title="clear", msg="Session Cleared")

# @app.route("/checkout")
# @login_required
# def checkout():
#     return render_template("checkout.html", Title="Checkout")

@main_bp.route("/order")
def order():
    return render_template("order.html", title="order")
#
@main_bp.route("/seed_products")
def seed_products():
    # Only add if no products exist
    if Product.query.count() > 0:
        return "Products already exist."

    products = [
        Product(name="Chocolate Carrot Cake", price=250.00),
        Product(name="Carrot Cake", price=230.00),
        Product(name="Fraiser Cake", price=220.00),
        Product(name="Chocolate Cake", price=220.00),
        Product(name="Black Forest Cake", price=220.00),
    ]

    db.session.add_all(products)
    db.session.commit()

    return "5 products added successfully!"