import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignIn(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // ── LOGIN GUARD: check record_status = 'ACTIVE' ──
    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', data.user.id)
      .single()

    if (!userRow || userRow.record_status.trim() !== 'ACTIVE') {
      await supabase.auth.signOut()
      setError('Your account is pending activation. Contact your administrator.')
      setLoading(false)
      return
    }

    navigate('/customers')
  }

  async function handleGoogleSignIn() {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden md:flex md:w-[48%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3db5 0%, #0f2580 60%, #0a1a6b 100%)' }}
      >
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v10l9 5 9-5V7L12 2z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">HopeCMS</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 mt-12">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Manage your customers.
          </h1>
          <h1 className="text-4xl font-extrabold leading-tight mb-6" style={{ color: '#60a5fa' }}>
            Empower your team.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            A unified platform for HOPE, Inc. to track customers, manage access, and keep every team member in sync.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 mt-6">
            {['ROLE-BASED ACCESS', 'REAL-TIME DATA', 'AUDIT-READY'].map((b) => (
              <span
                key={b}
                className="text-xs font-bold tracking-widest text-blue-200 border border-blue-400/40 rounded-full px-4 py-1.5"
              >
                {b}
              </span>
            ))}
          </div>

          {/* Dashboard preview card */}
          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-5">
            {/* Stat row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="h-2 bg-white/20 rounded mb-1 w-3/4" />
                <div className="text-white font-bold text-xl">248</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/20 rounded mb-1 w-2/4" />
                <div className="text-green-400 font-bold text-xl">↑ 12%</div>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-white/20 rounded mb-1 w-3/4" />
                <div className="text-white font-bold text-xl">₱84k</div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {['JD', 'MI', 'AS'].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-blue-500 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white"
                  >
                    {i}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-green-500 border-2 border-white/40 flex items-center justify-center text-xs font-bold text-white">
                  +8
                </div>
              </div>
            </div>

            {/* Bar chart mock */}
            <div className="flex items-end gap-1 h-12 mb-3">
              {[40, 65, 45, 80, 55, 70, 50, 85, 60, 75, 90, 65].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    background: i === 10 ? '#60a5fa' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>

            {/* Line chart mock */}
            <svg viewBox="0 0 200 40" className="w-full h-8 mb-3">
              <polyline
                points="0,35 30,28 60,20 90,15 120,18 150,10 180,5 200,8"
                fill="none"
                stroke="#60a5fa"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="180" cy="5" r="3" fill="#60a5fa" />
            </svg>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/40 flex items-center justify-center text-white text-xs font-bold">3</div>
                <div className="h-2 bg-white/20 rounded w-20" />
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                </svg>
                <div className="h-2 bg-white/30 rounded w-16" />
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-sm mt-8">Trusted by HOPE, Inc. operations team</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Sign in to your HopeCMS account to continue.</p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold tracking-widest text-gray-700 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold tracking-widest text-gray-700 uppercase">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create one
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            New accounts require administrator activation.
          </p>
        </div>
      </div>
    </div>
  )
}