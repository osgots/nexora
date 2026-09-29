export interface ChatResponse {
  reply: string
  mode: 'aws' | 'demo'
}

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')

export async function sendMessage(message: string, actorId = 'demo-user', sessionId = 'demo-session'): Promise<ChatResponse> {
  if (!API_URL) throw new Error('No API configured')
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, actor_id: actorId, session_id: sessionId }),
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<ChatResponse>
}
