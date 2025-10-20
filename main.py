from flask import Flask, render_template, redirect, url_for, request, session
from config import Config
from forms import LoginForm, RegisterForm
from models import db, User, Product, CartItem, Cart
from cart_route import cart_bp
from bookings_route import bookings_bp
from flask_bcrypt import Bcrypt
from flask_login import login_user, LoginManager, current_user,login_required,logout_user

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
bcrypt = Bcrypt(app)


# Register blueprints
app.register_blueprint(cart_bp)
app.register_blueprint(bookings_bp)


# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# @app.context_processor
# def inject_user_cart():
#     print("inject")
#
#     cart_count = 0
#     username = ""
#
#     # if current_user.is_authenticated and current_user.cart:
#     if current_user.is_authenticated:
#         print("========= User Authenticated =========")
#
#         # Get all items in user's cart
#         current_user_cart = CartItem.query.filter_by(cart_id=current_user.id).all()
#         print(f"Current User: {current_user.id}, Cart Items: {current_user_cart}")
#         # Get the specific item to delete
#         item = CartItem.query.filter_by(id=current_user.id, cart_id=current_user.id).first()
#         print(item)
#         if item:
#             db.session.delete(item)
#             db.session.commit()
#         # Calculate cart count after deletion
#         cart_count = sum(item.quantity for item in (current_user.cart.items if current_user.cart else []))
#         print(cart_count)
#         username = current_user.username
#     return dict(current_user=current_user, cart_count=cart_count, username=username)


@app.context_processor
def inject_cart():
    print("=========== Session ===========")
    # Use session cart for guests, or database cart for logged-in users
    user_id = session.get("user_id")
    if user_id:
        print(f"user_id:n{user_id}")
        from models import Cart
        cart = Cart.query.filter_by(user_id=user_id).first()
        if cart:
            print(f"cart:{cart}")
            items = [{"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity} for i in cart.items]
            total = sum(i.quantity * i.price for i in cart.items)
            return {"cart": {"items": items, "total": total}}
    # fallback for guest
    return {"cart": session.get("cart", {"items": [], "total": 0})}



# Routes
@app.route('/')
def home_page():
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        user = User.query.filter_by(username=username).first()
        session['username'] = user.username
    return render_template('index.html', title="Protea Bakes")

@app.route('/base')
def base():
    return render_template('base.html', title="Base")

@app.route('/login', methods=["GET","POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, form.password.data):
            login_user(user)
            session["user"] = user.id
            session['username'] = user.username
            next_page = request.args.get('next')  # redirects to where user was going
            return redirect(next_page) if next_page else redirect(url_for('home_page'))
        else:
            return "Invalid username or password", 401
    return render_template("login.html", title="Login", form=form)

@app.route('/register', methods=["GET","POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        hashed_password = bcrypt.generate_password_hash(password)
        user = User.query.filter_by(username=username).first()

        if user:
            return render_template('index.html', error="Username already exists", title="Protea Bakes")
        else:
            new_user = User(username=username, password=hashed_password)
            db.session.add(new_user)
            db.session.commit()
            session['username'] = username
            return redirect(url_for('login'))
    return render_template("register.html", title="Register", form=form)

@login_required
def logout():
    logout_user()
    session.pop("user_id", None)
    return redirect(url_for('home_page'))

# @app.route("/checkout")
# @login_required
# def checkout():
#     return render_template("checkout.html", Title="Checkout")
#
# @app.route("/base")
# def base():
#     return render_template("base.html",title="Base")
#
@app.route("/order")
def order():
    return render_template("order.html", title="order")
#
# @app.route("/seed_products")
# def seed_products():
#     # Only add if no products exist
#     if Product.query.count() > 0:
#         return "Products already exist."
#
#     products = [
#         Product(name="Chocolate Carrot Cake", price=250.00),
#         Product(name="Carrot Cake", price=230.00),
#         Product(name="Fraiser Cake", price=220.00),
#         Product(name="Chocolate Cake", price=220.00),
#         Product(name="Black Forest Cake", price=220.00),
#     ]
#
#     db.session.add_all(products)
#     db.session.commit()
#
#     return "5 products added successfully!"

if __name__ == "__main__":
    # Create tables
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5001)