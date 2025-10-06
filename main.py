from flask import Flask, render_template, redirect, url_for, request
from config import Config
from forms import LoginForm, RegisterForm
from models import db, User
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


# Create tables
with app.app_context():
    db.create_all()


# Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Routes
@app.route('/')
def home_page():
    return render_template('index.html', title="Protea Bakes")

@app.route('/login', methods=["GET","POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user:
            if bcrypt.check_password_hash(user.password, form.password.data):
                load_user(user)
                next_page = request.args.get('next')  # redirects to where user was going
                return redirect(next_page) if next_page else redirect(url_for('home'))
    return render_template("login.html", title="Login", form=form)

@app.route('/register', methods=["GET","POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data)
        new_user = User(username=form.username.data, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))

    return render_template("register.html", title="Register", form=form)

@login_required
def logout():
    logout_user()
    return redirect(url_for('home_page'))

@app.route("/checkout")
@login_required
def checkout():
    return render_template("checkout.html", Title="Checkout")

@app.route("/base")
def base():
    return render_template("base.html",title="Base")

@app.route("/order")
def order():
    return render_template("order.html", title="order")

if __name__ == "__main__":
    app.run(debug=True, port=5001)