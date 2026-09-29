"""Alexa+ compatible Nexora MCP surface.

The official MCP Python SDK v2 serves Streamable HTTP and supports both the
2025-11-25 and 2026-07-28 protocol revisions, satisfying the hackathon's
minimum MCP revision requirement.
"""
from mcp.server.fastmcp import FastMCP
from .study_engine import build_plan, extract_topics, grade_short_answer, update_mastery

mcp = FastMCP(
    "Nexora Learning MCP",
    instructions="Adaptive learning tools for planning, mastery repair, recall and replanning.",
    json_response=True,
)


@mcp.tool()
def parse_syllabus(syllabus: str) -> list[str]:
    """Extract study topics from syllabus or note text."""
    return extract_topics(syllabus)


@mcp.tool()
def create_study_plan(syllabus: str, available_minutes: int = 60) -> list[dict]:
    """Prioritize what a learner should study next."""
    return build_plan(syllabus, available_minutes)


@mcp.tool()
def grade_answer(answer: str, expected_terms: list[str]) -> dict:
    """Grade an answer against expected concepts."""
    return grade_short_answer(answer, expected_terms)


@mcp.tool()
def update_learner_mastery(previous_mastery: int, score_percent: int, confidence: int = 7) -> int:
    """Update retained mastery after a learner attempt."""
    return update_mastery(previous_mastery, score_percent, confidence)


if __name__ == "__main__":
    mcp.run(transport="streamable-http")
