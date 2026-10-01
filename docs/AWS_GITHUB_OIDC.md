# Secure AWS deployment through GitHub OIDC

Nexora deploys from GitHub Actions with short-lived AWS credentials. Do not add AWS access keys to the repository, Actions secrets, chat, or screenshots.

## One-time owner setup

Sign in to the AWS account that will own the hackathon resources, then create a dedicated GitHub Actions role.

### 1. Add GitHub as an OIDC provider

In **IAM → Identity providers → Add provider**:

- Provider type: `OpenID Connect`
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

Skip this step if the provider already exists in the account.

### 2. Create the deployment role

Create a role for **Web identity**, select the GitHub provider, and use this trust policy after replacing `<AWS_ACCOUNT_ID>` with the target AWS account ID:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:osgots/nexora:environment:aws-agentcore"
        }
      }
    }
  ]
}
```

Recommended role name: `NexoraAgentCoreGitHubDeploy`.

Create the GitHub environment `aws-agentcore` and restrict its deployment branches to `main`. Configure a required reviewer where available. The trust policy allows only this named environment; it does not trust every branch or pull request in the repository.

The role must be able to deploy the generated CDK stack and create its AgentCore Runtime, AgentCore Memory, runtime IAM role, asset bucket/repository, and logging resources. Keep it dedicated to this repository and account. After the first deployment, use CloudTrail/CDK output to reduce its permissions to the exact resources Nexora created.

### 3. Add the non-secret role ARN to GitHub

In `osgots/nexora` open **Settings → Secrets and variables → Actions → Variables**, then create:

- Name: `AWS_ROLE_ARN`
- Value: the role ARN, for example `arn:aws:iam::123456789012:role/NexoraAgentCoreGitHubDeploy`

The ARN is an identifier, not a credential. Never add an access key or secret access key.

After the owner approves AWS permissions and expected usage charges or credits, create the repository variable `AWS_DEPLOY_ENABLED` with value `true`. Until then, cloud deployment jobs are skipped. The workflow also restricts execution to `main`.

## Deployment

Run **Actions → Deploy Nexora to AgentCore → Run workflow** on `main`. Once enabled, changes under `agentcore/`, `services/agent/`, or the workflow also trigger deployment. The workflow:

1. exchanges GitHub's OIDC token for temporary AWS credentials;
2. derives the account target from the authenticated identity, then validates and packages the Python 3.13 ARM64 Runtime;
3. deploys the AgentCore Runtime and Memory in `us-east-1`;
4. uploads deployment/status JSON as a workflow artifact. This is a public repository; never put credentials or private learner data in those outputs.

After the first successful run, retrieve the Memory ID from the artifact, add `AGENTCORE_MEMORY_ID` to the Runtime environment configuration, and redeploy. Then use `agentcore invoke` twice with the same learner identity to capture memory-continuity evidence.
