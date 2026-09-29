# Nexora — Deployment Evidence

This file separates completed verification from evidence that must come from the authenticated cloud deployments. It is intended to make the final Devpost entry accurate and reproducible.

## Verified locally

- [x] frontend production build: `npm run build`
- [x] Python agent and MCP tests: `7 passed`
- [x] AgentCore runtime import smoke test
- [x] FastAPI `/health`, `/api/chat`, and `/api/plan` responses
- [x] AgentCore project schema: `agentcore validate`
- [x] Python 3.13 ARM64 CodeZip package: `agentcore package --runtime NexoraAgent`
- [x] deterministic demo fallback when private AWS credentials are unavailable

## Frontend deployment

- Public URL: **pending authenticated Vercel deployment**
- Git commit: **pending**
- Desktop verification: **pending**
- Mobile verification: **pending**
- Browser console check: **pending**

## AWS deployment

- AWS account/region: **pending owner authentication**
- AgentCore Runtime ARN: **pending**
- AgentCore Memory ID: **pending**
- Bedrock model: `global.anthropic.claude-sonnet-4-6`
- Real Bedrock invocation: **pending**
- Same-user memory continuity test: **pending**
- CloudWatch log/trace capture: **pending**
- MCP Inspector capture: **pending**

## Evidence to capture after deployment

1. AgentCore deployment status and Runtime ARN.
2. A successful Bedrock-backed Nexora response with no credentials or secrets visible.
3. Two interactions using the same learner identity that demonstrate memory continuity.
4. The Adaptive Learning MCP tools visible in MCP Inspector.
5. Final Vercel desktop and mobile screenshots.
6. Public GitHub commit and successful Actions run.

Do not replace a pending item with a claim until the corresponding deployment or test has actually succeeded.
