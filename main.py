from flask import Flask, render_template
#cac5b6
app = Flask(__name__)

@app.route('/')
def home_page():
    return render_template('index.html', title="Protea Bakes")

@app.route("/base")
def base():
    return render_template("base.html", title="Base")

@app.route("/order")
def order():
    return render_template("order.html")

if __name__ == "__main__":
    app.run(debug=True, port=5001)