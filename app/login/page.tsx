'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    const trimmedUsername = username.trim()

    if (!trimmedEmail || !trimmedPassword) {
      setError('Please fill in all fields 🌸')
      return
    }
    if (isSignUp && !trimmedUsername) {
      setError('Please enter a username 🌸')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    if (isSignUp) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: trimmedUsername,
        })
        setSuccess('Account created! Logging you in 🌿')
        // Auto login after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPassword,
        })
        if (!loginError) {
          router.push('/')
          return
        }
      }
      setIsSignUp(false)
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      })
      if (loginError) {
        setError(loginError.message)
      } else {
        router.push('/')
      }
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#faf6f0] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Bear */}
        <motion.div
          className="flex justify-center mb-6"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="100" height="110" viewBox="0 0 130 140" fill="none">
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

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#3d2b1f]">Welcome to Fern 🌿</h1>
          <p className="text-sm text-[#7a6652] mt-1">
            {isSignUp ? 'Create your cozy space' : 'Come back, I missed you ♥'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">

          {/* Username - only on signup */}
          {isSignUp && (
            <div className="mb-3">
              <label className="text-xs font-medium text-[#7a6652] mb-1 block">Your name</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. Nira"
                className="w-full text-sm bg-[#faf6f0] rounded-xl px-3 py-2.5 outline-none border border-[#e8dfd4] focus:border-[#7a9e6e] text-[#4a3728] placeholder:text-[#c8b8a2] transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div className="mb-3">
            <label className="text-xs font-medium text-[#7a6652] mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="your@email.com"
              className="w-full text-sm bg-[#faf6f0] rounded-xl px-3 py-2.5 outline-none border border-[#e8dfd4] focus:border-[#7a9e6e] text-[#4a3728] placeholder:text-[#c8b8a2] transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-medium text-[#7a6652] mb-1 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="w-full text-sm bg-[#faf6f0] rounded-xl px-3 py-2.5 outline-none border border-[#e8dfd4] focus:border-[#7a9e6e] text-[#4a3728] placeholder:text-[#c8b8a2] transition-colors"
            />
          </div>

          {/* Error / Success */}
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#e07070] mb-3 text-center">
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#7a9e6e] mb-3 text-center">
              {success}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#7a9e6e] disabled:opacity-60 text-white rounded-xl py-2.5 text-sm font-semibold transition-opacity"
          >
            {loading ? '…' : isSignUp ? 'Create Account 🌱' : 'Log In 🐻'}
          </motion.button>

          {/* Toggle */}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess('') }}
            className="w-full text-center text-xs text-[#9a8878] mt-3 hover:text-[#7a9e6e] transition-colors"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </main>
  )
}