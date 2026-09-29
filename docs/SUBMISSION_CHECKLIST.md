# Nexora — Submission Checklist

Official deadline: **October 23, 2026 at 12:00 PM PDT**. Target Nexora final submission: **October 22** to keep recovery time.

## Already complete

- [x] public GitHub project repository
- [x] MIT license
- [x] setup/run instructions
- [x] Alexa+ simulated experience code
- [x] self-hosted Streamable HTTP MCP server implementation
- [x] Strands/Bedrock agent path
- [x] AgentCore Memory integration code
- [x] AgentCore Runtime entry point
- [x] AgentCore CLI project configuration
- [x] AgentCore Runtime CodeZip validates and packages locally
- [x] deterministic fallback and tests
- [x] responsive product UI
- [x] adaptive quiz → mastery update → plan rebuild in simulator
- [x] CI for web + agent
- [x] Devpost story draft
- [x] demo script draft under 3 minutes
- [x] friction-log template
- [x] additional Open Source contribution branch + PR

## Owner-authenticated AWS work

- [ ] request the hackathon AWS promotional credit before **Oct 21, 12 PM PT** if not already requested
- [ ] authenticate AWS CLI / console
- [ ] verify Bedrock model access in the selected region
- [ ] deploy or invoke Nexora through AgentCore Runtime
- [ ] provision AgentCore Memory and set `AGENTCORE_MEMORY_ID`
- [ ] run a real conversation through Bedrock + Strands
- [ ] prove memory continuity with the same user/session identity
- [ ] run the MCP server and capture MCP Inspector evidence
- [ ] record real setup friction in `FRICTION_LOG.md`
- [ ] replace pending fields in `DEPLOYMENT_EVIDENCE.md` with reproducible evidence

## Optional hosting

Hosting is useful for judges and the demo, but the Alexa+ FAQ says a locally runnable public repo plus the video is sufficient. If hosting:

- [ ] connect/import `osgots/nexora` in Vercel
- [ ] deploy the frontend (`npm run build`, output `apps/web/dist`)
- [ ] if a hosted API is used, set `VITE_API_URL`
- [ ] set CORS only for the final frontend origin
- [ ] verify desktop and mobile layouts

## Demo video

- [ ] public YouTube or Vimeo
- [ ] English
- [ ] under 3 minutes
- [ ] show the product actually functioning
- [ ] lead with adaptive behavior, not slides
- [ ] show quiz answer changing mastery and next action
- [ ] show the MCP tool surface
- [ ] show the real AWS path after it is verified
- [ ] include no unlicensed copyrighted music/footage

## Devpost fields

- [ ] Name: **Nexora**
- [ ] Tagline: **Adaptive intelligence for how you learn.**
- [ ] Primary Track: **Alexa+**
- [ ] Mini Challenge: **AWS Builder**
- [ ] Mini Challenge: **Open Source**
- [ ] repository URL
- [ ] demo video URL
- [ ] complete project story from `DEVPOST.md`
- [ ] Product Feedback for every Amazon tool/API/SDK actually used
- [ ] AWS services used + how they are integrated
- [ ] Open Source contribution URL: `https://github.com/osgots/nexora/pull/1`
- [ ] Open Source project repo URL: `https://github.com/osgots/nexora`
- [ ] GitHub username: `osgots`
- [ ] Open Source explanation: what changed, how it works, why it matters
- [ ] friction-log entries with evidence
- [ ] optional feature requests based on real development experience

## Final integrity pass

- [ ] no invented users, metrics, accuracy, uptime, ROI or production integrations
- [ ] all screenshots match the final build
- [ ] all README commands work from a fresh clone
- [ ] latest GitHub Actions run is green
- [ ] no secrets, AWS keys or private tokens committed
- [ ] public repo and contribution links work in a logged-out browser
- [ ] submit once early, then edit before deadline if necessary
