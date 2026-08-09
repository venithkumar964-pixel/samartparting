from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.user import LoginRequest, LoginResponse, MessageResponse, UserCreate, UserOut
from app.services.auth_service import authenticate_user, register_user

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = authenticate_user(db, payload.email, payload.password)
    return LoginResponse(message="Login successful.", user=UserOut.model_validate(user))


@router.post("/register", response_model=MessageResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> MessageResponse:
    register_user(db, payload)
    return MessageResponse(message="Account created successfully!")
