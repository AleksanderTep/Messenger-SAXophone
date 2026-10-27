import os
from uuid import uuid4

import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.exc import IntegrityError

pytestmark = pytest.mark.skipif(
    os.getenv("RUN_DB_TESTS") != "1", reason="Requires migrated PostgreSQL; RUN_DB_TESTS=1"
)


def test_migrated_schema_and_constraints():
    engine = create_engine(os.environ["DATABASE_URL"])
    assert {"users", "chats", "chat_members", "messages"} <= set(inspect(engine).get_table_names())
    a, b = sorted([uuid4(), uuid4()])
    outsider, chat = uuid4(), uuid4()
    with engine.connect() as db:
        for user in (a, b, outsider):
            db.execute(
                text(
                    "INSERT INTO users (id, username, email, display_name, password_hash) "
                    "VALUES (:id, :name, :email, 'Test', 'not-a-real-hash')"
                ),
                {"id": user, "name": user.hex[:20], "email": f"{user}@example.test"},
            )
        db.execute(
            text("INSERT INTO chats (id, user_low_id, user_high_id) VALUES (:id, :a, :b)"),
            {"id": chat, "a": a, "b": b},
        )
        db.execute(
            text("INSERT INTO chat_members (chat_id, user_id) VALUES (:c, :u)"),
            [{"c": chat, "u": a}, {"c": chat, "u": b}],
        )
        for body, sender in [("hello", a), ("", a), ("hello", outsider)]:
            if body and sender == a:
                db.execute(
                    text(
                        "INSERT INTO messages (id, chat_id, sender_id, body) "
                        "VALUES (:id, :c, :s, :body)"
                    ),
                    {"id": uuid4(), "c": chat, "s": sender, "body": body},
                )
            else:
                with pytest.raises(IntegrityError), db.begin_nested():
                    db.execute(
                        text(
                            "INSERT INTO messages (id, chat_id, sender_id, body) "
                            "VALUES (:id, :c, :s, :body)"
                        ),
                        {"id": uuid4(), "c": chat, "s": sender, "body": body},
                    )
        with pytest.raises(IntegrityError), db.begin_nested():
            db.execute(
                text("INSERT INTO chats (id, user_low_id, user_high_id) VALUES (:id, :a, :b)"),
                {"id": uuid4(), "a": a, "b": b},
            )
    engine.dispose()
