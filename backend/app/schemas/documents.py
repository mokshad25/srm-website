from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class IngestRequest(BaseModel):
    url: HttpUrl
    category: str = Field(pattern="^(academics|admissions|campus)$")
    title: str | None = Field(default=None, max_length=500)
    academic_year: str | None = Field(default=None, max_length=20)
    campus: Literal["Kattankulathur"] = "Kattankulathur"


class DocumentSummary(BaseModel):
    id: str
    title: str
    category: str
    campus: str
    source_url: str
    academic_year: str | None
    chunk_count: int

    model_config = ConfigDict(from_attributes=True)
