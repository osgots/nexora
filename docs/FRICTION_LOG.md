# Nexora — observed developer friction

## FL-001 — Bedrock Anthropic first-time-use request rejected

- **Observed:** October 2, 2026, AWS Console, us-east-1.
- **Task:** Enable Claude Sonnet 4.6 for Nexora's optional live model path.
- **Steps:** Open Bedrock model catalog; select Claude Sonnet 4.6; enter the playground; complete the Anthropic use-case form with the project website and educational use; submit.
- **Expected:** Acceptance or an actionable validation error identifying the missing prerequisite.
- **Actual:** “Your account is not authorized to perform this action. Please create a support case” followed by the AWS Support link.
- **Severity:** High for live inference; the learning simulation remains usable.
- **Workaround:** Keep the public web experience explicitly in deterministic simulation mode. Do not claim a live Bedrock response. Prepare an account support case; resolution is pending.
- **Suggestion:** Distinguish missing permission, account verification, billing/plan, and model-provider eligibility issues in the response, and link directly to the relevant corrective workflow.
- **Evidence:** The account owner supplied the console error during setup. No public account screenshot is included to avoid exposing account information. The cause has not been established; this log does not attribute it to IAM or the account plan.

## FL-002 — Our runtime entry point and deployment source setup

- **Observed:** October 1, 2026, AgentCore CLI 0.30.0 local setup.
- **Task:** Package and start the existing Python application using CodeZip.
- **Expected:** A runnable entry point and all required CDK sources in the repository.
- **Actual:** Our initial setup needed corrections to the executable entry point, tracked CDK sources, and deployment account target.
- **Workaround:** Add services/agent/runtime.py; include the generated CDK source directory; derive the target account from the authenticated deployment identity.
- **Result:** Local validation, packaging, CDK build, /ping, and demo /invocations checks succeeded. Hosted deployment is unverified.
- **Severity:** Medium, resolved locally.
- **Suggestion:** A combined preflight report for source inclusion, entry-point startup, target account, model prerequisites, and memory ID would shorten onboarding.
- **Evidence:** https://github.com/osgots/nexora/commit/9101f5bc447ff6c79a332ece0f10ae541bc7562a
- **Attribution:** These were our integration setup errors, not established defects in the SDK.
