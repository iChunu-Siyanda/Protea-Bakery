from flask import Blueprint,request, redirect, url_for, flash
from datetime import datetime
from flask_login import current_user, login_required
from website import db
from website.models import Booking

bookings_bp = Blueprint('bookings', __name__, template_folder='templates')

@bookings_bp.route('/book', methods=['POST'])
@login_required
def create_booking():
    date_str = request.form['date']
    time_str = request.form['time']
    date = datetime.strptime(date_str, '%Y-%m-%d').date()
    time = datetime.strptime(time_str, '%H:%M').time()

    booking = Booking(
        user_id=current_user.id,
        name=current_user.username,
        email="",  # optional if you want to store
        phone="",
        date=date,
        time=time,
        message="Order booking from cart"
    )

    db.session.add(booking)
    db.session.commit()
    flash("Booking confirmed! We’ll prepare your order for {date} at {time}", "success")
    return redirect(url_for('order'))
