import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .agent import chat
from .models import ChatRequest, ChatResponse, PlanRequest
from .study_engine import build_plan

app = FastAPI(title="Nexora Agent API", version="0.1.0")

origins = [x.strip() for x in os.getenv("NEXORA_CORS_ORIGINS", "http://localhost:5173").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "nexora-agent", "aws_enabled": os.getenv("NEXORA_AWS_ENABLED", "false").lower() == "true"}


@app.post("/api/chat", response_model=ChatResponse)
def api_chat(payload: ChatRequest):
    reply, mode = chat(payload.message, payload.actor_id, payload.session_id)
    return ChatResponse(reply=reply, mode=mode)


@app.post("/api/plan")
def api_plan(payload: PlanRequest):
    return {"plan": build_plan(payload.syllabus, payload.available_minutes)}
