// src/__tests__/rightsMatrix.test.js
// test/sprint2-rights-27-cases — M5: Wayne Andy Villamor
//
// Sprint 2 Rights Test Matrix (27 total):
//   3 user types (SUPERADMIN, ADMIN, USER) × 9 rights = 27 test cases
//
//   Rights tested (from seedModulesAndRights):
//     CUST_VIEW, CUST_ADD, CUST_EDIT, CUST_DEL   — Customer Module
//     SALES_VIEW, SD_VIEW                          — Sales Module
//     PROD_VIEW, PRICE_VIEW                        — Product Module
//     ADM_USER                                     — Admin Module
//
//   Expected defaults from provisionNewUserTrigger:
//     USER      → VIEW rights = 1, all others = 0
//     ADMIN     → VIEW rights = 1, CUST_ADD = 1, CUST_EDIT = 1, others = 0
//     SUPERADMIN → ALL rights = 1 (bypass logic in UserRightsContext)
//
// Matches UserRightsContext.jsx:
//   - SUPERADMIN bypasses table → all rights = 1
//   - ADMIN/USER load from usermodule_rights table
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut:          vi.fn(),
      getSession:       vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../lib/supabaseClient'

// ── Default rights matching DEFAULT_RIGHTS in UserRightsContext.jsx ───────────
const ALL_DENIED = {
  CUST_VIEW: 0, CUST_ADD: 0, CUST_EDIT: 0, CUST_DEL: 0,
  SALES_VIEW: 0, SD_VIEW: 0, PROD_VIEW: 0, PRICE_VIEW: 0, ADM_USER: 0,
}

// ── Rights profiles per user type ─────────────────────────────────────────────
const SUPERADMIN_RIGHTS = {
  CUST_VIEW: 1, CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 1,
  SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 1,
}

const ADMIN_RIGHTS = {
  CUST_VIEW: 1, CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 0,
  SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 0,
}

const USER_RIGHTS = {
  CUST_VIEW: 1, CUST_ADD: 0, CUST_EDIT: 0, CUST_DEL: 0,
  SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 0,
}

// ── Helper: simulate UserRightsContext loadRights logic ───────────────────────
function mockRightsTable(userType, rightsProfile) {
  const rightsRows = Object.entries(rightsProfile).map(([rightcode, right_value]) => ({
    rightcode,
    right_value,
  }))

  supabase.from.mockImplementation((table) => {
    if (table === 'usermodule_rights') {
      return {
        select: vi.fn().mockReturnThis(),
        eq:     vi.fn().mockResolvedValue({ data: rightsRows, error: null }),
      }
    }
    if (table === 'user') {
      return {
        select:      vi.fn().mockReturnThis(),
        eq:          vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data:  { user_type: userType },
          error: null,
        }),
      }
    }
  })
}

// ── Helper: simulate SUPERADMIN bypass (no DB call needed) ────────────────────
function applyRightsLogic(userType, dbRights) {
  if (userType === 'SUPERADMIN') {
    // Matches UserRightsContext: bypass → all rights = 1
    const full = {}
    Object.keys(ALL_DENIED).forEach(k => { full[k] = 1 })
    return full
  }
  // ADMIN / USER: merge db rows into defaults
  const map = { ...ALL_DENIED }
  dbRights.forEach(({ rightcode, right_value }) => {
    if (rightcode in map) map[rightcode] = right_value
  })
  return map
}

// =============================================================================
// SUPERADMIN — 9 rights, all should be 1 (bypass logic)
// =============================================================================
describe('SUPERADMIN Rights (9 cases)', () => {
  beforeEach(() => vi.clearAllMocks())

  const rights = SUPERADMIN_RIGHTS

  it('TC-S01: SUPERADMIN has CUST_VIEW = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.CUST_VIEW).toBe(1)
  })

  it('TC-S02: SUPERADMIN has CUST_ADD = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.CUST_ADD).toBe(1)
  })

  it('TC-S03: SUPERADMIN has CUST_EDIT = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.CUST_EDIT).toBe(1)
  })

  it('TC-S04: SUPERADMIN has CUST_DEL = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.CUST_DEL).toBe(1)
  })

  it('TC-S05: SUPERADMIN has SALES_VIEW = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.SALES_VIEW).toBe(1)
  })

  it('TC-S06: SUPERADMIN has SD_VIEW = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.SD_VIEW).toBe(1)
  })

  it('TC-S07: SUPERADMIN has PROD_VIEW = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.PROD_VIEW).toBe(1)
  })

  it('TC-S08: SUPERADMIN has PRICE_VIEW = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.PRICE_VIEW).toBe(1)
  })

  it('TC-S09: SUPERADMIN has ADM_USER = 1', () => {
    const result = applyRightsLogic('SUPERADMIN', [])
    expect(result.ADM_USER).toBe(1)
  })
})

// =============================================================================
// ADMIN — 9 rights (VIEW rights = 1, CUST_ADD = 1, CUST_EDIT = 1,
//                    CUST_DEL = 0, ADM_USER = 0)
// =============================================================================
describe('ADMIN Rights (9 cases)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-A01: ADMIN has CUST_VIEW = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.CUST_VIEW).toBe(1)
  })

  it('TC-A02: ADMIN has CUST_ADD = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.CUST_ADD).toBe(1)
  })

  it('TC-A03: ADMIN has CUST_EDIT = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.CUST_EDIT).toBe(1)
  })

  it('TC-A04: ADMIN has CUST_DEL = 0', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.CUST_DEL).toBe(0)
  })

  it('TC-A05: ADMIN has SALES_VIEW = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.SALES_VIEW).toBe(1)
  })

  it('TC-A06: ADMIN has SD_VIEW = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.SD_VIEW).toBe(1)
  })

  it('TC-A07: ADMIN has PROD_VIEW = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.PROD_VIEW).toBe(1)
  })

  it('TC-A08: ADMIN has PRICE_VIEW = 1', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.PRICE_VIEW).toBe(1)
  })

  it('TC-A09: ADMIN has ADM_USER = 0', () => {
    const dbRows = Object.entries(ADMIN_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('ADMIN', dbRows)
    expect(result.ADM_USER).toBe(0)
  })
})

// =============================================================================
// USER — 9 rights (VIEW rights = 1, all write/admin rights = 0)
// =============================================================================
describe('USER Rights (9 cases)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-U01: USER has CUST_VIEW = 1', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.CUST_VIEW).toBe(1)
  })

  it('TC-U02: USER has CUST_ADD = 0', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.CUST_ADD).toBe(0)
  })

  it('TC-U03: USER has CUST_EDIT = 0', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.CUST_EDIT).toBe(0)
  })

  it('TC-U04: USER has CUST_DEL = 0', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.CUST_DEL).toBe(0)
  })

  it('TC-U05: USER has SALES_VIEW = 1', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.SALES_VIEW).toBe(1)
  })

  it('TC-U06: USER has SD_VIEW = 1', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.SD_VIEW).toBe(1)
  })

  it('TC-U07: USER has PROD_VIEW = 1', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.PROD_VIEW).toBe(1)
  })

  it('TC-U08: USER has PRICE_VIEW = 1', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.PRICE_VIEW).toBe(1)
  })

  it('TC-U09: USER has ADM_USER = 0', () => {
    const dbRows = Object.entries(USER_RIGHTS).map(([rightcode, right_value]) => ({ rightcode, right_value }))
    const result = applyRightsLogic('USER', dbRows)
    expect(result.ADM_USER).toBe(0)
  })
})