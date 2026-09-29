from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)
    actor_id: str = Field(default="demo-user", min_length=1, max_length=128)
    session_id: str = Field(default="demo-session", min_length=1, max_length=128)


class ChatResponse(BaseModel):
    reply: str
    mode: str


class PlanRequest(BaseModel):
    syllabus: str = Field(min_length=1)
    available_minutes: int = Field(default=60, ge=15, le=720)
