from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from .core import grade_recall as _grade_recall
from .core import rank_learning_actions as _rank_learning_actions
from .core import update_mastery as _update_mastery

mcp = FastMCP(
    "Adaptive Learning MCP",
    instructions=(
        "Deterministic learning-state tools for agents. Rank the next learning action, "
        "grade active recall, then update mastery from the observed result."
    ),
    json_response=True,
)


@mcp.tool()
def rank_learning_actions(topics: list[dict]) -> list[dict]:
    """Rank topic state by expected learning value, highest priority first."""
    return _rank_learning_actions(topics)


@mcp.tool()
def grade_recall(answer: str, expected_concepts: list[str]) -> dict:
    """Return recall score plus matched and missing concepts."""
    return _grade_recall(answer, expected_concepts)


@mcp.tool()
def update_mastery(previous: int, observed_score: int, confidence: int = 5) -> int:
    """Update a 0-100 mastery estimate after a recall attempt."""
    return _update_mastery(previous, observed_score, confidence)


def main() -> None:
    mcp.run(transport="streamable-http")


if __name__ == "__main__":
    main()
