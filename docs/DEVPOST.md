# Devpost Submission Draft

## Name
**Nexora**

## Tagline
**Adaptive intelligence for how you learn.**

## Inspiration
Most AI study tools wait for a question and return an answer. Real learning is different: a student has limited time, uneven mastery, changing confidence and an exam deadline. We wanted an assistant that does not merely answer — it decides what the learner should do next, remembers the result, and changes the plan.

## What it does
Nexora is an agentic adaptive learning system designed for Alexa+. A learner can say or type a goal such as, “My exam is Friday and I have 90 minutes tonight.” Nexora uses available time and retained mastery to prioritize the next learning action. It can run active-recall questions, grade concept coverage, update mastery and automatically re-rank the remaining study plan.

The web product is explicitly a **simulated Alexa+ multimodal experience** with conversational responses, adaptive cards, a live study plan, a mastery view and browser voice input where supported. A quiz answer visibly changes the learner state and can change the next recommended action. Nexora also includes a self-hosted MCP server over Streamable HTTP so the same learning operations can be exposed as MCP tools.

## How we built it
- React + TypeScript for the simulated Alexa+ experience
- official MCP Python SDK for the Streamable HTTP MCP server
- Strands Agents for agent/tool orchestration
- Amazon Bedrock model path for cloud inference
- Amazon Bedrock AgentCore Memory integration using the Strands session manager when a memory resource ID is configured
- AgentCore Runtime entry point for cloud deployment
- FastAPI for the simulator API
- deterministic learning engine for testability and demo resilience
- GitHub Actions for production web builds, agent tests and runtime import smoke tests

## The agentic loop
**understand → prioritize → teach → test → remember → replan**

This loop is the key difference from a generic tutor chatbot. Every answer can change the next action. The simulator also exposes its latest orchestration trace so the state transition is visible rather than hidden behind model prose.

## Challenges
The main design challenge was separating “AI conversation” from “learning state.” We did not want model prose to be the source of truth for mastery. Nexora therefore keeps scoring/planning logic in deterministic tools that the agent can call. We also designed a cloud-safe fallback so reviewers can inspect the product without private AWS credentials.

A second challenge was keeping claims reproducible. The repository separates code-complete integrations from live-cloud evidence: Bedrock and AgentCore paths are implemented, while the submission checklist explicitly requires a real AWS invocation and memory-continuity capture before we describe those behaviors as verified in the final entry.

## Accomplishments
- self-hosted MCP tool surface and simulated Alexa+ experience in one project
- AWS-oriented Strands/Bedrock/AgentCore architecture with explicit integration code
- persistent browser mastery in the simulator plus an AgentCore Memory integration hook for the cloud path
- deterministic, independently testable study engine
- quiz → grade → mastery update → automatic re-ranking visible in the UI
- responsive multimodal dashboard
- graceful local demo mode
- green CI for the web production build and Python agent tests

## Open Source mini-challenge
Alongside Nexora, we created and merged **Adaptive Learning MCP**, a standalone reusable toolkit for other learning-agent developers.

- **Merged contribution:** https://github.com/osgots/nexora/pull/1
- **Project repository:** https://github.com/osgots/nexora
- **GitHub username:** `osgots`
- **Package path:** `opensource/adaptive-learning-mcp`

Adaptive Learning MCP exposes deterministic topic prioritization, active-recall grading and mastery updates through a Streamable HTTP MCP server. It includes standalone package metadata, tests and a documented agent-loop integration pattern. The goal is to let other learning-agent developers keep learner-state decisions testable instead of burying them inside prompts.

## What we learned
Agentic UX becomes much more convincing when the model is not asked to do everything. Explicit tools for planning, grading and mastery updates make decisions easier to test and explain. Persistent state also changes the product from a question-answering surface into a continuing learning loop.

## What's next
- document ingestion from learner-owned files
- spaced-repetition scheduling using longer-term mastery histories
- account-linked user profiles
- educator/mentor dashboards
- multilingual voice study sessions

## Tracks
**Primary:** Alexa+  
**Mini challenges:** AWS Builder, Open Source

## Product Feedback checklist
Before final submission, replace the placeholders in `docs/PRODUCT_FEEDBACK.md` with specific observations from every Amazon SDK/service actually exercised. Copy reproducible problems into `docs/FRICTION_LOG.md`; do not invent feedback, performance numbers or deployment claims.