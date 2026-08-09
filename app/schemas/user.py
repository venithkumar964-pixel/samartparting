from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import PHONE_PATTERN, VEHICLE_PATTERN, VEHICLE_TYPES

VehicleType = Literal["car", "bike", "ev"]


class UserCreate(BaseModel):
    fullName: str = Field(..., min_length=1)
    email: EmailStr
    phone: str
    password: str = Field(..., min_length=8)
    vehicleNumber: str
    vehicleType: VehicleType

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        if not PHONE_PATTERN.match(value):
            raise ValueError("Please enter a valid phone number.")
        return value

    @field_validator("vehicleNumber")
    @classmethod
    def validate_vehicle_number(cls, value: str) -> str:
        if not VEHICLE_PATTERN.match(value):
            raise ValueError("Please enter a valid vehicle number.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)
    rememberMe: bool = False

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.lower()


class UserOut(BaseModel):
    model_config = {"from_attributes": True, "populate_by_name": True}

    id: int
    email: str
    phone: str
    fullName: str = Field(validation_alias="full_name", serialization_alias="fullName")
    vehicleNumber: str = Field(
        validation_alias="vehicle_number", serialization_alias="vehicleNumber"
    )
    vehicleType: str = Field(
        validation_alias="vehicle_type", serialization_alias="vehicleType"
    )


class LoginResponse(BaseModel):
    message: str
    user: UserOut


class MessageResponse(BaseModel):
    message: str
