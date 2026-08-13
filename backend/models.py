"""SQLAlchemy ORM models for the Smart Parking & Slot Booking Platform.

Relationships:
    User    -> Booking          (one-to-many)
    Parking -> Slot             (one-to-many)
    Parking -> Booking          (one-to-many)
    Slot    -> Booking          (one-to-many)
    Booking -> Payment          (one-to-one)
"""

from datetime import datetime

from database import db


def _now() -> str:
    """Current timestamp as a string stored in the database."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(256), nullable=False)  # stores a hash, never plain text
    vehicle_number = db.Column(db.String(20), nullable=False)
    vehicle_type = db.Column(db.String(10), nullable=False)  # car / bike / ev
    role = db.Column(db.String(10), nullable=False, default="user")  # user / admin
    created_at = db.Column(db.String(40), nullable=False, default=_now)

    bookings = db.relationship("Booking", backref="user", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "vehicleNumber": self.vehicle_number,
            "vehicleType": self.vehicle_type,
            "role": self.role,
            "createdAt": self.created_at,
        }


class Parking(db.Model):
    __tablename__ = "parkings"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    total_slots = db.Column(db.Integer, nullable=False, default=0)
    available_slots = db.Column(db.Integer, nullable=False, default=0)
    price_per_hour = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(20), nullable=False, default="open")  # open / closed

    slots = db.relationship(
        "Slot", backref="parking", cascade="all, delete-orphan", lazy=True
    )
    bookings = db.relationship("Booking", backref="parking", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "totalSlots": self.total_slots,
            "availableSlots": self.available_slots,
            "pricePerHour": self.price_per_hour,
            "status": self.status,
        }


class Slot(db.Model):
    __tablename__ = "slots"

    id = db.Column(db.Integer, primary_key=True)
    parking_id = db.Column(db.Integer, db.ForeignKey("parkings.id"), nullable=False)
    slot_number = db.Column(db.String(10), nullable=False)
    slot_type = db.Column(db.String(10), nullable=False, default="car")  # car / bike / ev
    status = db.Column(db.String(20), nullable=False, default="available")  # available / occupied / reserved

    bookings = db.relationship("Booking", backref="slot", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "parkingId": self.parking_id,
            "slotNumber": self.slot_number,
            "slotType": self.slot_type,
            "status": self.status,
        }


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    parking_id = db.Column(db.Integer, db.ForeignKey("parkings.id"), nullable=False)
    slot_id = db.Column(db.Integer, db.ForeignKey("slots.id"), nullable=False)
    booking_date = db.Column(db.String(20), nullable=False)  # YYYY-MM-DD
    start_time = db.Column(db.String(5), nullable=False)     # HH:MM (24 hour)
    end_time = db.Column(db.String(5), nullable=False)       # HH:MM (24 hour)
    duration = db.Column(db.Float, nullable=False)           # hours
    amount = db.Column(db.Float, nullable=False)             # total parking fee
    status = db.Column(db.String(20), nullable=False, default="pending")  # pending / confirmed / cancelled / completed
    created_at = db.Column(db.String(40), nullable=False, default=_now)

    payment = db.relationship(
        "Payment", backref="booking", uselist=False, cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.user_id,
            "bookingDate": self.booking_date,
            "startTime": self.start_time,
            "endTime": self.end_time,
            "duration": self.duration,
            "amount": self.amount,
            "status": self.status,
            "createdAt": self.created_at,
            "parkingId": self.parking_id,
            "parkingName": getattr(self.parking, "name", ""),
            "parkingAddress": getattr(self.parking, "address", ""),
            "slotId": self.slot_id,
            "slotNumber": getattr(self.slot, "slot_number", ""),
            "slotType": getattr(self.slot, "slot_type", ""),
            "paymentStatus": getattr(self.payment, "payment_status", ""),
            "paymentMethod": getattr(self.payment, "payment_method", ""),
        }


class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey("bookings.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(20), nullable=False)  # UPI / Card / Cash
    payment_status = db.Column(db.String(20), nullable=False, default="paid")  # paid / pending / failed
    payment_date = db.Column(db.String(40), nullable=False, default=_now)

    def to_dict(self):
        return {
            "id": self.id,
            "bookingId": self.booking_id,
            "amount": self.amount,
            "paymentMethod": self.payment_method,
            "paymentStatus": self.payment_status,
            "paymentDate": self.payment_date,
        }