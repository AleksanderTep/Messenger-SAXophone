from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.auth.dependencies import current_session
from app.auth.security import create_token, hash_password, verify_password
from app.config import get_settings
from app.db import get_db
from app.models import AuthSession
from app.users.repository import find_identity
from app.users.schemas import RegisterRequest, UserPublic
from app.users.service import create_user

router = APIRouter(prefix="/auth", tags=["auth"])
# Для неизвестного логина тоже считаем хеш, чтобы ответ не выдавал наличие аккаунта.
dummy_hash = hash_password("unused-dummy-password")


class LoginRequest(BaseModel):
    identity: str = Field(min_length=1, max_length=254)
    password: str = Field(min_length=1, max_length=128, repr=False)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


@router.post("/register", response_model=UserPublic, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    return create_user(db, data)


@router.post("/login", response_model=LoginResponse)
def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = find_identity(db, data.identity)
    valid = verify_password(data.password, user.password_hash if user else dummy_hash)
    if not user or not valid:
        raise HTTPException(
            401, "Invalid login or password", headers={"WWW-Authenticate": "Bearer"}
        )
    session_id = uuid4()
    token, expires = create_token(user.id, session_id)
    db.add(AuthSession(id=session_id, user_id=user.id, expires_at=expires))
    db.commit()
    response.headers["Cache-Control"] = "no-store"
    return LoginResponse(
        access_token=token,
        expires_in=get_settings().access_token_minutes * 60,
        user=UserPublic.model_validate(user),
    )


@router.post("/logout", status_code=204)
def logout(session: AuthSession = Depends(current_session), db: Session = Depends(get_db)):
    db.execute(delete(AuthSession).where(AuthSession.id == session.id))
    db.commit()
    return Response(status_code=204)
