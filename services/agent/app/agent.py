from __future__ import annotations

import os
from functools import lru_cache

from .study_engine import build_plan

SYSTEM_PROMPT = """You are Nexora, an agentic adaptive learning system built for Alexa+.
You do not behave like a generic tutor. Turn user goals into short, concrete learning actions.
Use the learner's retained state when available. Prefer active recall, targeted repair, and
adaptive replanning. Be concise, supportive, and evidence-oriented. Never fabricate learner
history. When a tool can make the decision more concrete, use it."""


@lru_cache(maxsize=1)
def _toolset():
    from .tools import assess_short_answer, create_adaptive_plan, parse_syllabus, revise_mastery
    return [parse_syllabus, create_adaptive_plan, assess_short_answer, revise_mastery]


def _build_cloud_agent(actor_id: str, session_id: str):
    from strands import Agent
    from strands.models import BedrockModel

    model = BedrockModel(
        model_id=os.getenv("NEXORA_MODEL_ID", "global.anthropic.claude-sonnet-4-6"),
        region_name=os.getenv("AWS_REGION", "us-east-1"),
        temperature=0.25,
    )

    memory_id = os.getenv("AGENTCORE_MEMORY_ID")
    if memory_id:
        from bedrock_agentcore.memory.integrations.strands.config import AgentCoreMemoryConfig
        from bedrock_agentcore.memory.integrations.strands.session_manager import AgentCoreMemorySessionManager
        config = AgentCoreMemoryConfig(memory_id=memory_id, session_id=session_id, actor_id=actor_id)
        manager = AgentCoreMemorySessionManager(config, region_name=os.getenv("AWS_REGION", "us-east-1"))
        return Agent(model=model, system_prompt=SYSTEM_PROMPT, tools=_toolset(), session_manager=manager), manager

    return Agent(model=model, system_prompt=SYSTEM_PROMPT, tools=_toolset()), None


def demo_response(message: str) -> str:
    q = message.lower()
    if "plan" in q or "exam" in q:
        plan = build_plan("Cache Mapping; Booth Algorithm; Memory Hierarchy; Instruction Cycle", 84)
        lead = plan[0]
        return f"I reprioritized the session. Start with {lead['name']} for {lead['minutes']} minutes, then do one worked example and a rapid-recall check. I’ll use that result to replan the remaining time."
    if "quiz" in q or "test" in q:
        return "Quiz mode ready. In a direct-mapped cache, what part of the address selects the cache line? Give me the idea in one sentence; I’ll grade the concept rather than exact wording."
    if "weak" in q or "improve" in q:
        return "Your next action should target the concept with the largest gap between exam weight and retained mastery. In the demo profile, that is Cache Mapping, followed by Booth Algorithm."
    return "I can turn that into a learning action. Give me the goal and time available, and I’ll select, teach, test, update mastery, and replan the next step."


def chat(message: str, actor_id: str, session_id: str) -> tuple[str, str]:
    cloud_enabled = os.getenv("NEXORA_AWS_ENABLED", "false").lower() == "true"
    if not cloud_enabled:
        return demo_response(message), "demo"

    agent = None
    manager = None
    try:
        agent, manager = _build_cloud_agent(actor_id, session_id)
        result = agent(message)
        return str(result), "aws"
    except Exception as exc:
        return f"{demo_response(message)}\n\n[Cloud fallback active: {type(exc).__name__}]", "demo"
    finally:
        if manager is not None:
            try:
                manager.close()
            except Exception:
                pass
