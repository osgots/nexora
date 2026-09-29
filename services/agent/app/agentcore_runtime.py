"""AgentCore Runtime entry point for Nexora's Strands agent."""
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from .agent import chat

app = BedrockAgentCoreApp()


@app.entrypoint
def invoke(payload, context=None):
    prompt = str(payload.get("prompt", "Help me study"))
    actor_id = str(payload.get("actor_id", "agentcore-user"))
    session_id = str(payload.get("session_id", "agentcore-session"))
    reply, mode = chat(prompt, actor_id, session_id)
    return {"reply": reply, "mode": mode}


if __name__ == "__main__":
    app.run()
