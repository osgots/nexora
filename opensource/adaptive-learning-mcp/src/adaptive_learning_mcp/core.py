from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Iterable


@dataclass(frozen=True)
class LearningSignal:
    name: str
    mastery: int
    exam_weight: int = 5
    recency_gap: int = 5
    confidence: int = 5


def _bounded(value: int, low: int, high: int) -> int:
    return max(low, min(high, int(value)))


def priority_score(signal: LearningSignal) -> int:
    """Return a stable 0-100-ish priority score for the next learning action.

    Low mastery matters most. Exam weight and time since last successful recall add
    urgency. High learner confidence slightly reduces priority when mastery is
    already strong, helping surface hidden weak areas first.
    """
    mastery = _bounded(signal.mastery, 0, 100)
    weight = _bounded(signal.exam_weight, 1, 10)
    recency = _bounded(signal.recency_gap, 0, 10)
    confidence = _bounded(signal.confidence, 1, 10)
    uncertainty = max(0, confidence - mastery // 10)
    return round((100 - mastery) * 0.62 + weight * 2.4 + recency * 1.1 + uncertainty * 0.8)


def rank_learning_actions(topics: Iterable[dict]) -> list[dict]:
    """Rank topic dictionaries by expected learning value, highest first."""
    ranked: list[dict] = []
    for raw in topics:
        signal = LearningSignal(
            name=str(raw["name"]),
            mastery=_bounded(raw.get("mastery", 50), 0, 100),
            exam_weight=_bounded(raw.get("exam_weight", 5), 1, 10),
            recency_gap=_bounded(raw.get("recency_gap", 5), 0, 10),
            confidence=_bounded(raw.get("confidence", 5), 1, 10),
        )
        ranked.append(asdict(signal) | {"priority": priority_score(signal)})
    return sorted(ranked, key=lambda item: (-item["priority"], item["name"].lower()))


def grade_recall(answer: str, expected_concepts: Iterable[str]) -> dict:
    """Grade concept presence while remaining tolerant of wording/order."""
    normalized = " ".join(answer.lower().split())
    expected = [" ".join(str(term).lower().split()) for term in expected_concepts if str(term).strip()]
    matched = [term for term in expected if term in normalized]
    missing = [term for term in expected if term not in normalized]
    score = round(100 * len(matched) / max(1, len(expected)))
    return {"score": score, "matched": matched, "missing": missing}


def update_mastery(previous: int, observed_score: int, confidence: int = 5) -> int:
    """Apply a bounded confidence-sensitive exponential mastery update."""
    previous = _bounded(previous, 0, 100)
    observed_score = _bounded(observed_score, 0, 100)
    confidence = _bounded(confidence, 1, 10)
    alpha = 0.12 + confidence * 0.018
    return round(previous * (1 - alpha) + observed_score * alpha)
