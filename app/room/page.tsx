'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function RoomPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [currentRoom, setCurrentRoom] = useState<{ id: string; code: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  // Auth check + load existing room
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/login')
        return
      }
      const uid = data.session.user.id
      setUserId(uid)

      // Check if already in a room
      const { data: membership } = await supabase
        .from('room_members')
        .select('room_id, rooms(id, code)')
        .eq('user_id', uid)
        .single()

      if (membership?.rooms) {
        const room = membership.rooms as unknown as { id: string; code: string }
        setCurrentRoom(room)
      }
      setLoading(false)
    })
  }, [router])

  // Generate random 6-char code
  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Create a new room
  async function handleCreateRoom() {
    if (!userId || creating) return
    setCreating(true)
    setError('')

    const code = generateCode()

    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .insert({ code, created_by: userId })
      .select()
      .single()

    if (roomErr) {
      setError('Could not create room. Try again!')
      setCreating(false)
      return
    }

    await supabase.from('room_members').insert({ room_id: room.id, user_id: userId })
    setCurrentRoom(room)
    setCreating(false)
  }

  // Join an existing room
  async function handleJoinRoom() {
    if (!userId || joining || !joinCode.trim()) return
    setJoining(true)
    setError('')

    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', joinCode.trim().toUpperCase())
      .single()

    if (roomErr || !room) {
      setError('Room not found! Check the code and try again 🌸')
      setJoining(false)
      return
    }

    await supabase
      .from('room_members')
      .upsert({ room_id: room.id, user_id: userId }, { onConflict: 'room_id,user_id' })

    setCurrentRoom(room)
    setJoining(false)
  }

  // Leave room
  async function handleLeaveRoom() {
    if (!userId || !currentRoom) return
    await supabase
      .from('room_members')
      .delete()
      .eq('room_id', currentRoom.id)
      .eq('user_id', userId)
    setCurrentRoom(null)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf6f0] flex items-center justify-center">
        <p className="text-[#9a8878] text-sm">Loading… 🌿</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] flex justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Back button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#7a9e6e] text-sm font-medium mb-6"
        >
          ← Back to home
        </motion.button>

        {/* Bear */}
        <motion.div
          className="flex justify-center mb-5"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="80" height="90" viewBox="0 0 130 140" fill="none">
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
          </svg>
        </motion.div>

        <h1 className="text-xl font-bold text-[#3d2b1f] text-center mb-1">Partner Room 🌿</h1>
        <p className="text-sm text-[#9a8878] text-center mb-6">Connect with someone special ♥</p>

        {currentRoom ? (
          /* ── Already in a room ── */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
              <p className="text-xs text-[#9a8878] mb-2">Your room code</p>
              <div className="text-4xl font-bold text-[#7a9e6e] tracking-widest mb-3">
                {currentRoom.code}
              </div>
              <p className="text-xs text-[#b0a090] mb-4">Share this code with your partner 🐻</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigator.clipboard.writeText(currentRoom.code)}
                className="w-full bg-[#7a9e6e] text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                Copy Code 📋
              </motion.button>
            </div>

            <div className="bg-[#f5f0e8] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#9a8878]">Once your partner joins, go back home and your tasks will be shared! 🌸</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLeaveRoom}
              className="w-full text-center text-xs text-[#c8a882] py-2"
            >
              Leave this room
            </motion.button>
          </div>
        ) : (
          /* ── No room yet ── */
          <div className="space-y-4">

            {/* Create room */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-[#4a3728] text-sm mb-1">Create a room</h2>
              <p className="text-xs text-[#9a8878] mb-3">Start a new space and invite your partner</p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateRoom}
                disabled={creating}
                className="w-full bg-[#7a9e6e] disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                {creating ? 'Creating…' : 'Create Room 🌱'}
              </motion.button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e8dfd4]" />
              <span className="text-xs text-[#b0a090]">or</span>
              <div className="flex-1 h-px bg-[#e8dfd4]" />
            </div>

            {/* Join room */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h2 className="font-semibold text-[#4a3728] text-sm mb-1">Join a room</h2>
              <p className="text-xs text-[#9a8878] mb-3">Enter the code your partner shared</p>
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Enter code e.g. FERN42"
                maxLength={6}
                className="w-full text-sm bg-[#faf6f0] rounded-xl px-3 py-2.5 outline-none border border-[#e8dfd4] focus:border-[#7a9e6e] text-[#4a3728] placeholder:text-[#c8b8a2] transition-colors mb-3 text-center tracking-widest font-semibold"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinRoom}
                disabled={joining || !joinCode.trim()}
                className="w-full bg-[#c49070] disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                {joining ? 'Joining…' : 'Join Room 🐻'}
              </motion.button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#e07070] text-center"
              >
                {error}
              </motion.p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}