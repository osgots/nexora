# Tool and platform feedback — October 3, 2026

| Tool | Actual use and result | Limitations / next evaluation |
|---|---|---|
| React, TypeScript, Vite | Browser learning simulation, local state, navigation and responsive layouts; production build and deterministic engine tests pass locally. | Grading needs educator review; voice recognition depends on the browser. |
| FastAPI / official MCP Python SDK | Backend API and Streamable HTTP learning-tool surface; local automated agent/MCP tests pass. | A live Alexa+ device connection has not been tested. |
| Strands Agents | Optional agent orchestration integration and runtime imports. | Live model orchestration quality and reliability remain unverified. |
| Bedrock | Model discovery and Anthropic use-case onboarding attempted. | First-time-use submission rejected with account-not-authorized message; cause unknown. No inference performance claim. |
| AgentCore Runtime | Configuration, executable entry point, schema/package validation, CDK build, local /ping and demo /invocations. | Hosted deployment and IAM invocation remain unverified. |
| AgentCore Memory | Optional session-manager code and deployment configuration. | No cloud resource continuity test yet; browser local storage is not AgentCore Memory. |

We would continue using the web and Python/MCP stack because it allows independent verification of the learning operations. We would continue evaluating Strands and AgentCore after resolving account access, but cannot yet recommend their live runtime performance based on this project.

Onboarding progressed from a runnable local web experience to Python tools and an AgentCore-compatible runtime. Local integration errors were corrected. The zero-to-live-Bedrock-response journey remains unfinished. See [FRICTION_LOG.md](FRICTION_LOG.md) for observed steps, errors, workarounds and suggestions.
