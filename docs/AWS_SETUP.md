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

## 1. Install the AgentCore CLI

```bash
npm install -g @aws/agentcore
agentcore --version
```

## 2. Create an AgentCore project around the existing Nexora agent

From a workspace directory next to the repository:

```bash
agentcore create --project-name Nexora --no-agent
cd Nexora
agentcore add agent \
  --name NexoraAgent \
  --type byo \
  --code-location ../nexora/services/agent \
  --entrypoint app/agentcore_runtime.py \
  --language Python \
  --framework Strands \
  --model-provider Bedrock \
  --memory none \
  --build CodeZip
```

If the installed CLI prompts interactively for a value that has changed since this document was written, keep the same intent: BYO Python agent, Strands framework, Bedrock provider, CodeZip build.

## 3. Add AgentCore Memory

```bash
agentcore add memory \
  --name NexoraLearningMemory \
  --strategies SEMANTIC,SUMMARIZATION,USER_PREFERENCE
agentcore deploy
```

After provisioning, note the memory resource ID and expose it to the agent as:

```bash
export AGENTCORE_MEMORY_ID=<memory-id>
export AWS_REGION=us-east-1
export NEXORA_AWS_ENABLED=true
export NEXORA_MODEL_ID=global.anthropic.claude-sonnet-4-6
```

The integration code already uses `AgentCoreMemorySessionManager` when `AGENTCORE_MEMORY_ID` is present.

## 4. Test the agent

```bash
agentcore invoke "My exam is Friday and I have 90 minutes. Build the best study plan."
```

Then invoke again with the same learner/session identity and verify that cross-session context is retained.

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
