export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  cards?: InsightCard[]
}

export interface InsightCard {
  label: string
  value: string
  detail?: string
  tone?: 'mint' | 'violet' | 'amber' | 'blue'
}

export interface StudyBlock {
  time: string
  title: string
  detail: string
  state: 'next' | 'queued' | 'done'
}

export interface MasteryTopic {
  name: string
  mastery: number
  trend: number
}
