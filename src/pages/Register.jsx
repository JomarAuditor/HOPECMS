import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

// ── helpers ────────────────────────────────────────────────────────────────
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Field({ label, error: err, children }) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-widest text-gray-700 uppercase mb-2">
        {label}
      </label>
      {children}
      {err && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8"  x2="12"    y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {err}
        </p>
      )}
    </div>
  )
}

// ── component ──────────────────────────────────────────────────────────────
export default function Register() {
  const [firstName, setFirstName]           = useState('')
  const [lastName, setLastName]             = useState('')
  const [username, setUsername]             = useState('')
  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [showPassword, setShowPassword]     = useState(false)
  const [loading, setLoading]               = useState(false)
  const [error, setError]                   = useState('')
  const [fieldErrors, setFieldErrors]       = useState({})
  const [success, setSuccess]               = useState(false)

  // ── validation ────────────────────────────────────────────────────────
  function validate() {
    const errs = {}
    if (!firstName.trim())            errs.firstName = 'First name is required.'
    if (!lastName.trim())             errs.lastName  = 'Last name is required.'
    if (!username.trim())             errs.username  = 'Username is required.'
    else if (username.includes(' '))  errs.username  = 'Username cannot contain spaces.'
    else if (username.length < 3)     errs.username  = 'Username must be at least 3 characters.'
    if (!email.trim())                errs.email     = 'Email address is required.'
    else if (!validateEmail(email))   errs.email     = 'Please enter a valid email address.'
    if (!password)                    errs.password  = 'Password is required.'
    else if (password.length < 8)     errs.password  = 'Password must be at least 8 characters.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── clear individual field error on change ────────────────────────────
  function clearError(field) {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // ── register with email ───────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name:  lastName,
          username:   username,
          full_name:  `${firstName} ${lastName}`,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  // ── google oauth ──────────────────────────────────────────────────────
  async function handleGoogleRegister() {
    setError('')
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (authError) setError(authError.message)
  }

  // ── success state ─────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#dbeafe' }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>.
            Your account will be activated by an administrator after verification.
          </p>
          <Link to="/login" className="text-sm font-bold text-blue-600 hover:underline">
            Back to Sign in
          </Link>
        </div>
      </div>
    )
  }

  const inputClass = (hasError) =>
    `w-full border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
     ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">

      {/* ── Left branding panel ── */}
      <div
        className="hidden md:flex md:w-[48%] flex-col justify-between p-10 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a3db5 0%, #0f2580 60%, #0a1a6b 100%)' }}
      >
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M12 2v20M3 7l9 5 9-5"         stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">HopeCMS</span>
        </div>

        {/* headline */}
        <div className="relative z-10 mt-12">
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-3">
            Join your team on HopeCMS.
          </h1>
          <h1 className="text-4xl font-extrabold leading-tight mb-6" style={{ color: '#60a5fa' }}>
            Get started today.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed max-w-sm">
            Create your account to access the unified platform for HOPE, Inc. —
            customer tracking, team management, and real-time data at your fingertips.
          </p>

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

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-5 space-y-3">
            {[
              {
                label: 'Manage customer records and history',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
              {
                label: 'Real-time sales and performance data',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4"  />
                    <line x1="6"  y1="20" x2="6"  y2="14" />
                  </svg>
                ),
              },
              {
                label: 'Secure, role-based team access',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
              },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-blue-300">{icon}</span>
                <span className="text-blue-100 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-300 text-sm mt-8">
          Trusted by HOPE, Inc. operations team
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">Create an account</h2>
          <p className="text-gray-500 text-sm mb-8">Sign up to request access to HopeCMS.</p>

          {/* global error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8"  x2="12"    y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} noValidate className="space-y-4">

            {/* First Name + Last Name side by side */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" error={fieldErrors.firstName}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); clearError('firstName') }}
                  placeholder="Juan"
                  autoComplete="given-name"
                  className={inputClass(fieldErrors.firstName)}
                />
              </Field>
              <Field label="Last Name" error={fieldErrors.lastName}>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); clearError('lastName') }}
                  placeholder="dela Cruz"
                  autoComplete="family-name"
                  className={inputClass(fieldErrors.lastName)}
                />
              </Field>
            </div>

            {/* Username */}
            <Field label="Username" error={fieldErrors.username}>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); clearError('username') }}
                placeholder="juandelacruz"
                autoComplete="username"
                className={inputClass(fieldErrors.username)}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address" error={fieldErrors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                placeholder="name@company.com"
                autoComplete="email"
                className={inputClass(fieldErrors.email)}
              />
            </Field>

            {/* Password */}
            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={inputClass(fieldErrors.password) + ' pr-12'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide transition disabled:opacity-60 mt-2"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Register with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="text-center text-xs text-gray-400 mt-2 flex items-center justify-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8"  x2="12"    y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            New accounts require administrator activation.
          </p>

        </div>
      </div>
    </div>
  )
}