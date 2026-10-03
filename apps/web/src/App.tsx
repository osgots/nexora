import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { sendMessage } from './lib/api'
import { STORAGE_KEY, LESSONS, SEED_TOPICS, freshState, parseState, rankTopics, readiness, buildPlan, recordAnswer } from './lib/learning'
import type { Message } from './types'

type Page = 'Command' | 'Learning' | 'Memory' | 'Insights'
type Recognition = { lang: string; interimResults: boolean; onstart: (() => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null; onresult: ((e: { results: { transcript: string }[][] }) => void) | null; start: () => void; abort: () => void }
const uid = () => crypto.randomUUID()
const welcome = (): Message => ({ id: uid(), role: 'assistant', content: 'Welcome to your study workspace. Start with a short lesson, test your weakest topic, and watch your plan adapt. The demo begins with sample Computer Architecture scores; your completed attempts are saved only in this browser.' })
function loadState() { try { return parseState(localStorage.getItem(STORAGE_KEY), localStorage.getItem('nexora-demo-mastery-v1')) } catch { return freshState() } }
const views: { name: Page; icon: string; title: string; description: string }[] = [
  { name: 'Command', icon: '◈', title: 'Make your next study session count.', description: 'A clear next step. Practice that adapts. Progress you can inspect.' },
  { name: 'Learning', icon: '◇', title: 'Understand. Practise. Remember.', description: 'Four focused Computer Architecture lessons, with examples and active recall.' },
  { name: 'Memory', icon: '◎', title: 'Your learning, carried forward.', description: 'Inspect the attempts behind your progress. Stored locally, under your control.' },
  { name: 'Insights', icon: '▦', title: 'See why your plan changes.', description: 'Transparent priorities and progress, calculated from your practice.' },
]
export default function App() {
  const [state, setState] = useState(loadState)
  const [page, setPage] = useState<Page>('Command')
  const [messages, setMessages] = useState<Message[]>([welcome()])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  const [toast, setToast] = useState('')
  const [storageOk, setStorageOk] = useState(true)
  const [confirmReset, setConfirmReset] = useState(false)
  const [trace, setTrace] = useState(['state.load', 'topics.rank', 'plan.allocate'])
  const [runtime, setRuntime] = useState<'demo' | 'aws'>('demo')
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<Recognition | null>(null)
  const requestBusy = useRef(false)
  const sessionId = useRef(uid())
  const summary = views.find(v => v.name === page)!
  const ranked = useMemo(() => rankTopics(state.topics), [state.topics])
  const score = useMemo(() => readiness(state.topics), [state.topics])
  const plan = useMemo(() => buildPlan(state.topics, state.minutes), [state.topics, state.minutes])
  const next = ranked[0]
  const average = state.attempts.length ? Math.round(state.attempts.reduce((sum, a) => sum + a.score, 0) / state.attempts.length) : null

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); setStorageOk(true) } catch { setStorageOk(false) } }, [state])
  useEffect(() => { const el = messagesRef.current; if (el) el.scrollTop = el.scrollHeight }, [messages, busy, page])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 4500); return () => clearTimeout(t) }, [toast])
  useEffect(() => () => recognitionRef.current?.abort(), [])

  function say(content: string) { setMessages(current => [...current.slice(-59), { id: uid(), role: 'assistant', content }]) }
  function startQuiz(topic = next.name) {
    if (requestBusy.current || activeQuiz) return
    setPage('Command'); setActiveQuiz(topic)
    setRuntime('demo'); setTrace(['topics.rank', 'quiz.select'])
    say(`Practice: ${topic}\n${LESSONS[topic].question}\nAnswer in your own words. The demo checks key terms; it does not assess full semantic correctness.`)
    requestAnimationFrame(() => inputRef.current?.focus())
  }
  function explain(topic: string) {
    if (requestBusy.current || activeQuiz) return
    setPage('Command'); setRuntime('demo'); setTrace(['lesson.select', 'example.show'])
    say(`${topic}\n${LESSONS[topic].summary}\n\nExample: ${LESSONS[topic].example}`)
  }
  function describePlan(minutes = state.minutes) {
    setRuntime('demo'); setTrace(['state.read', 'topics.rank', 'time.allocate'])
    say(`Your ${minutes}-minute plan:\n${buildPlan(state.topics, minutes).map((p, i) => `${i + 1}. ${p.topic} — ${p.minutes} min. ${p.detail}`).join('\n')}\n\n${next.name} comes first because its current demo mastery is lowest (${next.mastery}%). Your next answer may change this order.`)
  }
  async function submit(event?: FormEvent, text = input) {
    event?.preventDefault()
    const value = text.trim()
    if (!value || requestBusy.current) return
    setInput(''); setMessages(current => [...current.slice(-59), { id: uid(), role: 'user', content: value }])
    if (activeQuiz) {
      const update = recordAnswer(state, activeQuiz, value, uid(), new Date().toISOString())
      setState(update.state); setActiveQuiz(null); setRuntime('demo')
      setTrace(['answer.check', 'mastery.update', 'state.save', 'plan.rebuild'])
      say(`Key-term coverage: ${update.result.score}%. ${activeQuiz} mastery: ${update.attempt.before}% → ${update.attempt.after}%.\n${update.result.matched.length ? `Recognized: ${update.result.matched.join('; ')}.` : 'No target concepts were recognized.'}${update.result.missing.length ? `\nReview: ${update.result.missing.join('; ')}.` : ''}\n\nModel answer: ${update.result.answer}\n\nNext priority: ${rankTopics(update.state.topics)[0].name}. This keyword-based practice signal is illustrative, not an exam prediction.`)
      return
    }
    if (/\b(quiz|test)\b/i.test(value)) { startQuiz(); return }
    const topic = state.topics.find(t => value.toLowerCase().includes(t.name.toLowerCase()) || (t.name === 'Booth algorithm' && /booth/i.test(value)) || (t.name === 'Cache mapping' && /cache/i.test(value)))
    if (/\b(explain|teach|learn)\b/i.test(value)) { explain(topic?.name ?? next.name); return }
    if (/\b(plan|minutes?|mins?|tonight|start)\b/i.test(value)) {
      const requested = value.match(/\b(\d+)\s*(?:minutes?|mins?)\b/i)
      const minutes = requested ? Math.max(15, Math.min(180, Number(requested[1]))) : state.minutes
      setState(current => ({ ...current, minutes })); describePlan(minutes); return
    }
    if (/\b(weak|improve|next|continue|progress)\b/i.test(value)) {
      setTrace(['state.read', 'topics.rank']); setRuntime('demo')
      say(`Your next priority is ${next.name} at ${next.mastery}% demo mastery. ${state.attempts.length} completed attempt(s) are retained here. Choose “Learn the concept” or “Quiz my weak spot” to continue.`); return
    }
    requestBusy.current = true; setBusy(true)
    try {
      const response = await sendMessage(value, `browser-${sessionId.current}`, sessionId.current)
      setRuntime(response.mode); setTrace([response.mode === 'aws' ? 'cloud.respond' : 'demo.respond']); say(response.reply)
    } catch {
      setRuntime('demo'); setTrace(['demo.help'])
      say('This is a focused learning simulation, not an open-ended AI chat. Try “Explain cache mapping”, “Plan 60 minutes”, or “Quiz me”. Learning has all four lessons; Memory shows your saved attempts. Live AWS inference is not connected to this demo.')
    } finally { requestBusy.current = false; setBusy(false); inputRef.current?.focus() }
  }
  function startVoice() {
    if (busy) return
    if (listening) { recognitionRef.current?.abort(); return }
    const w = window as Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
    const Constructor = w.SpeechRecognition ?? w.webkitSpeechRecognition
    if (!Constructor) { setToast('Voice input is unavailable here. You can type the same commands.'); return }
    const recognition = new Constructor(); recognitionRef.current = recognition
    recognition.lang = 'en-IN'; recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => { setListening(false); setToast('Voice input could not start. Check microphone permission or type instead.') }
    recognition.onresult = event => setInput(event.results[0][0].transcript)
    try { recognition.start() } catch { setListening(false); setToast('Voice input is unavailable. Please type your message.') }
  }
  function exportProgress() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = 'nexora-progress.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); setToast('Progress export requested. If downloads are blocked, allow them in your browser.')
  }
  function reset() {
    if (busy) return
    setState(freshState()); setMessages([welcome()]); setActiveQuiz(null); setInput(''); setConfirmReset(false); setPage('Command'); setRuntime('demo'); setTrace(['demo.reset', 'topics.rank', 'plan.allocate']); setToast('Fresh demo restored. Your next priority is Booth algorithm.')
  }
  const planPanel = <article className="panel plan-panel"><div className="panel-head"><div><span className="eyebrow">ADAPTIVE PLAN</span><h3>Your next session</h3></div><span className="pill subtle">{state.minutes} min</span></div><label className="budget">Study time<select aria-label="Study time" value={state.minutes} onChange={e => setState(s => ({ ...s, minutes: Number(e.target.value) }))}>{[...new Set([15, 30, 48, 60, 90, 120, 180, state.minutes])].sort((a, b) => a - b).map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label><div className="timeline">{plan.map((p, i) => <div className={`plan-item ${i === 0 ? 'next' : ''}`} key={p.topic}><div className="step">{i + 1}</div><div><b>{p.topic}</b><span>{p.minutes} min · {p.detail}</span></div></div>)}</div></article>
  const masteryPanel = <article className="panel mastery-panel"><span className="eyebrow">DEMO MASTERY</span><h3>Knowledge state</h3>{state.topics.map(t => <div className="mastery-row" key={t.name}><div className="mastery-label"><span>{t.name}</span><b>{t.mastery}%</b></div><div className="bar" role="meter" aria-label={`${t.name} demo mastery`} aria-valuenow={t.mastery} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${t.mastery}%` }} /></div></div>)}<p className="fine-print">Sample starting scores, updated by keyword coverage. Not a validated measure of ability.</p></article>
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">N</span><span>NEXORA</span></div><nav aria-label="Main navigation">{views.map(v => <button key={v.name} className={`nav-item ${page === v.name ? 'active' : ''}`} aria-current={page === v.name ? 'page' : undefined} onClick={() => setPage(v.name)}><span aria-hidden="true">{v.icon}</span>{v.name}</button>)}</nav><div className="sidebar-foot"><div className="status-dot demo"/>Learning simulation<small>{storageOk ? 'Progress stored in this browser' : 'Session only · storage unavailable'}</small></div></aside>
    <main id="main-content"><header className="topbar"><div><span className="eyebrow">NEXORA / {page.toUpperCase()}</span><h1>{summary.title}</h1><p className="subtitle">{summary.description}</p></div><span className="pill runtime-pill demo">Alexa+ simulation</span></header>
    <div className="demo-notice"><span className="status-dot demo"/><span>Working demo · Computer Architecture · Local learning state{runtime === 'aws' ? ' · Last chat response from AWS' : ' · No live AWS connection'}</span><a href="https://github.com/osgots/nexora" target="_blank" rel="noreferrer">Source ↗</a></div>
    {!storageOk && <p role="status" className="notice">Browser storage is unavailable. Progress works for this session; export it before leaving.</p>}
    {page === 'Command' && <>
      <section className="hero-grid"><article className="readiness panel"><div><span className="eyebrow">PRACTICE SNAPSHOT</span><h2>{score}%</h2><p>Average demo mastery across {state.topics.length} topics. Complete a quiz to update your next step.</p><span className="pill subtle">{state.attempts.length} recorded attempt{state.attempts.length === 1 ? '' : 's'}</span></div><div className="orb-wrap" aria-hidden="true"><div className="orb"><span>{score}</span><small>DEMO</small></div><div className="orbit orbit-a"/><div className="orbit orbit-b"/></div></article><article className="next panel"><div className="panel-head"><span className="eyebrow">NEXT BEST ACTION</span><span className="live">ADAPTIVE</span></div><h3>Practise {next.name}</h3><p>Lowest current demo mastery · {next.mastery}%</p><button className="primary" disabled={busy || !!activeQuiz} onClick={() => startQuiz()}>Start adaptive session →</button></article></section>
      <section className="workspace-grid"><article className="conversation panel"><div className="panel-head"><div><span className="eyebrow">LEARN → TEST → ADAPT</span><h3>Command Center</h3></div><span className={`voice-wave ${listening ? 'hot' : ''}`} aria-hidden="true"><i/><i/><i/><i/></span></div><div className="agent-trace" aria-label="Latest learning actions"><span className="trace-label">DEMO ACTIONS</span>{trace.map(t => <span key={t} className="trace-chip">{t}</span>)}</div><div className="messages" ref={messagesRef} role="log" aria-label="Study conversation" aria-live="polite">{messages.map(m => <div className={`message ${m.role}`} key={m.id}><div className="message-label">{m.role === 'assistant' ? 'NEXORA' : 'YOU'}</div><div className="bubble">{m.content}</div></div>)}{busy && <p className="thinking" role="status">Waiting for a response…</p>}</div>
      {activeQuiz ? <div className="quiz-status"><span>Answering: {activeQuiz}</span><button className="text-button" onClick={() => { setActiveQuiz(null); say('Question skipped. Your mastery has not changed.'); }}>Skip question</button></div> : <div className="quick-row"><button disabled={busy} onClick={() => startQuiz()}>Quiz my weak spot</button><button disabled={busy} onClick={() => explain(next.name)}>Learn the concept</button><button disabled={busy} onClick={() => describePlan()}>Build my plan</button></div>}
      <form className="composer" onSubmit={submit}><button type="button" className={`mic ${listening ? 'listening' : ''}`} aria-label={listening ? 'Stop voice input' : 'Start voice input'} disabled={busy} onClick={startVoice}>●</button><input aria-label={activeQuiz ? 'Your quiz answer' : 'Study message'} ref={inputRef} maxLength={3000} value={input} onChange={e => setInput(e.target.value)} placeholder={activeQuiz ? 'Answer in your own words…' : 'Try “Explain cache mapping” or “Plan 60 minutes”'} disabled={busy}/><button className="send" type="submit" aria-label="Send message" disabled={busy || !input.trim()}>↑</button></form><p className="fine-print">Voice fills the input for review. Press send when ready.</p></article><aside className="right-stack">{planPanel}{masteryPanel}</aside></section>
    </>}
    {page === 'Learning' && <section className="lesson-grid" aria-label="Topic lessons">{ranked.map(t => <article className="panel lesson-card" key={t.name}><div className="panel-head"><span className="eyebrow">{t.name === next.name ? 'RECOMMENDED NEXT' : 'COMPUTER ARCHITECTURE'}</span><span className="pill subtle">{t.mastery}%</span></div><h2>{t.name}</h2><p>{LESSONS[t.name].summary}</p><div className="example"><b>Worked idea</b><p>{LESSONS[t.name].example}</p></div><button className="primary" disabled={busy || !!activeQuiz} onClick={() => startQuiz(t.name)}>Practise {t.name} →</button></article>)}{activeQuiz && <p className="notice">A question is active. <button className="text-button" onClick={() => setPage('Command')}>Return to your answer</button></p>}</section>}
    {page === 'Memory' && <section className="panel detail-panel"><div className="panel-head"><div><span className="eyebrow">BROWSER MEMORY</span><h2>{state.attempts.length} saved attempt{state.attempts.length === 1 ? '' : 's'}</h2></div><button className="primary" onClick={exportProgress}>Export progress</button></div><p>Refresh or return to this browser to keep practising. The latest 100 attempts and your mastery scores are retained. Answers and conversation text are not stored.</p>{state.attempts.length === 0 ? <div className="empty-state"><h3>Your first learning signal starts here.</h3><p>Complete a quiz to see its score, mastery change, and concepts to review.</p><button className="primary" disabled={!!activeQuiz || busy} onClick={() => startQuiz()}>Try a quiz →</button></div> : <div className="history">{[...state.attempts].reverse().map(a => <article className="history-item" key={a.id}><div><h3>{a.topic}</h3><time dateTime={a.at}>{new Date(a.at).toLocaleString()}</time></div><div className="history-score"><b>{a.score}% coverage</b><span>Mastery {a.before}% → {a.after}%</span></div><p>{a.missing.length ? `Review: ${a.missing.join('; ')}` : 'All target concepts recognized. Revisit later to check recall.'}</p></article>)}</div>}<div className="reset-box"><h3>Start a fresh demo</h3><p>Reset sample scores and clear the local attempt history. Export your progress first if you want a copy.</p>{confirmReset ? <div className="button-row"><button className="primary danger" disabled={busy} onClick={reset}>Confirm reset</button><button className="text-button" onClick={() => setConfirmReset(false)}>Keep progress</button></div> : <button className="text-button" disabled={busy} onClick={() => setConfirmReset(true)}>Reset demo progress</button>}</div></section>}
    {page === 'Insights' && <><section className="stat-grid"><article className="panel stat"><span>Average demo mastery</span><strong>{score}%</strong><small>Across four sample topics</small></article><article className="panel stat"><span>Mean term coverage</span><strong>{average === null ? '—' : `${average}%`}</strong><small>{state.attempts.length ? `From ${state.attempts.length} saved attempt{state.attempts.length === 1 ? '' : 's'}` : 'Complete a quiz to begin'}</small></article><article className="panel stat"><span>Next focus</span><strong className="topic-name">{next.name}</strong><small>Lowest mastery: {next.mastery}%</small></article></section><section className="insights-grid"><article className="panel detail-panel"><span className="eyebrow">FROM SAMPLE BASELINE TO NOW</span><h2>Progress by topic</h2>{ranked.map(t => { const baseline = SEED_TOPICS.find(s => s.name === t.name)!.mastery; const delta = t.mastery - baseline; return <div className="comparison" key={t.name}><div><b>{t.name}</b><span>{baseline}% baseline → {t.mastery}% now</span></div><strong className={delta < 0 ? 'negative' : ''}>{delta > 0 ? '+' : ''}{delta} pts</strong></div> })}<div className="method"><h3>How it works</h3><p>Each quiz checks two groups of key terms. Coverage contributes 22% to the new score; the previous score contributes 78%. The lowest score becomes the next priority.</p><p>Keyword matching can miss valid paraphrases or accept incorrect sentences containing the terms. These scores demonstrate adaptation; they are not validated learning outcomes.</p></div></article>{planPanel}</section></>}
    <footer>Nexora · Alexa+ web simulation · Local learning demo · Bedrock and AgentCore integration code is available; live cloud verification is pending.</footer></main>
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}
