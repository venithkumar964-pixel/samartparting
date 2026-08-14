"""REST API routes for the Smart Parking & Slot Booking Platform.

All endpoints live under the `/api` prefix and return/accept JSON.

A simple, beginner-friendly authorization model is used:
  * A logged-in user is identified by the `X-User-Id` request header.
  * Admin-only endpoints check that the user in that header has role "admin".
No tokens / sessions are used, which is fine for a college demonstration.
"""

import re
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database import db
from models import Booking, Parking, Payment, Slot, User

api = Blueprint("api", __name__, url_prefix="/api")

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-]{7,15}$")
VEHICLE_PATTERN = re.compile(r"^[A-Za-z0-9\-\s]{3,15}$")
VALID_VEHICLE_TYPES = ("car", "bike", "ev")
VALID_SLOT_STATUSES = ("available", "occupied", "reserved")


class ApiError(Exception):
    """Raised for expected API errors; rendered as a JSON error response."""

    def __init__(self, status_code, message):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


@api.errorhandler(ApiError)
def handle_api_error(error):
    return jsonify({"success": False, "error": error.message}), error.status_code


@api.get("")
def api_root():
    """Root endpoint: tells the caller the Smart Parking API is up."""
    return jsonify({"success": True, "message": "Smart Parking API is running"})


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

def _payload():
    """Read and return the JSON request body (empty dict when absent)."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _current_user():
    """Return the user identified by the X-User-Id header, or None."""
    user_id = request.headers.get("X-User-Id")
    if user_id and user_id.isdigit():
        return db.session.get(User, int(user_id))
    return None


def _admin_required():
    """Return the current user only if they are an admin."""
    user = _current_user()
    if not user or user.role != "admin":
        raise ApiError(403, "Admin access required.")
    return user


def _refresh_parking_counts(parking):
    """Keep a parking's total/available slot counters in sync with its slots."""
    total = len(parking.slots)
    available = sum(1 for s in parking.slots if s.status == "available")
    parking.total_slots = total
    parking.available_slots = available


def _duration_hours(start_time, end_time):
    """Compute the number of hours between two HH:MM times."""
    try:
        sh, sm = map(int, start_time.split(":"))
        eh, em = map(int, end_time.split(":"))
        start = timedelta(hours=sh, minutes=sm)
        end = timedelta(hours=eh, minutes=em)
        delta = (end - start).total_seconds() / 3600.0
    except (ValueError, TypeError):
        return None
    if delta <= 0:
        return None
    return round(delta, 2)


def _validate_booking_payload(data):
    """Validate the fields required to create a booking."""
    required = ["user_id", "parking_id", "slot_id", "booking_date", "start_time", "end_time"]
    missing = [field for field in required if not data.get(field)]
    if missing:
        raise ApiError(400, f"Missing required field(s): {', '.join(missing)}.")

    parking = db.session.get(Parking, int(data["parking_id"]))
    if not parking:
        raise ApiError(404, "Parking location not found.")

    slot = db.session.get(Slot, int(data["slot_id"]))
    if not slot or slot.parking_id != parking.id:
        raise ApiError(404, "Slot not found in the selected parking location.")

    if slot.status != "available":
        raise ApiError(409, "This slot is no longer available. Please pick another slot.")

    duration = _duration_hours(str(data["start_time"]), str(data["end_time"]))
    if duration is None:
        raise ApiError(400, "End time must be after start time (HH:MM format).")

    amount = round(float(duration) * parking.price_per_hour, 2)
    return parking, slot, duration, amount


# --------------------------------------------------------------------------
# Authentication
# --------------------------------------------------------------------------

@api.post("/register")
def register():
    data = _payload()

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    phone = str(data.get("phone", "")).strip()
    password = data.get("password", "")
    vehicle_number = str(data.get("vehicleNumber", "")).strip().upper()
    vehicle_type = data.get("vehicleType", "")

    if not name:
        raise ApiError(400, "Full name is required.")
    if not EMAIL_PATTERN.match(email):
        raise ApiError(400, "Please enter a valid email address.")
    if not PHONE_PATTERN.match(phone):
        raise ApiError(400, "Please enter a valid phone number.")
    if len(password or "") < 8:
        raise ApiError(400, "Password should be at least 8 characters.")
    if not VEHICLE_PATTERN.match(vehicle_number):
        raise ApiError(400, "Please enter a valid vehicle number.")
    if vehicle_type not in VALID_VEHICLE_TYPES:
        raise ApiError(400, "Vehicle type must be one of: car, bike, ev.")

    if User.query.filter_by(email=email).first():
        raise ApiError(409, "An account with this email already exists.")

    user = User(
        name=name,
        email=email,
        phone=phone,
        password=generate_password_hash(password),
        vehicle_number=vehicle_number,
        vehicle_type=vehicle_type,
        role="user",
    )
    db.session.add(user)
    db.session.commit()

    return (
        jsonify(
            {
                "success": True,
                "message": "Account created successfully! Please login.",
                "user": user.to_dict(),
            }
        ),
        201,
    )


@api.post("/login")
def login():
    data = _payload()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password or ""):
        raise ApiError(401, "Invalid email or password.")

    return jsonify({"success": True, "message": "Login successful!", "user": user.to_dict()})


# --------------------------------------------------------------------------
# Users (admin only)
# --------------------------------------------------------------------------

@api.get("/users")
def list_users():
    _admin_required()
    users = User.query.order_by(User.id.desc()).all()
    return jsonify({"success": True, "users": [u.to_dict() for u in users]})


@api.get("/users/<int:user_id>")
def get_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        raise ApiError(404, "User not found.")
    admin = _current_user()
    if not admin or (admin.role != "admin" and admin.id != user.id):
        raise ApiError(403, "Admin access required.")
    return jsonify({"success": True, "user": user.to_dict()})


@api.put("/users/<int:user_id>")
def update_user(user_id):
    _admin_required()
    user = db.session.get(User, user_id)
    if not user:
        raise ApiError(404, "User not found.")

    data = _payload()
    if "name" in data:
        user.name = str(data["name"]).strip()
    if "phone" in data:
        if not PHONE_PATTERN.match(str(data["phone"])):
            raise ApiError(400, "Please enter a valid phone number.")
        user.phone = str(data["phone"]).strip()
    if "vehicleNumber" in data:
        user.vehicle_number = str(data["vehicleNumber"]).strip().upper()
    if "vehicleType" in data:
        if data["vehicleType"] not in VALID_VEHICLE_TYPES:
            raise ApiError(400, "Vehicle type must be one of: car, bike, ev.")
        user.vehicle_type = data["vehicleType"]
    if "role" in data:
        if data["role"] not in ("user", "admin"):
            raise ApiError(400, "Role must be one of: user, admin.")
        user.role = data["role"]

    db.session.commit()
    return jsonify({"success": True, "message": "User updated successfully.", "user": user.to_dict()})


@api.delete("/users/<int:user_id>")
def delete_user(user_id):
    _admin_required()
    user = db.session.get(User, user_id)
    if not user:
        raise ApiError(404, "User not found.")
    if user.bookings:
        raise ApiError(400, "Cannot delete a user who has bookings.")
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User deleted successfully."})


# --------------------------------------------------------------------------
# Parking locations
# --------------------------------------------------------------------------

@api.get("/parking")
def list_parking():
    query = request.args.get("q", "").strip().lower()
    parkings = Parking.query.order_by(Parking.id.asc()).all()
    if query:
        parkings = [p for p in parkings if query in p.name.lower() or query in p.address.lower()]
    return jsonify({"success": True, "parkings": [p.to_dict() for p in parkings]})


@api.get("/parking/<int:parking_id>")
def get_parking(parking_id):
    parking = db.session.get(Parking, parking_id)
    if not parking:
        raise ApiError(404, "Parking location not found.")
    data = parking.to_dict()
    data["slots"] = [s.to_dict() for s in parking.slots]
    return jsonify({"success": True, "parking": data})


@api.post("/parking")
def create_parking():
    _admin_required()
    data = _payload()
    name = str(data.get("name", "")).strip()
    address = str(data.get("address", "")).strip()

    if not name or not address:
        raise ApiError(400, "Parking name and address are required.")

    try:
        price = float(data.get("pricePerHour", 0))
    except (TypeError, ValueError):
        raise ApiError(400, "Price per hour must be a number.")

    parking = Parking(
        name=name,
        address=address,
        price_per_hour=price,
        status=data.get("status", "open"),
    )
    db.session.add(parking)
    db.session.commit()
    return jsonify({"success": True, "message": "Parking location added.", "parking": parking.to_dict()}), 201


@api.put("/parking/<int:parking_id>")
def update_parking(parking_id):
    _admin_required()
    parking = db.session.get(Parking, parking_id)
    if not parking:
        raise ApiError(404, "Parking location not found.")

    data = _payload()
    if "name" in data and str(data["name"]).strip():
        parking.name = str(data["name"]).strip()
    if "address" in data and str(data["address"]).strip():
        parking.address = str(data["address"]).strip()
    if "pricePerHour" in data:
        try:
            parking.price_per_hour = float(data["pricePerHour"])
        except (TypeError, ValueError):
            raise ApiError(400, "Price per hour must be a number.")
    if "status" in data and data["status"] in ("open", "closed"):
        parking.status = data["status"]

    db.session.commit()
    return jsonify({"success": True, "message": "Parking location updated.", "parking": parking.to_dict()})


@api.delete("/parking/<int:parking_id>")
def delete_parking(parking_id):
    _admin_required()
    parking = db.session.get(Parking, parking_id)
    if not parking:
        raise ApiError(404, "Parking location not found.")
    if parking.bookings:
        raise ApiError(400, "Cannot delete a parking location that has bookings.")
    db.session.delete(parking)
    db.session.commit()
    return jsonify({"success": True, "message": "Parking location deleted."})


# --------------------------------------------------------------------------
# Parking slots
# --------------------------------------------------------------------------

@api.get("/parking/<int:parking_id>/slots")
def list_slots(parking_id):
    parking = db.session.get(Parking, parking_id)
    if not parking:
        raise ApiError(404, "Parking location not found.")
    slots = Slot.query.filter_by(parking_id=parking.id).order_by(Slot.slot_number).all()
    return jsonify({"success": True, "slots": [s.to_dict() for s in slots]})


@api.post("/slots")
def create_slot():
    _admin_required()
    data = _payload()
    parking = db.session.get(Parking, int(data.get("parking_id", 0) or 0))
    if not parking:
        raise ApiError(404, "Parking location not found.")

    slot_number = str(data.get("slotNumber", "")).strip().upper()
    slot_type = data.get("slotType", "car")
    status = data.get("status", "available")

    if not slot_number:
        raise ApiError(400, "Slot number is required.")
    if slot_type not in VALID_VEHICLE_TYPES:
        raise ApiError(400, "Slot type must be one of: car, bike, ev.")
    if status not in VALID_SLOT_STATUSES:
        raise ApiError(400, "Slot status must be one of: available, occupied, reserved.")

    if Slot.query.filter_by(parking_id=parking.id, slot_number=slot_number).first():
        raise ApiError(409, f"Slot {slot_number} already exists in this parking.")

    slot = Slot(parking_id=parking.id, slot_number=slot_number, slot_type=slot_type, status=status)
    db.session.add(slot)
    db.session.flush()
    _refresh_parking_counts(parking)
    db.session.commit()
    return jsonify({"success": True, "message": f"Slot {slot_number} added.", "slot": slot.to_dict()}), 201


@api.put("/slots/<int:slot_id>")
def update_slot(slot_id):
    _admin_required()
    slot = db.session.get(Slot, slot_id)
    if not slot:
        raise ApiError(404, "Slot not found.")

    data = _payload()
    if "slotNumber" in data and str(data["slotNumber"]).strip():
        slot.slot_number = str(data["slotNumber"]).strip().upper()
    if "slotType" in data:
        if data["slotType"] not in VALID_VEHICLE_TYPES:
            raise ApiError(400, "Slot type must be one of: car, bike, ev.")
        slot.slot_type = data["slotType"]
    if "status" in data:
        if data["status"] not in VALID_SLOT_STATUSES:
            raise ApiError(400, "Slot status must be one of: available, occupied, reserved.")
        slot.status = data["status"]

    db.session.flush()
    _refresh_parking_counts(slot.parking)
    db.session.commit()
    return jsonify({"success": True, "message": "Slot updated.", "slot": slot.to_dict()})


@api.delete("/slots/<int:slot_id>")
def delete_slot(slot_id):
    _admin_required()
    slot = db.session.get(Slot, slot_id)
    if not slot:
        raise ApiError(404, "Slot not found.")
    if slot.bookings:
        raise ApiError(400, "Cannot delete a slot that has bookings.")
    parking = slot.parking
    db.session.delete(slot)
    db.session.flush()
    _refresh_parking_counts(parking)
    db.session.commit()
    return jsonify({"success": True, "message": "Slot deleted."})


# --------------------------------------------------------------------------
# Bookings
# --------------------------------------------------------------------------

@api.get("/bookings")
def list_bookings():
    admin = _current_user()
    if not admin:
        raise ApiError(401, "Please login to view bookings.")
    if admin.role == "admin":
        bookings = Booking.query.order_by(Booking.id.desc()).all()
    else:
        bookings = Booking.query.filter_by(user_id=admin.id).order_by(Booking.id.desc()).all()
    return jsonify({"success": True, "bookings": [b.to_dict() for b in bookings]})


@api.get("/bookings/<int:booking_id>")
def get_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise ApiError(404, "Booking not found.")
    user = _current_user()
    if not user or (user.role != "admin" and user.id != booking.user_id):
        raise ApiError(403, "You do not have access to this booking.")
    return jsonify({"success": True, "booking": booking.to_dict()})


@api.post("/bookings")
def create_booking():
    data = _payload()
    parking, slot, duration, amount = _validate_booking_payload(data)

    user = db.session.get(User, int(data["user_id"]))
    if not user:
        raise ApiError(404, "User not found.")

    booking = Booking(
        user_id=user.id,
        parking_id=parking.id,
        slot_id=slot.id,
        booking_date=str(data["booking_date"]),
        start_time=str(data["start_time"]),
        end_time=str(data["end_time"]),
        duration=duration,
        amount=amount,
        status="pending",
    )
    slot.status = "reserved"

    db.session.add(booking)
    db.session.flush()
    _refresh_parking_counts(parking)
    db.session.commit()

    return (
        jsonify(
            {
                "success": True,
                "message": "Booking created. Proceed to payment.",
                "booking": booking.to_dict(),
            }
        ),
        201,
    )


@api.put("/bookings/<int:booking_id>")
def update_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise ApiError(404, "Booking not found.")

    user = _current_user()
    if not user:
        raise ApiError(401, "Please login to update a booking.")
    if user.role != "admin" and user.id != booking.user_id:
        raise ApiError(403, "You do not have access to this booking.")

    data = _payload()
    new_status = data.get("status")
    if new_status not in ("pending", "confirmed", "cancelled", "completed"):
        raise ApiError(400, "Invalid booking status.")

    if new_status == "cancelled" and booking.status != "cancelled":
        booking.slot.status = "available"
        booking.status = "cancelled"
        if booking.payment:
            booking.payment.payment_status = "failed"
    else:
        booking.status = new_status

    db.session.flush()
    _refresh_parking_counts(booking.parking)
    db.session.commit()
    return jsonify({"success": True, "message": "Booking updated.", "booking": booking.to_dict()})


@api.delete("/bookings/<int:booking_id>")
def delete_booking(booking_id):
    _admin_required()
    booking = db.session.get(Booking, booking_id)
    if not booking:
        raise ApiError(404, "Booking not found.")

    if booking.status != "cancelled":
        booking.slot.status = "available"
        _refresh_parking_counts(booking.parking)

    db.session.delete(booking)
    db.session.commit()
    return jsonify({"success": True, "message": "Booking deleted."})


# --------------------------------------------------------------------------
# Payments
# --------------------------------------------------------------------------

@api.get("/payments")
def list_payments():
    admin = _current_user()
    if not admin:
        raise ApiError(401, "Please login to view payments.")
    if admin.role == "admin":
        payments = Payment.query.order_by(Payment.id.desc()).all()
    else:
        payments = (
            Payment.query.join(Booking)
            .filter(Booking.user_id == admin.id)
            .order_by(Payment.id.desc())
            .all()
        )
    return jsonify({"success": True, "payments": [p.to_dict() for p in payments]})


@api.get("/payments/<int:payment_id>")
def get_payment(payment_id):
    payment = db.session.get(Payment, payment_id)
    if not payment:
        raise ApiError(404, "Payment not found.")
    return jsonify({"success": True, "payment": payment.to_dict()})


@api.post("/payments")
def create_payment():
    data = _payload()
    booking = db.session.get(Booking, int(data.get("booking_id", 0) or 0))
    if not booking:
        raise ApiError(404, "Booking not found.")

    method = str(data.get("paymentMethod", "")).strip()
    if method not in ("UPI", "Card", "Cash"):
        raise ApiError(400, "Payment method must be one of: UPI, Card, Cash.")

    payment = Payment(
        booking_id=booking.id,
        amount=booking.amount,
        payment_method=method,
        payment_status="paid",
        payment_date=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    )
    booking.status = "confirmed"

    db.session.add(payment)
    db.session.commit()

    return jsonify(
        {
            "success": True,
            "message": "Payment successful! Your booking is confirmed.",
            "booking_id": booking.id,
            "payment": payment.to_dict(),
            "booking": booking.to_dict(),
        }
    ), 201


# --------------------------------------------------------------------------
# Admin dashboard
# --------------------------------------------------------------------------

@api.get("/admin/dashboard")
def admin_dashboard():
    _admin_required()

    total_users = User.query.count()
    total_parking = Parking.query.count()
    total_slots = Slot.query.count()
    available_slots = Slot.query.filter_by(status="available").count()
    occupied_slots = Slot.query.filter_by(status="occupied").count()
    total_bookings = Booking.query.count()
    confirmed_bookings = Booking.query.filter_by(status="confirmed").count()
    revenue = db.session.query(db.func.coalesce(db.func.sum(Booking.amount), 0.0)).filter(
        Booking.status == "confirmed"
    ).scalar()

    return jsonify(
        {
            "success": True,
            "dashboard": {
                "totalUsers": total_users,
                "totalParking": total_parking,
                "totalSlots": total_slots,
                "availableSlots": available_slots,
                "occupiedSlots": occupied_slots,
                "totalBookings": total_bookings,
                "confirmedBookings": confirmed_bookings,
                "revenue": round(revenue, 2),
            }
        }
    )


@api.get("/health")
def health():
    return jsonify({"status": "ok"})