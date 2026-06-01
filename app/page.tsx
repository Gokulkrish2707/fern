'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type Task = {
  id: string
  title: string
  completed: boolean
  created_at: string
}

type Mode = 'focus' | 'cozy' | 'play' | 'sleepy'

const MODES: { key: Mode; label: string; emoji: string; desc: string; color: string }[] = [
  { key: 'focus',  label: 'Focus Mode',  emoji: '🌱', desc: 'Get things done together',    color: 'bg-[#dce8d0]' },
  { key: 'cozy',   label: 'Cozy Mode',   emoji: '☕', desc: 'Chill, talk, and be together', color: 'bg-[#f5e6d3]' },
  { key: 'play',   label: 'Play Mode',   emoji: '🎮', desc: 'Play games and have fun!',     color: 'bg-[#e8e0f5]' },
  { key: 'sleepy', label: 'Sleepy Mode', emoji: '🌙', desc: 'Wind down and take care',      color: 'bg-[#dce8f0]' },
]

const BEAR_MESSAGES: Record<Mode | 'default', string> = {
  default: 'What vibe are we feeling today? ~ᵕᴗᵕ~',
  focus:   "Let's get things done! I believe in you 🌱",
  cozy:    'Mmm cozy time. Want some tea? ☕',
  play:    "Yay! Let's have fun together! 🎮",
  sleepy:  "Shh let's wind down slowly 🌙",
}

function BearMascot({ mode }: { mode: Mode | null }) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.8, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="absolute -top-14 right-0 bg-white/90 backdrop-blur-sm rounded-2xl rounded-br-sm px-3 py-2 shadow-sm text-xs text-[#7a6652] max-w-[140px] text-center leading-snug"
      >
        {BEAR_MESSAGES[mode ?? 'default']}
        <div className="mt-1 text-[#c8a882]">♥</div>
      </motion.div>
      <svg width="130" height="140" viewBox="0 0 130 140" fill="none">
        <circle cx="28" cy="38" r="18" fill="#a0714f" />
        <circle cx="102" cy="38" r="18" fill="#a0714f" />
        <circle cx="28" cy="38" r="11" fill="#c49070" />
        <circle cx="102" cy="38" r="11" fill="#c49070" />
        <ellipse cx="65" cy="62" rx="42" ry="40" fill="#c49070" />
        <ellipse cx="65" cy="72" rx="24" ry="18" fill="#d4a882" />
        <circle cx="52" cy="58" r="5" fill="#3d2b1f" />
        <circle cx="78" cy="58" r="5" fill="#3d2b1f" />
        <circle cx="54" cy="56" r="2" fill="white" />
        <circle cx="80" cy="56" r="2" fill="white" />
        <ellipse cx="44" cy="67" rx="7" ry="4" fill="#e8a090" opacity="0.5" />
        <ellipse cx="86" cy="67" rx="7" ry="4" fill="#e8a090" opacity="0.5" />
        <ellipse cx="65" cy="68" rx="5" ry="3.5" fill="#3d2b1f" />
        <path d="M 59 73 Q 65 78 71 73" stroke="#3d2b1f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="65" cy="118" rx="36" ry="28" fill="#c49070" />
        <path d="M 38 96 Q 65 108 92 96 L 88 108 Q 65 120 42 108 Z" fill="#7a9e6e" opacity="0.9" />
        <circle cx="65" cy="105" r="4" fill="#5a7e50" />
        <ellipse cx="26" cy="112" rx="12" ry="20" fill="#c49070" transform="rotate(-15 26 112)" />
        <ellipse cx="104" cy="112" rx="12" ry="20" fill="#c49070" transform="rotate(15 104 112)" />
        <ellipse cx="22" cy="128" rx="10" ry="7" fill="#a0714f" />
        <ellipse cx="108" cy="128" rx="10" ry="7" fill="#a0714f" />
      </svg>
    </motion.div>
  )
}

function ModeCard({ mode, active, onClick }: {
  mode: typeof MODES[number]
  active: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`${mode.color} rounded-2xl p-3 flex flex-col items-start gap-1 text-left transition-all duration-200 border-2 ${active ? 'border-[#7a9e6e] shadow-md' : 'border-transparent'}`}
    >
      <span className="text-2xl">{mode.emoji}</span>
      <span className="font-semibold text-[#4a3728] text-sm leading-tight">{mode.label}</span>
      <span className="text-[#7a6652] text-xs leading-tight">{mode.desc}</span>
      <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${active ? 'bg-[#7a9e6e]' : 'bg-[#a0896e]'}`}>→</div>
    </motion.button>
  )
}

function TaskItem({ task, onToggle }: {
  task: Task
  onToggle: (id: string, completed: boolean) => void
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-3 py-2"
    >
      <button
        onClick={() => onToggle(task.id, !task.completed)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${task.completed ? 'bg-[#7a9e6e] border-[#7a9e6e]' : 'border-[#c8b8a2] bg-transparent'}`}
      >
        {task.completed && (
          <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </motion.svg>
        )}
      </button>
      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-[#b0a090]' : 'text-[#4a3728]'}`}>
        {task.title}
      </span>
    </motion.div>
  )
}

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [myUsername, setMyUsername] = useState('there')
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [activeMode, setActiveMode] = useState<Mode | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [currentTime, setCurrentTime] = useState('')

  // Auth check + load username
  useEffect(() => {
  function updateTime() {
    setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }
  updateTime()
  const timer = setInterval(updateTime, 1000)
  return () => clearInterval(timer)
}, [])
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      const uid = data.session.user.id
      setUserId(uid)

      // Load username from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', uid)
        .single()
      if (profile) setMyUsername(profile.username)
    })
  }, [router])

  // Fetch tasks + realtime
  useEffect(() => {
    if (!userId) return

    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
      if (error) {
        console.error('Error fetching tasks:', error)
      } else {
        setTasks(data ?? [])
      }
      setLoading(false)
    }

    fetchTasks()

    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function handleAddTask() {
    const title = newTask.trim()
    if (!title || adding || !userId) return
    setAdding(true)
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, user_id: userId, completed: false })
      .select()
      .single()
    if (error) {
      console.error('Error adding task:', error)
    } else if (data) {
      setTasks(prev => [...prev, data])
      setNewTask('')
    }
    setAdding(false)
  }

  async function handleToggleTask(id: string, completed: boolean) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed } : t))
    const { error } = await supabase.from('tasks').update({ completed }).eq('id', id)
    if (error) {
      console.error('Error updating task:', error)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const completedCount = tasks.filter(t => t.completed).length

  if (!userId) return null

  return (
    <main className="min-h-screen bg-[#faf6f0] flex justify-center">
      <div className="w-full max-w-sm">

        <div
          className="relative overflow-hidden rounded-b-3xl"
          style={{ background: 'linear-gradient(160deg, #f5ede0 0%, #e8d5b8 50%, #d4c4a0 100%)', minHeight: 280 }}
        >
          <div className="absolute top-10 right-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-[#a0714f]/10 blur-3xl" />

          <div className="flex justify-between items-center px-5 pt-4 pb-2">
            <span className="text-[#5a4535] font-semibold text-sm">{currentTime}</span>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.9 }} className="w-9 h-9 bg-white/70 rounded-xl flex items-center justify-center text-lg shadow-sm">🔔</motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleSignOut} className="w-9 h-9 bg-white/70 rounded-xl flex items-center justify-center text-lg shadow-sm" title="Sign out">👥</motion.button>
            </div>
          </div>

          <div className="px-5 pt-1">
            <h1 className="text-2xl font-bold text-[#3d2b1f]">
               {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {myUsername}! {new Date().getHours() < 12 ? '☀️' : new Date().getHours() < 17 ? '🌤️' : '🌙'}
            </h1>
            <p className="text-[#7a6652] text-sm mt-0.5">I slept so well!</p>
            <p className="text-[#7a6652] text-sm">What shall we do today?</p>
          </div>

          <div className="flex items-end justify-between px-5 mt-2 pb-4">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-white/80 backdrop-blur-sm rounded-2xl px-3 py-2 flex items-center gap-2 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#f5c0a0] flex items-center justify-center text-sm">🐻</div>
              <div>
                <p className="text-xs font-semibold text-[#4a3728]">With Aarav</p>
                <p className="text-xs text-[#e07070]">♥ 128 days</p>
              </div>
            </motion.div>
            <div className="relative">
              <BearMascot mode={activeMode} />
            </div>
          </div>
        </div>

        <div className="px-4 mt-5">
          <p className="text-center text-[#4a3728] font-semibold text-sm mb-3">🌿 What do you want to do? 🌿</p>
          <div className="grid grid-cols-2 gap-2.5">
            {MODES.map(mode => (
              <ModeCard
                key={mode.key}
                mode={mode}
                active={activeMode === mode.key}
                onClick={() => setActiveMode(prev => prev === mode.key ? null : mode.key)}
              />
            ))}
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-[#4a3728] flex items-center gap-1.5">
                <span>🌱</span> Today's Tasks
              </h2>
              <span className="text-xs text-[#9a8878]">
                {loading ? '...' : `${completedCount}/${tasks.length} done`}
              </span>
            </div>
            <div className="divide-y divide-[#f0ebe4]">
              {loading ? (
                <p className="text-xs text-[#b0a090] py-3 text-center">Loading tasks…</p>
              ) : tasks.length === 0 ? (
                <p className="text-xs text-[#b0a090] py-3 text-center">No tasks yet. Add one below! 🌸</p>
              ) : (
                <AnimatePresence>
                  {tasks.map(task => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                  ))}
                </AnimatePresence>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="Add a new task…"
                className="flex-1 text-sm bg-[#faf6f0] rounded-xl px-3 py-2 outline-none border border-[#e8dfd4] focus:border-[#7a9e6e] text-[#4a3728] placeholder:text-[#c8b8a2] transition-colors"
              />
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleAddTask}
                disabled={!newTask.trim() || adding}
                className="bg-[#7a9e6e] disabled:opacity-50 text-white rounded-xl px-4 py-2 text-sm font-medium transition-opacity"
              >
                {adding ? '…' : '+'}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[#4a3728] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e07070] inline-block" />
                From partner
              </h2>
              <span className="text-xs text-[#b0a090]">2m ago</span>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-[#c8d8f0] flex items-center justify-center flex-shrink-0">🐻</div>
              <div className="bg-[#f5f0e8] rounded-xl rounded-tl-sm p-2.5 text-sm text-[#4a3728] flex-1">
                Good luck today! You have got this 🐻💕
              </div>
            </div>
            <p className="text-right text-xs text-[#7a9e6e] mt-2 cursor-pointer">Tap to view and reply →</p>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-[#4a3728] flex items-center gap-1.5 mb-3">
              <span>🌿</span> Bear's Status
            </h2>
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 bg-[#f5e6d3] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">🐻</div>
              <div className="flex-1 space-y-1.5">
                {[
                  { label: 'Happiness', emoji: '😊', value: 85, color: 'bg-[#7a9e6e]' },
                  { label: 'Energy',    emoji: '⚡', value: 60, color: 'bg-[#e8c44a]' },
                  { label: 'Fullness',  emoji: '🍪', value: 70, color: 'bg-[#e0a060]' },
                  { label: 'Love',      emoji: '💕', value: 45, color: 'bg-[#e07070]' },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <span className="text-xs">{stat.emoji}</span>
                    <span className="text-xs text-[#9a8878] w-16">{stat.label}</span>
                    <div className="flex-1 h-2 bg-[#f0ebe4] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.value}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                        className={`h-full rounded-full ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-[#9a8878] mt-3">Feeling happy with you! 😊</p>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="font-semibold text-[#4a3728] flex items-center gap-1.5 mb-3">🐾 My Pets</h2>
            <div className="flex gap-3">
              {[
                { name: 'Mochi', emoji: '🐰', heart: true },
                { name: 'Boba',  emoji: '🐱', heart: false },
              ].map(pet => (
                <motion.div key={pet.name} whileHover={{ y: -2 }} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 bg-[#faf0e8] rounded-2xl flex items-center justify-center text-2xl border-2 border-[#f0e4d4] relative">
                    {pet.emoji}
                    {pet.heart && <span className="absolute -top-1 -right-1 text-xs">❤️</span>}
                  </div>
                  <span className="text-xs text-[#7a6652]">{pet.name}</span>
                </motion.div>
              ))}
              <motion.div whileHover={{ y: -2 }} className="flex flex-col items-center gap-1">
                <div className="w-14 h-14 bg-[#f5f0e8] rounded-2xl flex items-center justify-center text-xl text-[#b0a090] border-2 border-dashed border-[#d8cfc4]">+</div>
                <span className="text-xs text-[#b0a090]">Add</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 px-4 pb-6">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 flex justify-between items-center">
            {[
              { icon: '🏠', label: 'Home',  active: true,  href: '/' },
              { icon: '🌍', label: 'World', active: false, href: '/room' },
            ].map(item => (
              <motion.button key={item.label} whileTap={{ scale: 0.9 }} onClick={() => router.push(item.href)} className="flex flex-col items-center gap-0.5">
                <span className="text-xl">{item.icon}</span>
                <span className={`text-xs font-medium ${item.active ? 'text-[#7a9e6e]' : 'text-[#b0a090]'}`}>{item.label}</span>
                {item.active && <div className="w-1 h-1 rounded-full bg-[#7a9e6e]" />}
              </motion.button>
            ))}
            <motion.button whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.05 }} className="w-12 h-12 bg-[#7a9e6e] rounded-full flex items-center justify-center text-white text-2xl shadow-md -mt-4">+</motion.button>
            {[
              { icon: '🎮', label: 'Games',   href: '/' },
              { icon: '🐻', label: 'Profile', href: '/' },
            ].map(item => (
              <motion.button key={item.label} whileTap={{ scale: 0.9 }} onClick={() => router.push(item.href)} className="flex flex-col items-center gap-0.5">
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium text-[#b0a090]">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}