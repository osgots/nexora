# AWS / AgentCore setup for Nexora

This is the only part of the stack that requires the project owner's AWS authentication and IAM permissions.

## Prerequisites

- AWS account with Bedrock and AgentCore permissions
- Python 3.12+ (3.13 recommended for AgentCore Runtime)
- Node.js 20+
- AWS CLI credentials configured locally

Verify identity before provisioning anything:

```bash
aws sts get-caller-identity
```

## 1. Install the current AgentCore CLI

```bash
npm install -g @aws/agentcore
agentcore --version
```

Nexora was validated with AgentCore CLI `0.30.0`. The older Python
`bedrock-agentcore-starter-toolkit` CLI is not used.

## 2. Validate the checked-in AgentCore project

The repository already contains a schema-valid CodeZip project in
`agentcore/agentcore.json` with:

- executable `services/agent/runtime.py`, which imports the Strands runtime from `app.agentcore_runtime`
- AWS IAM inbound authorization
- Claude Sonnet 4.6 through Amazon Bedrock
- semantic, summarization and user-preference memory strategies

From the repository root:

```bash
agentcore validate
agentcore package --runtime NexoraAgent
```

The first command must report `Valid`. Packaging verifies the deployable Python
artifact without creating AWS resources.

## 3. Deploy Runtime and Memory

```bash
agentcore deploy --yes
agentcore status
```

The first deployment bootstraps CDK, creates the Runtime, configures CloudWatch,
and provisions `NexoraLearningMemory`. Record the deployed memory ID, add it to
the runtime's `envVars` as `AGENTCORE_MEMORY_ID`, then deploy the updated
configuration once more:

```bash
agentcore deploy --yes
```

`NEXORA_AWS_ENABLED`, `AWS_REGION`, and `NEXORA_MODEL_ID` are already set in the
checked-in runtime configuration. The application uses
`AgentCoreMemorySessionManager` only when the deployed memory ID is present.

## 4. Test the agent

```bash
agentcore invoke "My exam is Friday and I have 90 minutes. Build the best study plan."
```

Then invoke again with the same learner/session identity and verify that
cross-session context is retained. Capture `agentcore logs` and
`agentcore traces list` as factual Devpost evidence.

## 5. MCP runtime path

Nexora also contains `app/mcp_server.py`, using the official MCP Python SDK and Streamable HTTP. For local inspection:

```bash
cd nexora/services/agent
python -m app.mcp_server
```

Connect MCP Inspector to:

```text
http://localhost:8000/mcp
```

For an AgentCore-hosted MCP runtime, use AgentCore's MCP protocol runtime flow and copy/register `app/mcp_server.py` as the runtime entry point. The final endpoint should be authenticated before public exposure.

## 6. What to capture for Devpost

After the AWS path is live, capture factual evidence for the submission:

- AgentCore Runtime ARN / console screenshot (redact account-sensitive data)
- Memory configuration showing the strategies actually deployed
- one successful Bedrock/Strands interaction
- MCP Inspector tool list and one successful tool call
- any onboarding friction or workaround in `FRICTION_LOG.md`
- exact Amazon SDK/service feedback based on what actually happened

Do not claim deployment, latency, accuracy, uptime, or memory behavior until it has been observed in the live AWS account.
