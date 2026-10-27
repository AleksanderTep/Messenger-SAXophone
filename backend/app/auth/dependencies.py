from datetime import UTC, datetime
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_token
from app.db import get_db
from app.models import AuthSession, User

bearer = HTTPBearer(auto_error=False)


def unauthorized():
    return HTTPException(401, "Authentication required", headers={"WWW-Authenticate": "Bearer"})


def current_session(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
):
    if not credentials:
        raise unauthorized()
    try:
        payload = decode_token(credentials.credentials)
        session_id, user_id = UUID(payload["jti"]), UUID(payload["sub"])
    except (jwt.InvalidTokenError, ValueError, TypeError, KeyError):
        raise unauthorized() from None
    session = db.get(AuthSession, session_id)
    if not session or session.user_id != user_id:
        raise unauthorized()
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=UTC)
    if expires <= datetime.now(UTC):
        raise unauthorized()
    return session


def current_user(
    session: AuthSession = Depends(current_session),
    db: Session = Depends(get_db),
):
    user = db.get(User, session.user_id)
    if user is None:
        raise unauthorized()
    return user
