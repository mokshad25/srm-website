import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database.models import Conversation, Message


def get_or_create_conversation(db: Session, session_id: str | None) -> Conversation:
    retention_cutoff = datetime.now(timezone.utc) - timedelta(days=get_settings().conversation_retention_days)
    db.execute(
        delete(Conversation)
        .where(Conversation.created_at < retention_cutoff)
        .execution_options(synchronize_session=False)
    )
    if session_id:
        try:
            session_id = str(uuid.UUID(session_id))
        except ValueError as exc:
            raise ValueError("session_id must be a UUID.") from exc
        conversation = db.scalar(select(Conversation).where(Conversation.session_id == session_id))
        if conversation:
            return conversation
    else:
        session_id = str(uuid.uuid4())
    conversation = Conversation(session_id=session_id)
    db.add(conversation)
    db.flush()
    return conversation


def load_history(
    db: Session,
    conversation_id: str,
    limit: int | None = None,
) -> list[tuple[str, str]]:
    limit = get_settings().conversation_history_limit if limit is None else max(0, limit)
    messages = db.scalars(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()
    return [(message.role, message.content) for message in reversed(messages)]
