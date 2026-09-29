from app.study_engine import build_plan, extract_topics, grade_short_answer, score_priority, update_mastery


def test_extract_topics_returns_distinct_topics():
    topics = extract_topics("Memory hierarchy; Cache mapping; Booth algorithm; Cache mapping")
    assert topics[:3] == ["Memory hierarchy", "Cache mapping", "Booth algorithm"]


def test_lower_mastery_is_higher_priority():
    assert score_priority(40) > score_priority(80)


def test_plan_is_priority_sorted():
    plan = build_plan("Cache mapping; Booth algorithm; Memory hierarchy", 60)
    priorities = [x["priority"] for x in plan]
    assert priorities == sorted(priorities, reverse=True)


def test_mastery_moves_toward_score():
    assert update_mastery(50, 90) > 50
    assert update_mastery(80, 20) < 80


def test_grade_short_answer():
    result = grade_short_answer("The index selects a cache line and the tag verifies the block", ["index", "tag"])
    assert result["score"] == 100
