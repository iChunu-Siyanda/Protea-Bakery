from datetime import datetime
from flask_login import UserMixin
from website import db


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    #email = db.Column(db.String(100), unique=True)
    username = db.Column(db.String(50), unique=True)
    password_hash = db.Column(db.String(200))
    date_joined = db.Column(db.DateTime(),default=datetime.now())

    cart = db.relationship("Cart", backref=db.backref('user', lazy=True))
    cart_item = db.relationship("CartItem", backref=db.backref('user', lazy=True))

    def __init__(self, username, password):
        self.username = username
        self.password_hash = password

    def __str__(self):
        return '<User %r>' % User.id

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(100), nullable=False)
    product_price = db.Column(db.Float, nullable=False)
    date_added = db.Column(db.DateTime(), default=datetime.now())

    cart = db.relationship('Cart', backref=db.backref('product', lazy=True))
    cart_item = db.relationship('CartItem', backref=db.backref('product', lazy=True))

    def __str__(self):
        return '<Product %r>' % self.product_name

class Cart(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now())

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    cart_items = db.relationship("CartItem", backref="cart", cascade="all, delete-orphan")

    def __str__(self):
        return '<Cart %r>' % self.id

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)

    cart_id = db.Column(db.Integer, db.ForeignKey("cart.id"))
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"))
    user_id =  db.Column(db.Integer, db.ForeignKey("user.id"))

    def __str__(self):
        return '<CartItem %r>' % self.id

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref=db.backref("bookings", lazy=True))
