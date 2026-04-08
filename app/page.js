'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Leaf, Mail, Lock, ArrowRight, Sprout, Users, BarChart3 } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const router = useRouter()

  async function handleAuth() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!email || !password) {
        setError('Please fill in all fields.')
        return
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          const msg = (error.message || '').toLowerCase()
          if (msg.includes('invalid login credentials')) {
            setError('Invalid login credentials. If you just signed up, verify your email from inbox/spam before logging in.')
          } else {
            setError(error.message)
          }
        }
        else router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setError(error.message)
        else setMessage('Account created! Check your email to confirm, then log in.')
      }
    } catch (err) {
      const message = err?.message || ''
      if (message.toLowerCase().includes('failed to fetch')) {
        setError('Cannot reach Supabase right now. Check NEXT_PUBLIC_SUPABASE_URL, your internet/DNS, and restart the dev server after env changes.')
      } else {
        setError('Unexpected error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError('Enter your email first to resend confirmation.')
      return
    }

    setResending(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage('Confirmation email sent. Check inbox and spam, then log in.')
      }
    } catch {
      setError('Could not resend confirmation email right now. Please try again.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex">

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-green-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="text-xl font-semibold">Urban Rooftop Network</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-6">
            Transform your rooftop into a<br />
            <span className="text-green-300">green revolution.</span>
          </h1>
          <p className="text-green-100 text-lg leading-relaxed max-w-md">
            Connect with gardeners, share spaces, reduce waste, and grow food — all within your city.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4">
          {[
            { icon: MapPin2, label: 'Space Matching', desc: 'Find & list rooftop spaces near you' },
            { icon: Sprout, label: 'AI Crop Advisor', desc: 'Get crop suggestions for your rooftop' },
            { icon: BarChart3, label: 'Live Impact', desc: 'Track food grown & CO₂ saved' },
            { icon: Users, label: 'Community', desc: 'Trade harvests & schedule compost' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Icon size={16} className="text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-green-200 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-semibold text-green-800">Urban Rooftop Network</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm mb-8">
              {isLogin ? 'Sign in to your account to continue.' : 'Join the urban farming movement today.'}
            </p>

            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setIsLogin(true); setError(''); setMessage('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); setMessage('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  !isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAuth()}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAuth()}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Error / Success */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
                {message}
              </div>
            )}

            {isLogin && (
              <button
                onClick={handleResendConfirmation}
                disabled={resending}
                className="mb-4 text-xs text-green-700 hover:text-green-800 underline underline-offset-2 disabled:opacity-60"
              >
                {resending ? 'Sending confirmation...' : 'Resend confirmation email'}
              </button>
            )}

            {/* Submit */}
            <button
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-6">
              By continuing, you agree to our terms of service and privacy policy.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { val: '2,400+', label: 'Rooftops listed' },
              { val: '18 tons', label: 'Food grown' },
              { val: '6.2 tons', label: 'CO₂ saved' },
            ].map(({ val, label }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="font-bold text-green-700 text-base">{val}</p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// inline icon component since MapPin2 isn't in lucide
function MapPin2({ size, className }) {
  return <MapPin size={size} className={className} />
}

import { MapPin } from 'lucide-react'