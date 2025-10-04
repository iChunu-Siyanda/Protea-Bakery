from flask import Flask, render_template
from config import Config
from models import db
from cart_route import cart_bp

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)

# Register blueprints
app.register_blueprint(cart_bp)

# Create tables
with app.app_context():
    db.create_all()

@app.route('/')
def home_page():
    return render_template('index.html', title="Protea Bakes")

@app.route("/base")
def base():
    return render_template("base.html",title="Base",)


if __name__ == "__main__":
    app.run(debug=True, port=5001)