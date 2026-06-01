'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type RoomMember = {
  user_id: string
  joined_at: string
  profiles: { username: string }
}

export default function RoomPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [currentRoom, setCurrentRoom] = useState<{ id: string; code: string } | null>(null)
  const [members, setMembers] = useState<RoomMember[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.push('/login'); return }
      const uid = data.session.user.id
      setUserId(uid)

      const { data: membership } = await supabase
        .from('room_members')
        .select('room_id, rooms(id, code)')
        .eq('user_id', uid)
        .single()

      if (membership?.rooms) {
        const room = membership.rooms as unknown as { id: string; code: string }
        setCurrentRoom(room)
        await loadMembers(room.id)
      }
      setLoading(false)
    })
  }, [router])

  async function loadMembers(roomId: string) {
  const { data: memberData } = await supabase
    .from('room_members')
    .select('user_id, joined_at')
    .eq('room_id', roomId)

  if (!memberData) return

  const membersWithProfiles = await Promise.all(
    memberData.map(async (m) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', m.user_id)
        .single()
      return { ...m, profiles: profile ?? { username: 'Unknown' } }
    })
  )
  setMembers(membersWithProfiles)
}

  function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

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
    if (roomErr) { setError('Could not create room. Try again!'); setCreating(false); return }
    await supabase.from('room_members').insert({ room_id: room.id, user_id: userId })
    setCurrentRoom(room)
    await loadMembers(room.id)
    setCreating(false)
  }

  async function handleJoinRoom() {
    if (!userId || joining || !joinCode.trim()) return
    setJoining(true)
    setError('')
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', joinCode.trim().toUpperCase())
      .single()
    if (roomErr || !room) { setError('Room not found! Check the code 🌸'); setJoining(false); return }
    await supabase.from('room_members').upsert({ room_id: room.id, user_id: userId }, { onConflict: 'room_id,user_id' })
    setCurrentRoom(room)
    await loadMembers(room.id)
    setJoining(false)
  }

  async function handleLeaveRoom() {
    if (!userId || !currentRoom) return
    await supabase.from('room_members').delete().eq('room_id', currentRoom.id).eq('user_id', userId)
    setCurrentRoom(null)
    setMembers([])
  }

  async function handleCopy() {
    if (!currentRoom) return
    await navigator.clipboard.writeText(currentRoom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const partner = members.find(m => m.user_id !== userId)
  const me = members.find(m => m.user_id === userId)
  const daysConnected = me ? Math.floor((new Date().getTime() - new Date(me.joined_at).getTime()) / (1000 * 60 * 60 * 24)) : 0

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

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-[#7a9e6e] text-sm font-medium mb-6"
        >
          ← Back to home
        </motion.button>

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
          </svg>
        </motion.div>

        <h1 className="text-xl font-bold text-[#3d2b1f] text-center mb-1">Partner Room 🌿</h1>
        <p className="text-sm text-[#9a8878] text-center mb-6">Your cozy shared space ♥</p>

        {currentRoom ? (
          <div className="space-y-4">

            {/* Connection status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${partner ? 'bg-[#7a9e6e]' : 'bg-[#e8c44a]'}`} />
                <span className="text-xs font-medium text-[#7a6652]">
                  {partner ? 'Connected 🌿' : 'Waiting for partner…'}
                </span>
              </div>

              {/* Members */}
              <div className="flex gap-3 justify-center">
                {members.map(member => (
                  <motion.div
                    key={member.user_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-14 h-14 bg-[#f5e6d3] rounded-2xl flex items-center justify-center text-2xl border-2 border-[#e8d5c0]">
                      {member.user_id === userId ? '🐻' : '🌸'}
                    </div>
                    <span className="text-xs font-medium text-[#4a3728]">
                      {member.profiles?.username ?? 'Unknown'}
                    </span>
                    <span className="text-xs text-[#9a8878]">
                      {member.user_id === userId ? 'You' : 'Partner'}
                    </span>
                  </motion.div>
                ))}

                {/* Empty partner slot */}
                {!partner && (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 bg-[#f5f0e8] rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed border-[#d8cfc4]">
                      🌸
                    </div>
                    <span className="text-xs text-[#b0a090]">Waiting…</span>
                  </div>
                )}
              </div>

              {/* Days together */}
              {partner && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 text-center bg-[#faf6f0] rounded-xl py-2"
                >
                  <p className="text-xs text-[#e07070] font-medium">♥ {daysConnected} days together</p>
                </motion.div>
              )}
            </div>

            {/* Room code */}
            <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
              <p className="text-xs text-[#9a8878] mb-1">Room code</p>
              <div className="text-3xl font-bold text-[#7a9e6e] tracking-widest mb-3">
                {currentRoom.code}
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCopy}
                className="w-full bg-[#7a9e6e] text-white rounded-xl py-2.5 text-sm font-semibold"
              >
                {copied ? 'Copied! ✓' : 'Copy Code 📋'}
              </motion.button>
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
          <div className="space-y-4">
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

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e8dfd4]" />
              <span className="text-xs text-[#b0a090]">or</span>
              <div className="flex-1 h-px bg-[#e8dfd4]" />
            </div>

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
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#e07070] text-center">
                {error}
              </motion.p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}