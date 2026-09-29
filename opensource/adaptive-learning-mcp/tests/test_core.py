from adaptive_learning_mcp.core import LearningSignal, grade_recall, priority_score, rank_learning_actions, update_mastery


def test_lower_mastery_receives_higher_priority_when_other_signals_match():
    weak = LearningSignal("weak", mastery=40)
    strong = LearningSignal("strong", mastery=85)
    assert priority_score(weak) > priority_score(strong)


def test_rank_is_deterministic_and_descending():
    topics = [
        {"name": "Memory hierarchy", "mastery": 84, "exam_weight": 7},
        {"name": "Cache mapping", "mastery": 52, "exam_weight": 9},
        {"name": "Booth algorithm", "mastery": 61, "exam_weight": 8},
    ]
    first = rank_learning_actions(topics)
    second = rank_learning_actions(topics)
    assert first == second
    assert first[0]["name"] == "Cache mapping"
    assert [item["priority"] for item in first] == sorted((item["priority"] for item in first), reverse=True)


def test_grade_recall_reports_missing_concepts():
    result = grade_recall("The index selects the line", ["index", "tag"])
    assert result["score"] == 50
    assert result["matched"] == ["index"]
    assert result["missing"] == ["tag"]


def test_mastery_moves_toward_observed_score():
    assert update_mastery(50, 90, confidence=7) > 50
    assert update_mastery(80, 20, confidence=7) < 80


def test_mastery_is_bounded():
    assert 0 <= update_mastery(-100, 300) <= 100
