# Devpost Submission Draft

## Name
**Nexora**

## Tagline
**Adaptive intelligence for how you learn.**

## Inspiration
Most AI study tools wait for a question and return an answer. Real learning is different: a student has limited time, uneven mastery, changing confidence and an exam deadline. We wanted an assistant that does not merely answer — it decides what the learner should do next, remembers the result, and changes the plan.

## What it does
Nexora is an agentic adaptive learning system for Alexa+. A learner can say or type a goal such as, “My exam is Friday and I have 90 minutes tonight.” Nexora uses the syllabus, available time and retained mastery to create a prioritized plan. It can teach a weak concept, run active-recall questions, grade responses, update mastery and automatically replan the remaining session.

The web experience simulates an Alexa+ multimodal interaction with conversational responses, adaptive cards, a live study plan and a mastery view. Nexora also exposes a real self-hosted MCP server over Streamable HTTP so the same learning tools can be invoked by an MCP-capable Alexa+ surface.

## How we built it
- React + TypeScript for the simulated Alexa+ experience
- Official MCP Python SDK for the Streamable HTTP MCP server
- Strands Agents for agent/tool orchestration
- Amazon Bedrock for model inference
- Amazon Bedrock AgentCore Memory for cross-session learner context
- AgentCore Runtime entry point for production hosting
- FastAPI for the simulator API
- deterministic learning engine for testability and demo resilience

## The agentic loop
**understand → prioritize → teach → test → remember → replan**

This loop is the key difference from a generic tutor chatbot. Every answer can change the next action.

## Challenges
The main design challenge was separating “AI conversation” from “learning state.” We did not want model prose to be the source of truth for mastery. Nexora therefore keeps scoring/planning logic in deterministic tools that the agent calls. We also designed a cloud-safe fallback so reviewers can inspect the product without private AWS credentials.

## Accomplishments
- Real MCP tool surface and simulated Alexa+ experience in one product
- AWS-native Strands/Bedrock/AgentCore path
- persistent-memory integration hook
- deterministic, independently testable study engine
- mobile-responsive multimodal dashboard
- graceful local demo mode

## What we learned
Agentic UX becomes much more convincing when the model is not asked to do everything. Explicit tools for planning, grading and mastery make decisions easier to test and explain, while AgentCore Memory gives the agent continuity across sessions.

## What's next
- document ingestion from S3
- spaced-repetition scheduling using longer-term mastery histories
- Alexa account linking and user-specific profiles
- teacher/mentor dashboards
- multilingual voice study sessions

## Tracks
**Primary:** Alexa+  
**Mini challenges:** AWS Builder, Open Source

## Product Feedback checklist
Before final submission, add specific observed feedback for every Amazon SDK/service actually used in the live cloud deployment. Do not invent feedback before deployment/testing.
