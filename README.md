# Nexora

> **Adaptive intelligence for how you learn.**

Nexora is an agentic learning system built for the **Build, Ship, Shape: Amazon Developer Hackathon**. It converts a learner's syllabus, available time, mastery state and recent answers into the next best learning action — then updates that state and replans after every interaction.

**Live demo:** https://nexora-eta-ten.vercel.app/

Unlike a single-turn study chatbot, Nexora is designed around a closed loop:

**understand → prioritize → teach → test → remember → replan**

## Why it is different

- **Alexa+ ready:** a real self-hosted MCP server over Streamable HTTP plus a polished simulated Alexa+ web experience.
- **AWS-native agent:** Strands Agents on Amazon Bedrock, with an AgentCore Runtime entry point.
- **Persistent memory:** optional AgentCore Memory integration keeps learner/session state across conversations.
- **Tool-driven decisions:** syllabus parsing, plan generation, answer grading and mastery updates are exposed as agent tools and MCP tools.
- **Demo resilient:** deterministic local planning keeps the experience usable when AWS credentials are intentionally absent.

## Architecture

```text
Alexa+ / Web simulator
        │
        ├── Streamable HTTP MCP  ──► Nexora MCP tools
        │
        └── REST API             ──► Strands Agent
                                      │
                                      ├── Amazon Bedrock
                                      ├── AgentCore Memory
                                      └── learning tools
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the complete flow.

## Repository

```text
apps/web/                 React + TypeScript Alexa+ simulator
services/agent/           FastAPI, Strands, Bedrock, AgentCore, MCP
docs/                     Architecture, Devpost, demo and friction log
```

## Run the web experience

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The UI automatically falls back to the local deterministic demo if `VITE_API_URL` is not configured, so reviewers can explore the experience immediately.

## Run the agent API

Requires Python 3.12+.

```bash
cd services/agent
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Set `NEXORA_AWS_ENABLED=true` only after AWS credentials are configured. Without it, the API uses the deterministic demo path.

## Run the Alexa+ MCP server

```bash
cd services/agent
python -m app.mcp_server
```

The official MCP Python SDK serves Streamable HTTP at `http://localhost:8000/mcp` and negotiates compatible protocol revisions including the hackathon minimum (`2025-11-25`).

## AWS configuration

```bash
export NEXORA_AWS_ENABLED=true
export AWS_REGION=us-east-1
export NEXORA_MODEL_ID=global.anthropic.claude-sonnet-4-6
export AGENTCORE_MEMORY_ID=<your-memory-id>
```

For AgentCore deployment, `services/agent/app/agentcore_runtime.py` exposes a `BedrockAgentCoreApp` entry point. The intended production stack is:

1. Strands agent on Amazon Bedrock
2. AgentCore Runtime
3. AgentCore Memory with semantic + summarization + preference strategies
4. Web simulator on Vercel

The deployable AgentCore project is checked in under `agentcore/`. With AWS
credentials configured, validate and deploy it from the repository root:

```bash
agentcore validate
agentcore package --runtime NexoraAgent
agentcore deploy --yes
```

See [`docs/AWS_SETUP.md`](docs/AWS_SETUP.md) for the verified CLI flow and the
post-deployment memory-ID step.

## Tests

```bash
cd services/agent
pytest
```

The core study engine is deterministic and separately testable from cloud services.

## Hackathon tracks

- **Primary:** Alexa+
- **Mini challenge:** AWS Builder
- **Mini challenge:** Open Source

This repository is public and MIT licensed, and all hackathon work is captured in commit history.

## Submission assets

- [`docs/DEVPOST.md`](docs/DEVPOST.md) — submission copy
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — <3 minute demo script
- [`docs/FRICTION_LOG.md`](docs/FRICTION_LOG.md) — bonus-ready friction log template
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture
- [`docs/DEPLOYMENT_EVIDENCE.md`](docs/DEPLOYMENT_EVIDENCE.md) — verified deployment and test evidence
- [`docs/AWS_GITHUB_OIDC.md`](docs/AWS_GITHUB_OIDC.md) — keyless AgentCore deployment setup

## License

MIT
