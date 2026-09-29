# Nexora Demo Script — target 2:35

## 0:00–0:18 — Problem
“Most AI study tools answer questions. Nexora decides what you should learn next. It remembers your progress, tests you, updates mastery, and replans — like an adaptive learning operating system for Alexa+.”

Show the dashboard and readiness engine.

## 0:18–0:45 — Goal to plan
Say/type:
> My Computer Architecture exam is Friday. I have 84 minutes tonight. Build the best plan.

Show Nexora returning a short action plan and the adaptive-plan panel.

## 0:45–1:15 — Agentic action
Use “Quiz my weak spot.”

Answer the question imperfectly. Explain that the response is graded by a tool and updates mastery rather than being treated as unstructured chat.

## 1:15–1:40 — Memory + replanning
Refresh or begin a second session after AgentCore is connected.

Say:
> Continue from where we left off.

Show that Nexora has retained the learning context and selects a new next action.

## 1:40–2:05 — Alexa+ / MCP
Briefly show the MCP endpoint/tool list or Inspector:
- parse_syllabus
- create_study_plan
- grade_answer
- update_learner_mastery

Explain that the server uses Streamable HTTP and can be consumed by an MCP-capable Alexa+ integration.

## 2:05–2:28 — AWS architecture
Show one architecture diagram and say:
“Strands orchestrates tools, Bedrock provides model intelligence, AgentCore Memory stores cross-session context, and AgentCore Runtime is the production agent host.”

## 2:28–2:35 — Close
“Nexora doesn’t just know what you’re studying. It knows what you should do next.”
