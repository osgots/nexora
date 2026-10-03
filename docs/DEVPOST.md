# Nexora — submission copy

## Inspiration
Students often know which exam is coming but struggle to decide what to study next. Nexora turns that uncertainty into a visible loop: choose a weak topic, learn the concept, practise it, inspect feedback, retain the result, and adapt the next action.

## What it does
Nexora is a simulated Alexa+ web experience for Computer Architecture study. Four working sections connect the loop:

- **Command:** typed study commands, targeted recall questions, feedback, and an adaptive plan.
- **Learning:** four focused lessons with explanations and worked ideas.
- **Memory:** the latest 100 local attempts, scores, mastery changes, JSON export, and a confirmed demo reset.
- **Insights:** topic changes against the sample baseline and an explanation of the scoring and ranking rules.

Choose a study budget between 15 and 180 minutes or type “Plan 60 minutes.” Complete the weakest-topic quiz to update mastery and reorder the plan. A correct Booth answer moves its demo score from 52% to 63%, changing the next priority to Cache mapping. Reload the same browser to see retained progress.

Starting scores are illustrative. Grading checks keyword groups, can miss paraphrases or accept incorrect sentences containing the right terms, and is not a validated assessment of ability or exam readiness. Voice input fills the composer for review where supported. The demo does not require an AWS account or paid model access.

## How we built it
React, TypeScript, and Vite power the frontend on Vercel. A deterministic TypeScript learning engine owns the browser demonstration. Python/FastAPI and the official MCP Python SDK provide separate backend and Streamable HTTP MCP surfaces. The standalone Adaptive Learning MCP package exposes reusable learning operations with independent tests.

Optional Strands, Bedrock, AgentCore Runtime, and AgentCore Memory integration paths are in the repository. They are not deployed-cloud claims: the live web demo uses local state, and live inference and cloud memory continuity remain unverified. The Anthropic first-time-use request was rejected by AWS account authorization; that observed friction is documented separately.

## Challenges
Keeping scores, conversation, history, and plans consistent mattered more than adding more dashboard statistics. We replaced static metrics and inactive navigation, added validated local storage and inspectable history, and made time allocation follow the actual selected budget. Cloud onboarding remained blocked, so the explicitly labelled simulation keeps the product reviewable.

## Accomplishments
A deployed interactive learn–quiz–feedback–replan loop; functional Learning, Memory, and Insights views; local persistence and export; transparent grading; a reusable open-source MCP toolkit; automated tests for state validation, time allocation, and state transitions; and locally validated AgentCore runtime packaging.

## What we learned
Learning state should be explicit and independently testable. Showing the reasoning behind a changed priority is more useful than a confidence score with no explanation. A deterministic simulation makes the workflow inspectable while the cloud path is being verified.

## What's next
Educator-reviewed assessment, broader course material, spaced repetition, account-linked persistence, and verified cloud model/runtime/memory integration. This is a web simulation, not a published Alexa skill or a live Alexa+ device integration.

## Built with
React, TypeScript, Vite, Python, FastAPI, MCP, Vercel. Optional cloud integration code: Strands Agents, Amazon Bedrock, Amazon Bedrock AgentCore.

## Links and tracks
- Demo: https://nexora-eta-ten.vercel.app/
- Code: https://github.com/osgots/nexora
- Primary: Alexa+ simulation
- Open Source mini challenge: https://github.com/osgots/nexora/pull/1
- Additional toolkit: opensource/adaptive-learning-mcp; GitHub username osgots
- AWS Builder: not entered in the current draft; live cloud integration remains unverified.
