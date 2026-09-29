import { FormEvent, useMemo, useRef, useState } from 'react'
import { demoReply, initialCards, plan, topics } from './lib/demo'
import { sendMessage } from './lib/api'
import type { Message } from './types'

const uid = () => Math.random().toString(36).slice(2)

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Good evening. I kept your learning state. You have 84 focused minutes available, and Cache Mapping is currently the highest-value topic to repair. Want me to run the plan?',
      cards: initialCards,
    },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const readiness = useMemo(() => Math.round(topics.reduce((s, t) => s + t.mastery, 0) / topics.length), [])

  async function submit(text = input) {
    const value = text.trim()
    if (!value || busy) return
    setInput('')
    setMessages((m) => [...m, { id: uid(), role: 'user', content: value }])
    setBusy(true)
    try {
      const { reply } = await sendMessage(value)
      setMessages((m) => [...m, { id: uid(), role: 'assistant', content: reply }])
    } catch {
      await new Promise((r) => setTimeout(r, 420))
      setMessages((m) => [...m, { id: uid(), role: 'assistant', content: demoReply(value) }])
    } finally {
      setBusy(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void submit()
  }

  function startVoice() {
    const w = window as Window & { webkitSpeechRecognition?: new () => any; SpeechRecognition?: new () => any }
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!Recognition) {
      setToast('Voice recognition is not supported in this browser.')
      setTimeout(() => setToast(''), 2200)
      return
    }
    const recognition = new Recognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript as string
      setInput(text)
      void submit(text)
    }
    recognition.start()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">N</span><span>NEXORA</span></div>
        <nav>
          <button className="nav-item active"><span>◈</span> Command</button>
          <button className="nav-item"><span>◇</span> Learning</button>
          <button className="nav-item"><span>◎</span> Memory</button>
          <button className="nav-item"><span>▦</span> Insights</button>
        </nav>
        <div className="sidebar-foot">
          <div className="status-dot" /> Agent online
          <small>Alexa+ × Bedrock × AgentCore</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">ADAPTIVE LEARNING OS</span>
            <h1>Good evening, Shivam.</h1>
          </div>
          <div className="top-actions">
            <span className="pill">Exam mode</span>
            <button className="avatar" aria-label="Profile">SY</button>
          </div>
        </header>

        <section className="hero-grid">
          <article className="readiness panel">
            <div>
              <span className="eyebrow">READINESS ENGINE</span>
              <h2>{readiness}%</h2>
              <p>Projected recall strength based on retained mastery and recent answers.</p>
            </div>
            <div className="orb-wrap">
              <div className="orb"><span>{readiness}</span><small>READY</small></div>
              <div className="orbit orbit-a" /><div className="orbit orbit-b" />
            </div>
          </article>
          <article className="next panel">
            <div className="panel-head"><span className="eyebrow">NEXT BEST ACTION</span><span className="live">LIVE</span></div>
            <h3>Repair Cache Mapping</h3>
            <p>20 minutes • highest expected score gain</p>
            <button className="primary" onClick={() => void submit('Start my highest-value study plan')}>Start adaptive session →</button>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="conversation panel">
            <div className="panel-head">
              <div><span className="eyebrow">NEXORA AGENT</span><h3>Command Center</h3></div>
              <span className={`voice-wave ${listening ? 'hot' : ''}`}><i/><i/><i/><i/></span>
            </div>
            <div className="messages">
              {messages.map((message) => (
                <div className={`message ${message.role}`} key={message.id}>
                  <div className="message-label">{message.role === 'assistant' ? 'NEXORA' : 'YOU'}</div>
                  <div className="bubble">{message.content}</div>
                  {message.cards && <div className="cards">{message.cards.map((card) => (
                    <div className={`insight ${card.tone ?? ''}`} key={card.label}>
                      <small>{card.label}</small><strong>{card.value}</strong><span>{card.detail}</span>
                    </div>
                  ))}</div>}
                </div>
              ))}
              {busy && <div className="thinking"><span/><span/><span/> orchestrating next action</div>}
            </div>
            <div className="quick-row">
              <button onClick={() => void submit('Quiz me on my weakest topic')}>Quiz my weak spot</button>
              <button onClick={() => void submit('Build my plan for tonight')}>Plan tonight</button>
              <button onClick={() => void submit('What should I improve next?')}>Find highest gain</button>
            </div>
            <form className="composer" onSubmit={onSubmit}>
              <button type="button" className={`mic ${listening ? 'listening' : ''}`} onClick={startVoice}>●</button>
              <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Nexora to plan, teach, quiz or adapt…" />
              <button className="send" type="submit" disabled={busy}>↑</button>
            </form>
          </article>

          <aside className="right-stack">
            <article className="panel plan-panel">
              <div className="panel-head"><div><span className="eyebrow">ADAPTIVE PLAN</span><h3>Tonight</h3></div><span className="pill subtle">84 min</span></div>
              <div className="timeline">{plan.map((item, index) => (
                <div className={`plan-item ${item.state}`} key={item.title}>
                  <div className="step">{index + 1}</div><div><b>{item.title}</b><span>{item.time} · {item.detail}</span></div>
                </div>
              ))}</div>
            </article>
            <article className="panel mastery-panel">
              <div className="panel-head"><div><span className="eyebrow">LIVE MASTERY</span><h3>Knowledge state</h3></div></div>
              {topics.map((topic) => <div className="mastery-row" key={topic.name}>
                <div className="mastery-label"><span>{topic.name}</span><b>{topic.mastery}%</b></div>
                <div className="bar"><i style={{ width: `${topic.mastery}%` }} /></div>
              </div>)}
            </article>
          </aside>
        </section>
        <footer>Built for the Amazon Developer Hackathon · Nexora retains learning state, orchestrates actions, and adapts across sessions.</footer>
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
