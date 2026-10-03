export interface ChatResponse { reply: string; mode: 'aws' | 'demo' }
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
export async function sendMessage(message: string, actorId: string, sessionId: string): Promise<ChatResponse> {
  if (!API_URL) throw new Error('No API configured')
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  try {
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, actor_id: actorId, session_id: sessionId }), signal: controller.signal,
    })
    if (!res.ok) throw new Error(`API ${res.status}`)
    const value: unknown = await res.json()
    if (!value || typeof value !== 'object' || !('reply' in value) || typeof value.reply !== 'string' || !('mode' in value) || !['aws', 'demo'].includes(String(value.mode))) throw new Error('Invalid API response')
    return value as ChatResponse
  } finally { clearTimeout(timeout) }
}
