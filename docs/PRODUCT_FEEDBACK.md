# Product Feedback — Evidence-First Draft

The hackathon requires feedback for every tool, API or SDK used. Fill this only from actual hands-on use; do not turn planned architecture into claimed experience.

## Alexa+ / MCP path

### What we used it for
Nexora exposes adaptive-learning tools through a self-hosted MCP server using Streamable HTTP, and demonstrates the conversational experience through a custom Alexa+ web simulation.

### What worked well
> Add observations after running MCP Inspector / the final server.

### What needs work
> Add observed setup errors, missing documentation, compatibility issues or required workarounds.

### Onboarding: zero to hello world
> Record the actual steps and where time was lost.

### Would we build with it again?
> Yes/No + evidence-based reason.

---

## Strands Agents SDK

### What we used it for
Agent orchestration and tool calling for syllabus parsing, adaptive planning, answer assessment and mastery updates.

### What worked well
> Fill after live Bedrock/Strands invocation.

### What needs work
> Fill from actual errors/workarounds.

### Onboarding
> Fill from actual setup.

### Would we build with it again?
> Fill after testing.

---

## Amazon Bedrock

### What we used it for
Model inference behind the cloud-enabled Nexora Strands agent.

### What worked well
> Fill after live invocation.

### What needs work
> Fill after live invocation.

### Onboarding
> Include model-access / IAM / region experience if encountered.

### Would we build with it again?
> Fill after testing.

---

## Amazon Bedrock AgentCore Runtime

### What we used it for
Production runtime target for the Nexora agent entry point.

### What worked well
> Fill after deployment/invocation.

### What needs work
> Fill after deployment/invocation.

### Onboarding
> Fill after deployment/invocation.

### Would we build with it again?
> Fill after testing.

---

## Amazon Bedrock AgentCore Memory

### What we used it for
Persistent learner context across sessions using the Strands AgentCore memory session manager.

### What worked well
> Fill after memory is provisioned and continuity is verified.

### What needs work
> Fill after testing.

### Onboarding
> Fill after testing.

### Would we build with it again?
> Fill after testing.

---

## Feedback writing rule

For each section, prefer a specific observation such as:

> “The quick-start omitted X, so setup failed with Y until we did Z.”

instead of vague praise/criticism such as:

> “Documentation was good/bad.”

Copy reproducible problems into `FRICTION_LOG.md` with task, exact steps, expected/actual result, severity, workaround, suggestion and evidence.
