from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.auth.dependencies import current_user
from app.db import get_db
from app.models import User
from app.users.repository import search_users
from app.users.schemas import UserPublic, UserSummary

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
def me(response: Response, user: User = Depends(current_user)):
    response.headers["Cache-Control"] = "no-store"
    return user


@router.get("", response_model=list[UserSummary])
def search(
    query: str = Query(default="", max_length=80),
    limit: int = Query(default=20, ge=1, le=50),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    return search_users(db, query, user.id, limit)
