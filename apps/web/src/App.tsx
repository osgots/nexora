import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { demoReply, initialCards, topics as initialTopics } from './lib/demo'
import { sendMessage } from './lib/api'
import type { MasteryTopic, Message, StudyBlock } from './types'

const uid = () => Math.random().toString(36).slice(2)
const STORE_KEY = 'nexora-demo-mastery-v1'

type Quiz = { topic: string; question: string; expected: string[] }

const quizzes: Record<string, Omit<Quiz, 'topic'>> = {
  'Cache mapping': {
    question: 'In a direct-mapped cache, what part of the address selects the cache line, and what verifies that the requested memory block is actually there?',
    expected: ['index', 'tag'],
  },
  'Booth algorithm': {
    question: 'Why does Booth multiplication inspect the current multiplier bit together with the previous bit?',
    expected: ['transition', 'add'],
  },
  'Instruction cycles': {
    question: 'Name the two core stages that happen before an instruction can execute.',
    expected: ['fetch', 'decode'],
  },
  'Memory hierarchy': {
    question: 'Why are registers and cache placed closer to the CPU than main memory?',
    expected: ['faster', 'latency'],
  },
}

function loadMastery(): MasteryTopic[] {
  try {
    const saved = localStorage.getItem(STORE_KEY)
    if (!saved) return initialTopics
    const parsed = JSON.parse(saved) as MasteryTopic[]
    return Array.isArray(parsed) && parsed.length ? parsed : initialTopics
  } catch {
    return initialTopics
  }
}

function quizFor(topic: MasteryTopic): Quiz {
  const found = quizzes[topic.name] ?? {
    question: `Explain the key idea behind ${topic.name} in one sentence.`,
    expected: topic.name.toLowerCase().split(/\s+/).slice(0, 2),
  }
  return { topic: topic.name, ...found }
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Good evening. I retained your learning state. I can rank what matters most, test it, update mastery, and rebuild the remaining plan after every answer.',
      cards: initialCards,
    },
  ])
  const [liveTopics, setLiveTopics] = useState<MasteryTopic[]>(loadMastery)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState('')
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null)
  const [trace, setTrace] = useState<string[]>(['memory.lookup', 'mastery.rank', 'plan.select'])
  const [runtimeMode, setRuntimeMode] = useState<'demo' | 'aws'>('demo')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(liveTopics))
  }, [liveTopics])

  const readiness = useMemo(
    () => Math.round(liveTopics.reduce((sum, topic) => sum + topic.mastery, 0) / liveTopics.length),
    [liveTopics],
  )

  const rankedTopics = useMemo(
    () => [...liveTopics].sort((a, b) => a.mastery - b.mastery),
    [liveTopics],
  )

  const nextTopic = rankedTopics[0]

  const adaptivePlan = useMemo<StudyBlock[]>(() => {
    const minutes = [20, 16, 12]
    const details = [
      'Repair the weakest retained concept with active recall.',
      'Use one worked example, then answer without notes.',
      'Finish with a rapid mixed recall check and re-rank.',
    ]
    return rankedTopics.slice(0, 3).map((topic, index) => ({
      time: `${minutes[index]} min`,
      title: topic.name,
      detail: details[index],
      state: index === 0 ? 'next' : 'queued',
    }))
  }, [rankedTopics])

  function appendAssistant(content: string) {
    setMessages((current) => [...current, { id: uid(), role: 'assistant', content }])
  }

  async function submit(text = input) {
    const value = text.trim()
    if (!value || busy) return

    setInput('')
    setMessages((current) => [...current, { id: uid(), role: 'user', content: value }])
    setBusy(true)

    try {
      if (activeQuiz) {
        const normalized = value.toLowerCase()
        const matched = activeQuiz.expected.filter((term) => normalized.includes(term.toLowerCase()))
        const score = Math.round((matched.length / activeQuiz.expected.length) * 100)
        const current = liveTopics.find((topic) => topic.name === activeQuiz.topic)
        const before = current?.mastery ?? 50
        const after = Math.round(before * 0.78 + score * 0.22)
        const updated = liveTopics.map((topic) =>
          topic.name === activeQuiz.topic
            ? { ...topic, mastery: after, trend: after - before }
            : topic,
        )
        const reranked = [...updated].sort((a, b) => a.mastery - b.mastery)

        setLiveTopics(updated)
        setActiveQuiz(null)
        setTrace(['grade_answer', 'mastery.update', 'memory.store', 'plan.rebuild'])
        await new Promise((resolve) => setTimeout(resolve, 360))
        appendAssistant(
          `Concept score: ${score}%. ${activeQuiz.topic} mastery moved from ${before}% to ${after}%. I stored that signal and rebuilt the plan — ${reranked[0].name} is now the highest-value next action.`,
        )
        return
      }

      if (/quiz|test|weak spot/i.test(value)) {
        const quiz = quizFor(nextTopic)
        setActiveQuiz(quiz)
        setTrace(['memory.lookup', 'mastery.rank', 'quiz.generate'])
        await new Promise((resolve) => setTimeout(resolve, 300))
        appendAssistant(`I selected ${quiz.topic} because it has the lowest retained mastery at ${nextTopic.mastery}%. ${quiz.question}`)
        return
      }

      if (/plan|exam|tonight|start/i.test(value)) {
        setTrace(['memory.lookup', 'mastery.rank', 'time.allocate', 'plan.create'])
      } else if (/weak|improve|gain/i.test(value)) {
        setTrace(['memory.lookup', 'mastery.rank', 'impact.estimate'])
      } else {
        setTrace(['intent.route', 'memory.lookup', 'action.select'])
      }

      try {
        const { reply, mode } = await sendMessage(value)
        setRuntimeMode(mode)
        setTrace((current) => [...current, mode === 'aws' ? 'bedrock.respond' : 'demo.respond'])
        appendAssistant(reply)
      } catch {
        setRuntimeMode('demo')
        await new Promise((resolve) => setTimeout(resolve, 420))
        appendAssistant(demoReply(value))
      }
    } finally {
      setBusy(false)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
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
          <div className={`status-dot ${runtimeMode}`} /> {runtimeMode === 'aws' ? 'AWS agent online' : 'Resilient demo online'}
          <small>{runtimeMode === 'aws' ? 'Bedrock × AgentCore live' : 'Cloud-ready deterministic fallback'}</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="eyebrow">ADAPTIVE LEARNING OS</span>
            <h1>Good evening, Shivam.</h1>
          </div>
          <div className="top-actions">
            <span className={`pill runtime-pill ${runtimeMode}`}>{runtimeMode === 'aws' ? 'Bedrock live' : 'Demo mode'}</span>
            <span className="pill">Exam mode</span>
            <button className="avatar" aria-label="Profile">SY</button>
          </div>
        </header>

        <section className="hero-grid">
          <article className="readiness panel">
            <div>
              <span className="eyebrow">READINESS ENGINE</span>
              <h2>{readiness}%</h2>
              <p>Projected recall strength from retained mastery. Answer a quiz and watch this state change.</p>
            </div>
            <div className="orb-wrap">
              <div className="orb"><span>{readiness}</span><small>READY</small></div>
              <div className="orbit orbit-a" /><div className="orbit orbit-b" />
            </div>
          </article>
          <article className="next panel">
            <div className="panel-head"><span className="eyebrow">NEXT BEST ACTION</span><span className="live">LIVE</span></div>
            <h3>Repair {nextTopic.name}</h3>
            <p>20 minutes • lowest retained mastery ({nextTopic.mastery}%)</p>
            <button className="primary" onClick={() => void submit('Start my highest-value study plan')}>Start adaptive session →</button>
          </article>
        </section>

        <section className="workspace-grid">
          <article className="conversation panel">
            <div className="panel-head">
              <div><span className="eyebrow">NEXORA AGENT</span><h3>Command Center</h3></div>
              <span className={`voice-wave ${listening ? 'hot' : ''}`}><i/><i/><i/><i/></span>
            </div>

            <div className="agent-trace" aria-label="Latest agent tool trace">
              <span className="trace-label">LAST ORCHESTRATION</span>
              {trace.map((step) => <span className="trace-chip" key={step}>{step}</span>)}
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
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder={activeQuiz ? 'Answer the active recall question…' : 'Ask Nexora to plan, teach, quiz or adapt…'} />
              <button className="send" type="submit" disabled={busy}>↑</button>
            </form>
          </article>

          <aside className="right-stack">
            <article className="panel plan-panel">
              <div className="panel-head"><div><span className="eyebrow">ADAPTIVE PLAN</span><h3>Tonight</h3></div><span className="pill subtle">48 min core</span></div>
              <div className="timeline">{adaptivePlan.map((item, index) => (
                <div className={`plan-item ${item.state}`} key={item.title}>
                  <div className="step">{index + 1}</div><div><b>{item.title}</b><span>{item.time} · {item.detail}</span></div>
                </div>
              ))}</div>
            </article>
            <article className="panel mastery-panel">
              <div className="panel-head"><div><span className="eyebrow">LIVE MASTERY</span><h3>Knowledge state</h3></div><span className="memory-badge">retained</span></div>
              {liveTopics.map((topic) => <div className="mastery-row" key={topic.name}>
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
