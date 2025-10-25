from flask import Flask, render_template
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from website.config import Config

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = "auth.login"


def create_database():
    db.create_all()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    # Import models after db setup
    from website import models

    # Import blueprints AFTER app & db setup
    from website.auth import auth_bp
    from website.routes import main_bp
    from website.cart_route import cart_bp
    from website.bookings_route import bookings_bp

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(bookings_bp)

    # Error handling
    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('404.html'), 404

    # Create DB if not exists
    with app.app_context():
        create_database()

    return app



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


# @app.context_processor
# def inject_cart():
#     print("=========== Session ===========")
#     # Use session cart for guests, or database cart for logged-in users
#     user_id = session.get("user_id")
#     print(user_id)
#     if user_id:
#         print(f"user_id:{user_id}")
#         from website.models import Cart
#         cart = Cart.query.filter_by(user_id=user_id).first()
#         if cart:
#             print(f"cart:{cart}")
#             items = [{"id": i.product_id, "name": i.product.name, "price": i.price, "quantity": i.quantity} for i in cart.items]
#             total = sum(i.quantity * i.price for i in cart.items)
#             return {"cart": {"items": items, "total": total}}
#     # fallback for guest
#     return {"cart": session.get("cart", {"items": [], "total": 0})}