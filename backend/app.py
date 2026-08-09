import os
import re
import sqlite3
from pathlib import Path

import bcrypt
from flask import Flask, jsonify, request
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "smart-parking.db"
SCHEMA_PATH = BASE_DIR / "database" / "schema.sql"

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-]{7,15}$")
VEHICLE_PATTERN = re.compile(r"^[A-Za-z0-9\-\s]{3,15}$")
VEHICLE_TYPES = ("car", "bike", "ev")

app = Flask(__name__)
CORS(app)


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))


init_db()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"error": "Invalid request payload."}), 400

    if not EMAIL_PATTERN.match(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    with get_db() as conn:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?", (email.lower(),)
        ).fetchone()

    if not user or not bcrypt.checkpw(
        password.encode("utf-8"), user["password_hash"].encode("utf-8")
    ):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify(
        {
            "message": "Login successful.",
            "user": {
                "id": user["id"],
                "fullName": user["full_name"],
                "email": user["email"],
                "phone": user["phone"],
                "vehicleNumber": user["vehicle_number"],
                "vehicleType": user["vehicle_type"],
            },
        }
    )


@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}
    full_name = data.get("fullName")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")
    vehicle_number = data.get("vehicleNumber")
    vehicle_type = data.get("vehicleType")

    if not all([full_name, email, phone, password, vehicle_number, vehicle_type]):
        return jsonify({"error": "All fields are required."}), 400

    if not isinstance(email, str) or not EMAIL_PATTERN.match(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    if not isinstance(phone, str) or not PHONE_PATTERN.match(phone):
        return jsonify({"error": "Please enter a valid phone number."}), 400

    if not isinstance(vehicle_number, str) or not VEHICLE_PATTERN.match(vehicle_number):
        return jsonify({"error": "Please enter a valid vehicle number."}), 400

    if vehicle_type not in VEHICLE_TYPES:
        return jsonify({"error": "Please select a valid vehicle type."}), 400

    password_hash = bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    try:
        with get_db() as conn:
            conn.execute(
                """INSERT INTO users
                   (full_name, email, phone, password_hash, vehicle_number, vehicle_type)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    full_name.strip(),
                    email.lower(),
                    phone,
                    password_hash,
                    vehicle_number.strip(),
                    vehicle_type,
                ),
            )
    except sqlite3.IntegrityError:
        return jsonify({"error": "An account with this email already exists."}), 409

    return jsonify({"message": "Account created successfully!"}), 201


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
