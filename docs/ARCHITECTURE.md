# Nexora Architecture

## Product loop

Nexora treats studying as a continuously optimized control loop rather than a chat session:

1. **Observe** — goal, syllabus, time budget, recent answers and retained mastery.
2. **Prioritize** — estimate which concept has the highest expected learning gain.
3. **Act** — teach, quiz, generate a worked example or create a micro-plan.
4. **Measure** — grade the response and update mastery.
5. **Remember** — persist useful session/user context.
6. **Replan** — select the next action using the new state.

## Runtime

```text
┌───────────────────────────────────────────────┐
│ Alexa+ simulated experience (React/Vite)      │
│ voice input · cards · plan · mastery · memory │
└────────────────┬──────────────────────────────┘
                 │ REST during simulator demo
                 ▼
┌───────────────────────────────────────────────┐
│ Nexora Agent API (FastAPI)                    │
│ resilience fallback + session identifiers     │
└────────────────┬──────────────────────────────┘
                 ▼
┌───────────────────────────────────────────────┐
│ Strands Agent                                 │
│ System policy + tool orchestration            │
└───────┬────────────────┬──────────────────────┘
        │                │
        ▼                ▼
 Amazon Bedrock     AgentCore Memory
 model inference    cross-session state
        │
        ▼
 deterministic learning tools

Alexa+ can also connect directly to:

┌───────────────────────────────────────────────┐
│ Nexora MCP Server                             │
│ Official MCP Python SDK · Streamable HTTP     │
│ parse_syllabus · create_study_plan            │
│ grade_answer · update_learner_mastery         │
└───────────────────────────────────────────────┘
```

## MCP compatibility

Nexora uses the official MCP Python SDK v2 and its Streamable HTTP transport. That SDK supports both the `2025-11-25` revision required by the hackathon and the newer `2026-07-28` revision.

## AWS Builder surface

Nexora intentionally uses multiple AWS primitives for different responsibilities rather than naming them decoratively:

- **Amazon Bedrock:** model inference used by the Strands agent.
- **Strands Agents:** agent orchestration and tool calling.
- **AgentCore Memory:** session/user memory via `AgentCoreMemorySessionManager` when a memory ID is configured.
- **AgentCore Runtime:** deployable `BedrockAgentCoreApp` entry point in `agentcore_runtime.py`.

## Reliability

`NEXORA_AWS_ENABLED=false` is the safe default. This prevents accidental AWS calls during cloning or judging. When cloud mode is enabled, Nexora attempts the full AWS path. If that path is temporarily unavailable, the product returns a deterministic learning action rather than a blank/error-only UI.
