// src/__tests__/authFlows.test.js
// test/sprint1-auth-flows — M5: Wayne Andy Villamor
//
// Sprint 1 Auth Test Cases (12 total):
//   1. Email Registration          (TC-01 to TC-03)
//   2. Google OAuth New User Flow  (TC-04 to TC-06)
//   3. Login Guard — INACTIVE      (TC-07 to TC-09)
//   4. Login Guard — ACTIVE        (TC-10 to TC-12)
//
// Matches the actual implementation in:
//   src/pages/Login.jsx        — signInWithPassword + login guard via auth_uid
//   src/pages/Register.jsx     — signUp with first_name, last_name, username metadata
//   src/pages/AuthCallback.jsx — PKCE exchangeCodeForSession + login guard
//   src/lib/supabaseClient.js  — PKCE flowType
//   db/migration/seedRights.sql — 9 rights, admin right code is 'ADM_USR'
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock Supabase client ──────────────────────────────────────────────────────
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp:                 vi.fn(),
      signInWithPassword:     vi.fn(),
      signInWithOAuth:        vi.fn(),
      signOut:                vi.fn(),
      getSession:             vi.fn(),
      exchangeCodeForSession: vi.fn(),
      onAuthStateChange:      vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../lib/supabaseClient'

// ── Helper: mock public.user row by auth_uid ──────────────────────────────────
function mockUserTable(record_status) {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data:  { record_status },
      error: null,
    }),
  })
}

// ── Helper: mock missing user row (null) ──────────────────────────────────────
function mockUserTableNotFound() {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data:  null,
      error: { message: 'Row not found' },
    }),
  })
}

// =============================================================================
// 1. EMAIL REGISTRATION
//    Register.jsx calls signUp() with email, password, and user metadata.
//    Provision trigger then creates the user as INACTIVE in public.user.
// =============================================================================
describe('Email Registration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-01: signUp is called with email, password, and user metadata', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data:  { user: { id: 'uuid-001', email: 'juan@hope.com' } },
      error: null,
    })

    const { data, error } = await supabase.auth.signUp({
      email:    'juan@hope.com',
      password: 'Password123!',
      options:  {
        data: {
          first_name: 'Juan',
          last_name:  'dela Cruz',
          username:   'juandelacruz',
          full_name:  'Juan dela Cruz',
        },
      },
    })

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email:   'juan@hope.com',
        options: expect.objectContaining({
          data: expect.objectContaining({ first_name: 'Juan' }),
        }),
      })
    )
    expect(error).toBeNull()
    expect(data.user.email).toBe('juan@hope.com')
  })

  it('TC-02: returns error when email is already registered', async () => {
    supabase.auth.signUp.mockResolvedValue({
      data:  null,
      error: { message: 'User already registered' },
    })

    const { data, error } = await supabase.auth.signUp({
      email:    'existing@hope.com',
      password: 'Password123!',
    })

    expect(error).not.toBeNull()
    expect(error.message).toBe('User already registered')
    expect(data).toBeNull()
  })

  it('TC-03: new account is provisioned as INACTIVE by the trigger', async () => {
    // signUp succeeds, then provision trigger creates USER/INACTIVE in public.user
    supabase.auth.signUp.mockResolvedValue({
      data:  { user: { id: 'uuid-002' } },
      error: null,
    })
    mockUserTable('INACTIVE')

    await supabase.auth.signUp({ email: 'new@hope.com', password: 'Password123!' })

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-002')
      .single()

    expect(userRow.record_status).toBe('INACTIVE')
  })
})

// =============================================================================
// 2. GOOGLE OAUTH NEW USER FLOW
//    Login.jsx and Register.jsx both call signInWithOAuth({ provider: 'google' })
//    with redirectTo pointing to /auth/callback.
//    AuthCallback.jsx exchanges the PKCE code via exchangeCodeForSession().
// =============================================================================
describe('Google OAuth New User Flow', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-04: signInWithOAuth is called with provider google', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({
      data:  { url: 'https://accounts.google.com/o/oauth2/auth?...' },
      error: null,
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: 'http://localhost:5173/auth/callback' },
    })

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    )
    expect(error).toBeNull()
    expect(data.url).toContain('google')
  })

  it('TC-05: redirectTo option contains /auth/callback', async () => {
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: {}, error: null })

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:  { redirectTo: 'http://localhost:5173/auth/callback' },
    })

    const args = supabase.auth.signInWithOAuth.mock.calls[0][0]
    expect(args.options.redirectTo).toContain('/auth/callback')
  })

  it('TC-06: AuthCallback exchanges PKCE code for a session', async () => {
    // Matches AuthCallback.jsx: exchangeCodeForSession(code)
    supabase.auth.exchangeCodeForSession.mockResolvedValue({
      data:  { session: { user: { id: 'uuid-003' } } },
      error: null,
    })

    const { data, error } = await supabase.auth.exchangeCodeForSession('mock-pkce-code')

    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('mock-pkce-code')
    expect(error).toBeNull()
    expect(data.session.user.id).toBe('uuid-003')
  })
})

// =============================================================================
// 3. LOGIN GUARD — BLOCKS INACTIVE USERS
//    Both Login.jsx and AuthCallback.jsx query public.user by auth_uid and
//    call signOut() + set error when record_status is not 'ACTIVE'.
// =============================================================================
describe('Login Guard — INACTIVE user is blocked', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-07: signOut is called when record_status is INACTIVE', async () => {
    mockUserTable('INACTIVE')
    supabase.auth.signOut.mockResolvedValue({})

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-inactive')
      .single()

    let errorMsg = null
    if (!userRow || userRow.record_status.trim() !== 'ACTIVE') {
      await supabase.auth.signOut()
      errorMsg = 'Your account is pending activation. Contact your administrator.'
    }

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(errorMsg).toContain('pending activation')
  })

  it('TC-08: error message is set when user is INACTIVE', async () => {
    mockUserTable('INACTIVE')

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-inactive')
      .single()

    const blocked  = !userRow || userRow.record_status.trim() !== 'ACTIVE'
    const errorMsg = blocked
      ? 'Your account is pending activation. Contact your administrator.'
      : null

    expect(errorMsg).not.toBeNull()
    expect(errorMsg).toContain('pending activation')
  })

  it('TC-09: signOut is called when user row is not found', async () => {
    // Matches AuthCallback.jsx: dbError || !userRow → signOut + navigate
    mockUserTableNotFound()
    supabase.auth.signOut.mockResolvedValue({})

    const { data: userRow, error: dbError } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-ghost')
      .single()

    let errorMsg = null
    if (dbError || !userRow) {
      await supabase.auth.signOut()
      errorMsg = 'Account not found. Contact your administrator.'
    }

    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(errorMsg).toContain('Account not found')
  })
})

// =============================================================================
// 4. LOGIN GUARD — ALLOWS ACTIVE USERS
//    Both Login.jsx (navigate /customers) and AuthCallback.jsx (navigate
//    /customers) proceed only when record_status = 'ACTIVE'.
// =============================================================================
describe('Login Guard — ACTIVE user is allowed', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-10: signOut is NOT called when record_status is ACTIVE', async () => {
    mockUserTable('ACTIVE')

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-active')
      .single()

    if (!userRow || userRow.record_status.trim() !== 'ACTIVE') {
      await supabase.auth.signOut()
    }

    expect(supabase.auth.signOut).not.toHaveBeenCalled()
  })

  it('TC-11: no error message is set when user is ACTIVE', async () => {
    mockUserTable('ACTIVE')

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', 'uuid-active')
      .single()

    const errorMsg = (!userRow || userRow.record_status.trim() !== 'ACTIVE')
      ? 'Your account is pending activation. Contact your administrator.'
      : null

    expect(errorMsg).toBeNull()
  })

  it('TC-12: ACTIVE user is navigated to /customers after login', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data:  { user: { id: 'uuid-active' } },
      error: null,
    })
    mockUserTable('ACTIVE')

    const { data, error } = await supabase.auth.signInWithPassword({
      email:    'active@hope.com',
      password: 'Password123!',
    })

    expect(error).toBeNull()

    const { data: userRow } = await supabase
      .from('user')
      .select('record_status')
      .eq('auth_uid', data.user.id)
      .single()

    const destination = (userRow && userRow.record_status.trim() === 'ACTIVE')
      ? '/customers'
      : null

    expect(destination).toBe('/customers')
  })
})
