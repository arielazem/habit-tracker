export interface Habit {
    id: string
    identityId: string
    text: string
    targetCount: number
    targetPeriod: 'week' | 'month'
    logs: { date: string }[]
    emoji?: string // ✅ Add this
  }
  