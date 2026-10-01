# Nexora — Deployment Evidence

This file separates completed verification from evidence that must come from the authenticated cloud deployments. It is intended to make the final Devpost entry accurate and reproducible.

## Verified locally

- [x] frontend production build: `npm run build`
- [x] Python agent and MCP tests: `7 passed`
- [x] AgentCore runtime import smoke test
- [x] executable `runtime.py` starts successfully, `/ping` returns 200, and `/invocations` returns a valid demo response (October 1)
- [x] FastAPI `/health`, `/api/chat`, and `/api/plan` responses
- [x] AgentCore project schema: `agentcore validate`
- [x] CDK infrastructure TypeScript build: `npm run build` in `agentcore/cdk` (October 1)
- [x] Python 3.13 ARM64 CodeZip package: `agentcore package --runtime NexoraAgent`
- [x] deterministic demo fallback when private AWS credentials are unavailable

## Frontend deployment

- Public URL: https://nexora-eta-ten.vercel.app/
- Initial deployment commit: `c84396262b09ab80969dbbb04241e813c38ef0c3`
- Desktop verification: **passed in the live Vercel deployment**
- Mobile verification: **pending**
- Browser console check: **passed; no application-origin warnings or errors**
- Adaptive-loop verification: **passed**
  - generated a quiz for the lowest-mastery topic
  - graded a concept-complete answer at 100%
  - moved Booth algorithm mastery from 52% to 63%
  - moved readiness from 68% to 71%
  - rebuilt the plan with Cache mapping as the next action

## AWS deployment

October 1 checkpoint: AWS Console still returns "Site Unavailable" in the cloud browser. No live AWS deployment or model invocation is claimed. Before deployment, authorize the dedicated GitHub OIDC role and set `AWS_DEPLOY_ENABLED=true` after confirming usage costs or credits. The workflow now derives its target account from the authenticated identity. CDK stack source is included in Git and OIDC trust is restricted to the `aws-agentcore` environment.

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
