# Agent integration pattern

A model/agent does not need to own learner state. A simple orchestration loop is:

```text
1. memory.load learner state
2. adaptive-learning-mcp.rank_learning_actions(topics)
3. agent teaches or quizzes the top-ranked topic
4. adaptive-learning-mcp.grade_recall(answer, expected_concepts)
5. adaptive-learning-mcp.update_mastery(previous, score, confidence)
6. memory.store updated state
7. repeat from step 2
```

This separation gives the agent freedom to converse while keeping planning and state transitions deterministic and testable.

## Example

Input state:

```json
[
  {"name":"Cache mapping","mastery":55,"exam_weight":9,"recency_gap":7,"confidence":5},
  {"name":"Memory hierarchy","mastery":82,"exam_weight":7,"recency_gap":2,"confidence":8}
]
```

The agent first calls `rank_learning_actions`. After a recall prompt it calls `grade_recall`, then persists the result of `update_mastery`. A cloud memory layer, local database, or in-process state store can be used; the toolkit deliberately does not lock developers to one provider.
