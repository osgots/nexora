"""Deterministic learning engine used by both Strands tools and demo fallback.

Keeping core planning logic deterministic makes Nexora testable and ensures the
judge demo remains useful even if cloud credentials are unavailable.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, asdict


STOP_WORDS = {
    "and", "the", "with", "from", "using", "into", "for", "of", "to", "a",
    "an", "or", "introduction", "overview", "concepts", "basics", "unit",
}


@dataclass(frozen=True)
class Topic:
    name: str
    priority: int
    mastery: int


def extract_topics(syllabus: str, limit: int = 10) -> list[str]:
    """Extract concise topic candidates from syllabus-like text."""
    chunks = re.split(r"[\n,;:•]+", syllabus)
    cleaned: list[str] = []
    for chunk in chunks:
        words = [w for w in re.findall(r"[A-Za-z][A-Za-z+\-]*", chunk) if w.lower() not in STOP_WORDS]
        phrase = " ".join(words).strip()
        if 2 <= len(phrase) <= 55 and phrase.lower() not in {x.lower() for x in cleaned}:
            cleaned.append(phrase)
        if len(cleaned) >= limit:
            break
    return cleaned or ["Core concepts", "Applied practice", "Rapid recall"]


def score_priority(mastery: int, exam_weight: int = 7, recency_gap: int = 5) -> int:
    """0-100 priority score: lower mastery + higher weight/recency => higher priority."""
    mastery = max(0, min(100, mastery))
    exam_weight = max(1, min(10, exam_weight))
    recency_gap = max(0, min(10, recency_gap))
    return round((100 - mastery) * 0.62 + exam_weight * 2.6 + recency_gap * 1.2)


def build_plan(syllabus: str, available_minutes: int = 60) -> list[dict]:
    topics = extract_topics(syllabus, 6)
    minutes = max(15, min(720, available_minutes))
    base = max(10, minutes // max(1, len(topics)))
    result = []
    for i, topic in enumerate(topics):
        mastery = max(35, 82 - i * 7)
        priority = score_priority(mastery, exam_weight=max(5, 9 - i // 2), recency_gap=min(10, i + 3))
        result.append(asdict(Topic(topic, priority, mastery)) | {"minutes": base})
    result.sort(key=lambda x: x["priority"], reverse=True)
    return result


def update_mastery(previous: int, score_percent: int, confidence: int = 7) -> int:
    previous = max(0, min(100, previous))
    score_percent = max(0, min(100, score_percent))
    confidence = max(1, min(10, confidence))
    alpha = 0.12 + confidence * 0.018
    return round(previous * (1 - alpha) + score_percent * alpha)


def grade_short_answer(answer: str, expected_terms: list[str]) -> dict:
    normalized = answer.lower()
    terms = [term.lower().strip() for term in expected_terms if term.strip()]
    matched = [term for term in terms if term in normalized]
    score = round(100 * len(matched) / max(1, len(terms)))
    return {"score": score, "matched": matched, "missing": [t for t in terms if t not in matched]}
