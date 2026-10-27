from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models import User


def find_identity(db: Session, identity: str):
    identity = identity.strip().lower()
    return db.scalar(
        select(User).where(
            or_(func.lower(User.username) == identity, func.lower(User.email) == identity)
        )
    )


def find_conflict(db: Session, username: str, email: str):
    return db.scalar(
        select(User.id).where(
            or_(func.lower(User.username) == username, func.lower(User.email) == email)
        )
    )


def search_users(db: Session, query: str, exclude_id, limit: int):
    query = query.strip().lower()
    if not query:
        return []
    return db.scalars(
        select(User)
        .where(
            User.id != exclude_id,
            or_(
                func.lower(User.username).contains(query, autoescape=True),
                func.lower(User.display_name).contains(query, autoescape=True),
            ),
        )
        .order_by(User.username, User.id)
        .limit(limit)
    ).all()
