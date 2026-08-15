"""Smart Parking & Slot Booking Platform — Flask application entry point.

Run with:
    python app.py

The API is served at http://127.0.0.1:5000 with all routes under /api.
"""

import os

from flask import Flask
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from database import db
from models import Parking, Slot, User
from routes import api

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Sample data helpers ------------------------------------------------------

ADMIN_EMAIL = "admin@smartpark.in"
ADMIN_PASSWORD = "admin123"

DEMO_EMAIL = "demo@smartpark.in"
DEMO_PASSWORD = "demo1234"


def seed_data():
    """Insert sample users and parking locations the first time the DB is created."""
    if User.query.first():
        return

    admin = User(
        name="Admin",
        email=ADMIN_EMAIL,
        phone="0000000000",
        password=generate_password_hash(ADMIN_PASSWORD),
        vehicle_number="ADMIN-01",
        vehicle_type="car",
        role="admin",
    )
    demo = User(
        name="Demo User",
        email=DEMO_EMAIL,
        phone="+91 9876543210",
        password=generate_password_hash(DEMO_PASSWORD),
        vehicle_number="TN-01-AB-1234",
        vehicle_type="car",
        role="user",
    )
    db.session.add_all([admin, demo])

    sample_parkings = [
        ("JJ College Parking", "12 College Road, Anna Nagar, Chennai", 30.0),
        ("Central Parking Area", "Mount Road, Chennai", 25.0),
        ("City Mall Parking", "T. Nagar, Chennai", 40.0),
        ("Railway Station Parking", "Central Station Road, Chennai", 20.0),
    ]

    statuses = [
        "available", "occupied", "available", "reserved",
        "available", "occupied", "available", "reserved",
    ]
    slot_types = ["car"] * 5 + ["bike", "ev", "car"]
    slot_numbers = ["A01", "A02", "A03", "A04", "A05", "B01", "B02", "B03"]

    for name, address, price in sample_parkings:
        parking = Parking(
            name=name,
            address=address,
            price_per_hour=price,
            status="open",
        )
        db.session.add(parking)
        db.session.flush()

        for index, slot_number in enumerate(slot_numbers):
            slot = Slot(
                parking_id=parking.id,
                slot_number=slot_number,
                slot_type=slot_types[index],
                status=statuses[index],
            )
            db.session.add(slot)
            parking.total_slots += 1
            if statuses[index] == "available":
                parking.available_slots += 1

    db.session.commit()


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    db_path = os.environ.get(
        "SMART_PARKING_DB", os.path.join(BASE_DIR, "smart_parking.db")
    )
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + db_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                ]
            }
        },
    )

    db.init_app(app)
    app.register_blueprint(api)

    with app.app_context():
        db.create_all()
        seed_data()

    return app


# Module-level app so `flask run` also works.
app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="127.0.0.1", port=port, debug=True)