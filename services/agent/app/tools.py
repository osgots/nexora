from strands import tool
from .study_engine import build_plan, extract_topics, grade_short_answer, update_mastery


@tool
def parse_syllabus(syllabus: str) -> list[str]:
    """Extract high-value study topics from syllabus or notes text."""
    return extract_topics(syllabus)


@tool
def create_adaptive_plan(syllabus: str, available_minutes: int = 60) -> list[dict]:
    """Create a prioritized learning plan from syllabus text and available time."""
    return build_plan(syllabus, available_minutes)


@tool
def assess_short_answer(answer: str, expected_terms: list[str]) -> dict:
    """Grade a short answer against required concepts and report missing terms."""
    return grade_short_answer(answer, expected_terms)


@tool
def revise_mastery(previous_mastery: int, score_percent: int, confidence: int = 7) -> int:
    """Update a learner mastery estimate after a graded attempt."""
    return update_mastery(previous_mastery, score_percent, confidence)
