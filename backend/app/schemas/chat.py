from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.config import get_settings


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)
    session_id: str | None = Field(default=None, max_length=36)
    campus: Literal["Kattankulathur"] = "Kattankulathur"
    academic_year: str | None = Field(default=None, pattern=r"^20\d{2}[-/]\d{2,4}$")

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, question: str) -> str:
        question = question.strip()
        if not question:
            raise ValueError("Question must not be blank.")
        if len(question) > get_settings().max_question_characters:
            raise ValueError(f"Question must be at most {get_settings().max_question_characters} characters.")
        return question


class SourceReference(BaseModel):
    source_id: str
    title: str
    url: str
    academic_year: str | None = None
    category: str
    campus: str
    published_date: str | None = None
    last_verified_at: str | None = None
    similarity: float = Field(ge=-1, le=1)


class ChatResponse(BaseModel):
    answer: str
    session_id: str
    message_id: str | None = None
    sources: list[SourceReference] = Field(default_factory=list)
    status: Literal["answered", "unverified", "out_of_scope", "needs_clarification", "conflicting"]


class FeedbackRequest(BaseModel):
    message_id: str = Field(min_length=1, max_length=36)
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)
