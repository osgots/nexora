import type { InsightCard, MasteryTopic, StudyBlock } from '../types'

export const topics: MasteryTopic[] = [
  { name: 'Memory hierarchy', mastery: 86, trend: 8 },
  { name: 'Instruction cycles', mastery: 74, trend: 5 },
  { name: 'Cache mapping', mastery: 61, trend: 12 },
  { name: 'Booth algorithm', mastery: 52, trend: 3 },
]

export const plan: StudyBlock[] = [
  { time: '20 min', title: 'Cache Mapping', detail: 'Repair the weakest concept with visual recall.', state: 'next' },
  { time: '15 min', title: 'Booth Algorithm', detail: 'One worked example, then a timed attempt.', state: 'queued' },
  { time: '12 min', title: 'Rapid Recall', detail: 'Six high-yield questions from today’s weak areas.', state: 'queued' },
]

export const initialCards: InsightCard[] = [
  { label: 'Readiness', value: '72%', detail: '+9% this week', tone: 'mint' },
  { label: 'Focus', value: 'Cache', detail: 'Highest expected gain', tone: 'violet' },
  { label: 'Memory', value: '18', detail: 'Learning signals retained', tone: 'blue' },
]

export function demoReply(input: string): string {
  const q = input.toLowerCase()
  if (q.includes('plan') || q.includes('exam')) {
    return 'I rebuilt your session around expected score gain. Start with Cache Mapping for 20 minutes, then one Booth Algorithm example, and finish with a six-question rapid recall. I’ll adapt the rest after every answer.'
  }
  if (q.includes('quiz') || q.includes('test')) {
    return 'Quiz mode ready. First question: in a direct-mapped cache, what determines the cache line that a memory block can occupy? Answer in one sentence — I’ll grade the concept, not the wording.'
  }
  if (q.includes('weak') || q.includes('improve')) {
    return 'Your weakest retained concept is Booth Algorithm at 52% mastery, but Cache Mapping has the highest short-term score gain because your recent errors are clustered around tag/index selection.'
  }
  return 'I can turn that into an action, not just an answer. I’ll use your syllabus, retained mastery and available time to choose the next best learning step, then update the plan after you respond.'
}
