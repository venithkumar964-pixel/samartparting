import re

import bcrypt

EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-]{7,15}$")
VEHICLE_PATTERN = re.compile(r"^[A-Za-z0-9\-\s]{3,15}$")
VEHICLE_TYPES = ("car", "bike", "ev")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
