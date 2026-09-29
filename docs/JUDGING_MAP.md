# Nexora — Judging Evidence Map

This document keeps the final submission focused on observable evidence rather than claims.

## 1. Tech Implementation

**What judges should see**
- React/TypeScript Alexa+ simulated experience builds successfully in CI.
- Python agent tests and compiles in CI.
- official MCP Python SDK server using Streamable HTTP (`services/agent/app/mcp_server.py`).
- Strands tools call deterministic learning functions rather than hiding all logic in prompts.
- Bedrock model path in `services/agent/app/agent.py`.
- AgentCore Memory integration through `AgentCoreMemorySessionManager` when a memory ID is configured.
- AgentCore Runtime entry point in `services/agent/app/agentcore_runtime.py`.
- graceful demo fallback that does not expose AWS secrets.

**Final evidence still required**
- one live Bedrock/Strands invocation from the owner's AWS account.
- one live AgentCore Memory continuity demo.
- MCP Inspector screenshot/tool call against the running server.

## 2. Design

**What judges should see**
- one coherent command-center experience instead of separate disconnected demos.
- conversational interaction plus visual cards, live mastery, next-best action and an adaptive plan.
- voice input where supported by the browser.
- mobile-responsive layout.
- visible orchestration trace so the user can understand why the system changed state.

**Best demo moment**
1. ask Nexora to quiz the weakest topic;
2. answer the active-recall question;
3. show mastery change;
4. show readiness/plan re-rank without reloading the page.

## 3. Potential Impact

**Specific customer need**
Students often have more material than time and do not know what to study next. Nexora turns limited study time into an adaptive sequence based on retained mastery rather than generating another generic answer.

**Credible expansion path**
- more subjects through generic topic/mastery tools;
- longer-term spaced repetition;
- multilingual conversational sessions;
- educator/mentor dashboards;
- document ingestion and user-specific profiles.

Avoid fabricated user counts, learning gains, accuracy, ROI or deployment claims. Only add measured results if we actually run a study/test.

## 4. Quality of the Idea

The core creative move is the closed learning loop:

`understand → prioritize → teach → test → remember → replan`

Nexora is deliberately not a single-turn Q&A bot. The model orchestrates explicit tools and state transitions, while deterministic functions make planning and mastery changes inspectable and testable.

## Mini Challenge — AWS Builder

Evidence:
- Amazon Bedrock model inference path
- Strands agent/tool orchestration
- AgentCore Memory integration hook
- AgentCore Runtime entry point
- `docs/AWS_SETUP.md`

Do not claim AWS Builder runtime integration as complete until the live AWS test is captured.

## Mini Challenge — Open Source

Additional contribution: **Adaptive Learning MCP**.

- contribution PR: https://github.com/osgots/nexora/pull/1
- contribution branch: https://github.com/osgots/nexora/tree/open-source/adaptive-learning-mcp
- GitHub username: `osgots`
- 7 changed files / standalone package with tests and Streamable HTTP MCP server

The contribution turns deterministic learning-state operations into reusable MCP tools for other agent developers.
