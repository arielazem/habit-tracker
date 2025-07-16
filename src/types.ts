export type IdentityGoal = {
    id: string
    label: string
  }
  
  export type Habit = {
    id: string
    identityId: string
    text: string
    targetCount: number
    targetPeriod: 'week' | 'month'
    logs: {
      date: string
      duration?: number
    }[]
    emoji?:string
  }