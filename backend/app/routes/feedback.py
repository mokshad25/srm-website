from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.models import Feedback, Message
from app.schemas.chat import FeedbackRequest

router = APIRouter()


@router.post("/feedback", status_code=status.HTTP_201_CREATED)
def submit_feedback(payload: FeedbackRequest, db: Session = Depends(get_db)):
    message = db.get(Message, payload.message_id)
    if not message or message.role != "assistant":
        raise HTTPException(status_code=404, detail="Message not found.")
    feedback = Feedback(message_id=payload.message_id, rating=payload.rating, comment=payload.comment)
    db.add(feedback)
    db.commit()
    return {"status": "received"}
