import type { MasteryTopic } from '../types'

export const STORAGE_KEY = 'nexora-learning-v2'
export const SEED_TOPICS: MasteryTopic[] = [
  { name: 'Memory hierarchy', mastery: 86, trend: 0 },
  { name: 'Instruction cycles', mastery: 74, trend: 0 },
  { name: 'Cache mapping', mastery: 61, trend: 0 },
  { name: 'Booth algorithm', mastery: 52, trend: 0 },
]
export type Lesson = { summary: string; example: string; question: string; concepts: { label: string; terms: string[] }[]; answer: string }
export const LESSONS: Record<string, Lesson> = {
  'Booth algorithm': {
    summary: 'Booth multiplication handles signed binary numbers in two’s complement. Inspect the current multiplier bit Q₀ and the previous bit Q₋₁. For 01, add the multiplicand; for 10, subtract it; for 00 or 11, do neither. Then arithmetic-right-shift the combined registers. Repeat once per multiplier bit.',
    example: 'A run such as 001110 equals 010000 − 000010. Encoding the boundaries of a run of 1s can reduce repeated additions. Keep the sign bit during each arithmetic shift.',
    question: 'Why does Booth multiplication inspect the current multiplier bit together with the previous bit?',
    concepts: [{ label: 'transitions or boundaries of runs of bits', terms: ['transition', 'transitions', 'boundary', 'boundaries', 'runs', 'run'] }, { label: 'add or subtract operations', terms: ['add', 'addition', 'additions', 'subtract', 'subtraction'] }],
    answer: 'The bit pair detects transitions at the boundaries of runs of 1s. Those transitions select add or subtract operations, followed by an arithmetic right shift.',
  },
  'Cache mapping': {
    summary: 'A direct-mapped cache gives each memory block exactly one possible cache line. Split the address into tag, index, and block offset: the index selects the line, the tag verifies which block occupies it, and the offset selects the byte inside the block. A valid bit is also needed for a hit.',
    example: 'With 8 cache lines, memory blocks 0, 8, and 16 all map to line 0 (block number mod 8). Different tags distinguish them, but they compete for that same line.',
    question: 'In a direct-mapped cache, what selects the cache line, and what verifies which memory block is stored there?',
    concepts: [{ label: 'index selects the line', terms: ['index', 'index bits'] }, { label: 'tag identifies the block', terms: ['tag', 'tag bits'] }],
    answer: 'The index bits select the cache line. A matching tag, together with a valid bit, confirms the requested memory block is present.',
  },
  'Instruction cycles': {
    summary: 'The CPU fetches an instruction using the program counter, decodes its operation and operands, executes it, and writes back results as needed. Real processors can pipeline or overlap stages; this is a simplified conceptual sequence.',
    example: 'For ADD R1, R2, first fetch the encoded instruction. Decode the opcode and register operands, perform the addition, then store the result in the destination register.',
    question: 'Name the two core stages that happen before an instruction can execute.',
    concepts: [{ label: 'fetch the instruction', terms: ['fetch', 'fetching'] }, { label: 'decode the instruction', terms: ['decode', 'decoding'] }],
    answer: 'Fetch the instruction from memory, then decode its opcode and operands before execution.',
  },
  'Memory hierarchy': {
    summary: 'Registers and caches offer fast access but limited capacity and higher cost per bit. Main memory offers more capacity at greater latency. Locality makes the hierarchy useful: programs often reuse recent values and nearby addresses.',
    example: 'Repeatedly reading a small array can hit in cache after its first load. A larger working set can overflow the cache, requiring more accesses to slower main memory.',
    question: 'Why are registers and cache placed near the CPU in the memory hierarchy?',
    concepts: [{ label: 'fast access', terms: ['fast', 'faster', 'speed', 'quick', 'quickly'] }, { label: 'lower latency or access time', terms: ['latency', 'delay', 'access time', 'waiting'] }],
    answer: 'They provide faster access and lower latency for frequently used data, reducing the time the CPU waits for main memory.',
  },
}
export type Attempt = { id: string; at: string; topic: string; score: number; before: number; after: number; matched: string[]; missing: string[] }
export type LearningState = { version: 2; topics: MasteryTopic[]; attempts: Attempt[]; minutes: number }
export const freshState = (): LearningState => ({ version: 2, topics: SEED_TOPICS.map(t => ({ ...t })), attempts: [], minutes: 48 })
const percent = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100
export function validateTopics(value: unknown): MasteryTopic[] | null {
  if (!Array.isArray(value) || value.length !== SEED_TOPICS.length) return null
  if (!SEED_TOPICS.every(seed => value.filter(t => t?.name === seed.name).length === 1)) return null
  if (!value.every(t => percent(t.mastery) && typeof t.trend === 'number' && Number.isFinite(t.trend) && Math.abs(t.trend) <= 100)) return null
  return SEED_TOPICS.map(seed => { const t = value.find(t => t.name === seed.name); return { name: seed.name, mastery: Math.round(t.mastery), trend: t.trend } })
}
export function parseState(raw: string | null, legacy: string | null = null): LearningState {
  const fallback = freshState()
  try {
    if (!raw) { const topics = legacy ? validateTopics(JSON.parse(legacy)) : null; return { ...fallback, topics: topics ?? fallback.topics } }
    const value = JSON.parse(raw)
    const topics = validateTopics(value?.topics)
    if (value?.version !== 2 || !topics) return fallback
    const attempts = Array.isArray(value.attempts) ? value.attempts.filter((a: Attempt) =>
      a && typeof a.id === 'string' && typeof a.at === 'string' && Number.isFinite(Date.parse(a.at)) && Object.hasOwn(LESSONS, a.topic) && percent(a.score) && percent(a.before) && percent(a.after) && Array.isArray(a.matched) && a.matched.every(x => typeof x === 'string') && Array.isArray(a.missing) && a.missing.every(x => typeof x === 'string')
    ).slice(-100) : []
    return { version: 2, topics, attempts, minutes: Number.isInteger(value.minutes) && value.minutes >= 15 && value.minutes <= 180 ? value.minutes : 48 }
  } catch { return fallback }
}
export const rankTopics = (topics: MasteryTopic[]) => [...topics].sort((a, b) => a.mastery - b.mastery)
export const readiness = (topics: MasteryTopic[]) => Math.round(topics.reduce((sum, t) => sum + t.mastery, 0) / topics.length)
export function buildPlan(topics: MasteryTopic[], minutes: number) {
  const budget = Math.max(15, Math.min(180, Math.round(minutes)))
  const first = Math.round(budget * .42), second = Math.round(budget * .33)
  const durations = [first, second, budget - first - second]
  return rankTopics(topics).slice(0, 3).map((topic, i) => ({ topic: topic.name, minutes: durations[i], detail: ['Review the concept, then try active recall.', 'Work through an example without notes.', 'Finish with a short recall check.'][i] }))
}
export function gradeAnswer(topic: string, answer: string) {
  const lesson = LESSONS[topic]
  if (!lesson) throw new Error('Unknown topic')
  const normalized = answer.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const padded = ` ${normalized} `
  const matched = lesson.concepts.filter(c => c.terms.some(term => padded.includes(` ${term} `))).map(c => c.label)
  const missing = lesson.concepts.filter(c => !matched.includes(c.label)).map(c => c.label)
  return { score: Math.round(matched.length / lesson.concepts.length * 100), matched, missing, answer: lesson.answer }
}
export function recordAnswer(state: LearningState, topic: string, answer: string, id: string, at: string) {
  const result = gradeAnswer(topic, answer)
  const before = state.topics.find(t => t.name === topic)!.mastery
  const after = Math.round(before * .78 + result.score * .22)
  const attempt: Attempt = { id, at, topic, score: result.score, before, after, matched: result.matched, missing: result.missing }
  return { result, attempt, state: { ...state, topics: state.topics.map(t => t.name === topic ? { ...t, mastery: after, trend: after - before } : t), attempts: [...state.attempts, attempt].slice(-100) } }
}
