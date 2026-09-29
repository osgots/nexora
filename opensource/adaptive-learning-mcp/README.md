# Adaptive Learning MCP

A small, reusable open-source MCP toolkit for developers building learning agents.

Instead of asking a language model to invent learner state inside a prompt, this package exposes deterministic tools for three operations that learning agents repeatedly need:

1. rank topics by expected learning gain,
2. grade concept-level active recall,
3. update mastery after an attempt.

It is intentionally model-agnostic. Any MCP client or agent framework can call the tools.

## Why this exists

Learning assistants often become generic chatbots because planning, grading and learner-state updates are hidden inside model prose. That makes behavior hard to test, reproduce or explain. Adaptive Learning MCP keeps those decisions in normal Python functions and exposes them through MCP.

## Install

```bash
cd opensource/adaptive-learning-mcp
pip install -e ".[dev]"
```

## Run

```bash
python -m adaptive_learning_mcp.server
```

The server uses the official MCP Python SDK and Streamable HTTP transport.

Default local MCP endpoint:

```text
http://localhost:8000/mcp
```

## Tools

### `rank_learning_actions`
Accepts topic state such as mastery, exam weight, recency gap and confidence, and returns a stable priority ordering.

### `grade_recall`
Checks a short response for required concepts and returns matched/missing concepts plus a percentage score.

### `update_mastery`
Moves the previous mastery estimate toward the observed recall score using a bounded confidence-sensitive update.

## Example input

```json
[
  {"name":"Cache mapping","mastery":58,"exam_weight":9,"recency_gap":7,"confidence":5},
  {"name":"Memory hierarchy","mastery":82,"exam_weight":7,"recency_gap":2,"confidence":8}
]
```

The first topic ranks higher because the current mastery gap and assessment signals imply greater expected learning gain.

## Testing

```bash
pytest -q
```

The deterministic core is tested without starting an LLM or cloud service.

## Open-source contribution

This package was created during the Build, Ship, Shape: Amazon Developer Hackathon as an **additional open-source contribution** alongside Nexora. It is useful independently of Nexora and demonstrates an integration pattern other learning-agent developers can reuse.

## License

MIT — covered by the repository's root `LICENSE`.
