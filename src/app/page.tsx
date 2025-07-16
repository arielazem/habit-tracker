// src/app/page.tsx
'use client'

import ProgressBar from '../components/ProgressBar'
import { useEffect, useState } from 'react'
import { IdentityGoal, Habit } from '../types'
import { v4 as uuidv4 } from 'uuid'
import EmojiPicker from 'emoji-picker-react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

export default function HomePage() {
  const [identities, setIdentities] = useState<IdentityGoal[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [newIdentity, setNewIdentity] = useState('')
  const [selectedIdentity, setSelectedIdentity] = useState('')
  const [newHabitText, setNewHabitText] = useState('')
  const [targetCount, setTargetCount] = useState(1)
  const [targetPeriod, setTargetPeriod] = useState<'week' | 'month'>('week')
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null)
  const [habitEmoji, setHabitEmoji] = useState('')
  const [editingHabitEmoji, setEditingHabitEmoji] = useState('')
  const [showHabitEmojiPicker, setShowHabitEmojiPicker] = useState(false)  
  const [showEditHabitEmojiPickerId, setShowEditHabitEmojiPickerId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingTargetCount, setEditingTargetCount] = useState(1)
  const [editingTargetPeriod, setEditingTargetPeriod] = useState<'week' | 'month'>('week')
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')
  const [showNewEmojiPicker, setShowNewEmojiPicker] = useState(false)
  const [showEditEmojiPickerId, setShowEditEmojiPickerId] = useState<string | null>(null)  
  const [identityEmoji, setIdentityEmoji] = useState('')
  const [editingIdentityId, setEditingIdentityId] = useState<string | null>(null)
  const [editingIdentityText, setEditingIdentityText] = useState('')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [expandedIdentities, setExpandedIdentities] = useState<string[]>([])

  useEffect(() => {
    const storedIdentities = localStorage.getItem('identities')
    const storedHabits = localStorage.getItem('habits')
    if (storedIdentities) setIdentities(JSON.parse(storedIdentities))
    if (storedHabits) setHabits(JSON.parse(storedHabits))
  }, [])

  useEffect(() => {
    localStorage.setItem('identities', JSON.stringify(identities))
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [identities, habits])

  const toggleIdentity = (id: string) => {
    setExpandedIdentities(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const addIdentity = () => {
    if (!newIdentity.trim()) return
    const newId = uuidv4()
    setIdentities([...identities, { id: newId, label: `${identityEmoji} ${newIdentity.trim()}`}])
    setNewIdentity('')
    setIdentityEmoji('')
    setShowEmojiPicker(false)
  }

  const deleteIdentity = (id: string) => {
    setIdentities(identities.filter(i => i.id !== id))
    setHabits(habits.filter(h => h.identityId !== id))
  }

  const startEditIdentity = (identity: IdentityGoal) => {
    setEditingIdentityId(identity.id)
    setEditingIdentityText(identity.label)
  }

  const saveEditIdentity = () => {
    setIdentities(identities.map(i => i.id === editingIdentityId ? {
      ...i,
      label: editingIdentityText
    } : i))
    setEditingIdentityId(null)
    setEditingIdentityText('')
  }

  const addHabit = () => {
    if (!selectedIdentity || !newHabitText.trim()) return
    const newHabit: Habit = {
      id: uuidv4(),
      identityId: selectedIdentity,
      text: newHabitText.trim(),
      targetCount,
      targetPeriod,
      logs: [],
      emoji: habitEmoji,
    }
    setHabits([...habits, newHabit])
    setNewHabitText('')
    setTargetCount(1)
    setTargetPeriod('week')
    setHabitEmoji('')
    setShowHabitEmojiPicker(false)
  }

  const logOccurrence = (habitId: string, date: Date = calendarDate) => {
    const day = date.toDateString()

    const now = new Date()
    if (date > now) return
  
    setHabits(prev =>
      prev.map(h => {
        if (h.id !== habitId) return h
        const alreadyLogged = (h.logs || []).some(log => new Date(log.date).toDateString() === day)
        if (alreadyLogged) return h
        return {
          ...h,
          logs: [...(h.logs || []), { date: date.toISOString() }]
        }
      })
    )
  }

  const getGoalProgressBreakdown = (identityId: string) => {
    const now = new Date()
    const relatedHabits = habits.filter(h => h.identityId === identityId)
  
    let totalCurrent = 0
    let totalTarget = 0
  
    for (const habit of relatedHabits) {
      const logs = (habit.logs || []).map(log => new Date(log.date))
  
      const count = logs.filter(date => {
        if (viewMode === 'week') {
          const start = new Date(now)
          start.setDate(now.getDate() - now.getDay())
          const end = new Date(start)
          end.setDate(start.getDate() + 7)
          return date >= start && date < end
        } else {
          const start = new Date(now.getFullYear(), now.getMonth(), 1)
          return date >= start && date <= now
        }
      }).length
  
      totalCurrent += count
  
      if (viewMode === 'week') {
        totalTarget += habit.targetCount
      } else {
        let expectedByNow = 1
        if (habit.targetPeriod === 'month') {
          const daysElapsed = now.getDate()
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
          expectedByNow = Math.round((daysElapsed / daysInMonth) * habit.targetCount)
        } else if (habit.targetPeriod === 'week') {
          const weeksElapsed = Math.ceil(now.getDate() / 7)
          expectedByNow = weeksElapsed * habit.targetCount
        }
        totalTarget += Math.max(1, expectedByNow)
      }
    }
  
    return { current: totalCurrent, total: totalTarget }
  }  
  
  const getLogStats = (habit: Habit) => {
    const now = new Date()
    const logs = (habit.logs || []).map(log => new Date(log.date))
  
    if (viewMode === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
  
      const count = logs.filter(date => date >= startOfWeek && date < endOfWeek).length
      return { count, target: habit.targetCount }
    }
  
    // Month-to-date mode
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const today = now
    const count = logs.filter(date => date >= startOfMonth && date <= today).length
  
    let expectedByNow = 1
  
    if (habit.targetPeriod === 'month') {
      const daysElapsed = now.getDate()
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      expectedByNow = Math.round((daysElapsed / daysInMonth) * habit.targetCount)
    } else if (habit.targetPeriod === 'week') {
      const weeksElapsed = Math.ceil(now.getDate() / 7)
      expectedByNow = weeksElapsed * habit.targetCount
    }
  
    return { count, target: Math.max(1, expectedByNow) }
  }
  
  

  const deleteLog = (habitId: string, logDate: string) => {
    setHabits(prev => prev.map(h => h.id === habitId ? {
      ...h,
      logs: h.logs?.filter(log => log.date !== logDate) || []
    } : h))
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id))
  }

  const startEditHabit = (habit: Habit) => {
    setEditingHabitId(habit.id)
    setEditingText(habit.text)
    setEditingTargetCount(habit.targetCount)
    setEditingTargetPeriod(habit.targetPeriod)
    setEditingHabitEmoji(habit.emoji || '')
  }

  const saveEditHabit = () => {
    setHabits(habits.map(h => h.id === editingHabitId ? {
      ...h,
      text: editingText,
      targetCount: editingTargetCount,
      targetPeriod: editingTargetPeriod,
      emoji: editingHabitEmoji,
    } : h))
    setEditingHabitId(null)
    setEditingText('')
    setEditingHabitEmoji('')
    setShowHabitEmojiPicker(false)
  }

  const getCompletionPercentage = (habit: Habit) => {
    const now = new Date()
    const logs = (habit.logs || []).map(log => new Date(log.date))
  
    if (viewMode === 'week') {
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 7)
  
      const count = logs.filter(date => date >= startOfWeek && date < endOfWeek).length
      return Math.min(100, Math.round((count / habit.targetCount) * 100))
    }
  
    // Month-to-date logic
    const year = now.getFullYear()
    const month = now.getMonth()
    const startOfMonth = new Date(year, month, 1)
  
    const count = logs.filter(date => date >= startOfMonth && date <= now).length
  
    // Estimate how many times the habit should have been done by now
    const daysElapsed = now.getDate()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const expectedByNow = Math.round((daysElapsed / daysInMonth) * habit.targetCount)
  
    return Math.min(100, Math.round((count / Math.max(1, expectedByNow)) * 100))
  }  

  const getGoalProgress = (identityId: string) => {
    const relatedHabits = habits.filter(h => h.identityId === identityId)
    const total = relatedHabits.length
    const progress = relatedHabits.reduce((sum, h) => sum + getCompletionPercentage(h), 0)
    return total ? Math.round(progress / total) : 0
  }

  const getStreak = (habit: Habit) => {
    const sortedDates = (habit.logs || [])
      .map(log => new Date(log.date))
      .sort((a, b) => b.getTime() - a.getTime())
    let streak = 0
    let current = new Date()
    for (let date of sortedDates) {
      const diff = Math.floor((current.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 0 || diff === 1) {
        streak++
        current = date
      } else {
        break
      }
    }
    return streak
  }

  return (
    <main className="p-4 max-w-xl mx-auto space-y-8 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <label className="mr-2 font-semibold">View Mode:</label>
        <select value={viewMode} onChange={e => setViewMode(e.target.value as 'week' | 'month')} className="border p-1 rounded">
          <option value="week">Week</option>
          <option value="month">Month-To-Date</option>
        </select>
      </div>

      <div className="mb-6 bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-bold mb-2">Add Identity Goal</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNewEmojiPicker(!showNewEmojiPicker)} className="text-2xl">
            {identityEmoji || '🔍'}
          </button>
          <input
            type="text"
            placeholder="e.g. I’m a great climber"
            value={newIdentity}
            onChange={(e) => setNewIdentity(e.target.value)}
            className="border px-2 py-1 rounded flex-1"
          />
          <button onClick={addIdentity} className="bg-blue-500 text-white px-3 py-1 rounded">➕</button>
        </div>
        {showNewEmojiPicker && (
          <div className="mt-2">
            <EmojiPicker
              onEmojiClick={(e) => {
                setIdentityEmoji(e.emoji)
                setShowNewEmojiPicker(false)
              }}
            />
          </div>
        )}
      </div>

      {identities.map(identity => (
        <div key={identity.id} className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleIdentity(identity.id)}>
            {editingIdentityId === identity.id ? (
              <>
                <button
                  onClick={() =>
                    setShowEditEmojiPickerId(showEditEmojiPickerId === identity.id ? null : identity.id)
                  }
                  className="text-2xl"
                >
                  {editingIdentityText.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u)?.[0] || '🔍'}
                </button>
                <input
                  value={editingIdentityText}
                  onChange={e => setEditingIdentityText(e.target.value)}
                  className="border px-2 py-1 rounded flex-1"
                />
                {showEditEmojiPickerId === identity.id && (
                  <div className="mt-2">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        const emoji = e.emoji
                        setEditingIdentityText(
                          emoji + ' ' + editingIdentityText.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, '')
                        )
                        setShowEditEmojiPickerId(null)
                      }}
                    />
                  </div>
                )}
                <button onClick={saveEditIdentity}>💾</button>
              </>
            ) : (
              <>
                <div className="w-full">
                  <h2 className="text-lg font-semibold mb-1">
                    {identity.label}
                  </h2>
                  {(() => {
                    const { current, total } = getGoalProgressBreakdown(identity.id)
                    return <ProgressBar value={Math.round((current / Math.max(1, total)) * 100)} current={current} total={total} />
                  })()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditIdentity(identity)}>✏️</button>
                  <button onClick={() => deleteIdentity(identity.id)}>🗑️</button>
                </div>
              </>
            )}
          </div>

          {expandedIdentities.includes(identity.id) && (
            <div className="mt-3 space-y-2">
              {habits.filter(h => h.identityId === identity.id).map(habit => (
                <div key={habit.id} className="bg-gray-100 p-2 rounded">
                  <div className="flex justify-between items-center">
                    {editingHabitId === habit.id ? (
                      <>
                        <button
                          onClick={() =>
                            setShowEditHabitEmojiPickerId(showEditHabitEmojiPickerId === habit.id ? null : habit.id)
                          }
                          className="text-xl"
                        >
                          {editingHabitEmoji || habit.emoji || '📝'}
                        </button>
                        {showEditHabitEmojiPickerId === habit.id && (
                          <div className="mt-2">
                            <EmojiPicker
                              onEmojiClick={(e) => {
                                setEditingHabitEmoji(e.emoji)
                                setShowEditHabitEmojiPickerId(null)
                              }}
                            />
                          </div>
                        )}
                        <input
                          value={editingText}
                          onChange={e => setEditingText(e.target.value)}
                          className="border px-2 py-1 rounded"
                        />
                        <input
                          type="number"
                          value={editingTargetCount}
                          onChange={e => setEditingTargetCount(parseInt(e.target.value))}
                          className="border px-2 py-1 w-20 rounded"
                        />
                        <select
                          value={editingTargetPeriod}
                          onChange={e => setEditingTargetPeriod(e.target.value as 'week' | 'month')}
                          className="border p-1 rounded"
                        >
                          <option value="week">/week</option>
                          <option value="month">/month</option>
                        </select>
                        <button onClick={saveEditHabit}>💾</button>
                      </>
                    ) : (
                      <>
                        <span>
                          {habit.emoji && <span className="mr-1">{habit.emoji}</span>}
                          {habit.text}
                        </span>

                        <div className="flex gap-2">
                          <button onClick={() => logOccurrence(habit.id, calendarDate)}>✅</button>
                          <button onClick={() => startEditHabit(habit)}>✏️</button>
                          <button onClick={() => deleteHabit(habit.id)}>🗑️</button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="ml-1 space-y-1">
                    <div className="text-xs text-gray-500">🔥 Streak: {getStreak(habit)}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {habit.logs
                        ?.slice()
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3)
                        .map(log => (
                          <div key={log.date} className="flex justify-between items-center">
                            <span>{new Date(log.date).toLocaleDateString()}</span>
                            <button
                              onClick={() => deleteLog(habit.id, log.date)}
                              className="text-red-500 text-xs"
                            >
                              🗑️
                            </button>
                          </div>
                      ))}
                    </div>
                    {(() => {
                      const { count, target } = getLogStats(habit)
                      return (
                        <ProgressBar
                          value={(count / target) * 100}
                          current={count}
                          total={target}
                        />
                      )
                    })()}

                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <button onClick={() => setShowHabitEmojiPicker(!showHabitEmojiPicker)} className="text-2xl">
                  {habitEmoji || '📝'}
                </button>
                <input
                  type="text"
                  placeholder="Add new habit"
                  value={newHabitText}
                  onChange={e => setNewHabitText(e.target.value)}
                  className="border px-2 py-1 rounded flex-1"
                />
                <input
                  type="number"
                  value={targetCount}
                  onChange={e => setTargetCount(parseInt(e.target.value))}
                  className="border px-2 py-1 w-20 rounded"
                />
                <select
                  value={targetPeriod}
                  onChange={e => setTargetPeriod(e.target.value as 'week' | 'month')}
                  className="border p-1 rounded"
                >
                  <option value="week">/week</option>
                  <option value="month">/month</option>
                </select>
                <button onClick={() => { setSelectedIdentity(identity.id); addHabit(); }}>➕</button>
              </div>
              {showHabitEmojiPicker && (
                <div className="mt-2"><EmojiPicker onEmojiClick={(e) => setHabitEmoji(e.emoji)} /></div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Habit Calendar</h2>
        <Calendar onChange={setCalendarDate} value={calendarDate} />

        <h3 className="text-md font-semibold mt-4 mb-2">Logs for {calendarDate.toDateString()}:</h3>
        {habits
          .flatMap(h => 
            (h.logs || [])
              .filter(l => new Date(l.date).toDateString() === calendarDate.toDateString())
              .map(log => (
                <div key={`${h.id}-${log.date}`} className="text-sm flex justify-between items-center">
                  <span>{h.text}</span>
                  <button
                    onClick={() => deleteLog(h.id, log.date)}
                    className="text-red-500 text-xs"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))
          )
        }

      </div>
    </main>
  )
}
