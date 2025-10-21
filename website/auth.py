import bcrypt
from flask import Blueprint, session, request, redirect, url_for, render_template, app
from flask_login import login_user, logout_user, login_required
from website.forms import LoginForm, RegisterForm
from website.models import User
from . import db, bcrypt, login_manager

auth_bp = Blueprint("auth", __name__)


@login_manager.user_loader
def load_user(user_id):
    print(f"User {user_id} Loaded")
    return User.query.get(int(user_id))

@auth_bp.route('/login', methods=["GET","POST"])
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

@auth_bp.route('/register', methods=["GET","POST"])
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