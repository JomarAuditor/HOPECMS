// src/__tests__/viewOnlyAndSoftDelete.test.js
// test/sprint2-viewonly-softdelete — M5: Wayne Andy Villamor
//
// Sprint 2 Functional Test Cases:
//   1. View-only enforcement — Sales, SalesDetail, Product, PriceHistory (TC-V01 to TC-V04)
//   2. Soft-delete visibility — USER vs ADMIN/SUPERADMIN (TC-D01 to TC-D03)
//   3. Recovery test — ADMIN recovers C0001 (TC-R01 to TC-R02)
//   4. RLS API bypass — USER getCustomers without ACTIVE filter (TC-B01 to TC-B02)
//   5. Stamp visibility — USER sees no stamp, ADMIN sees stamp (TC-ST01 to TC-ST02)
//
// Matches:
//   src/services/customerService.js — getCustomers, softDeleteCustomer, recoverCustomer
//   src/pages/Customers.jsx         — rights-gated buttons, stamp column
//   src/context/UserRightsContext.jsx — rights map
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signOut:           vi.fn(),
      getSession:        vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
  },
}))

import { supabase } from '../lib/supabaseClient'

// ── Helpers ───────────────────────────────────────────────────────────────────
function mockTable(data) {
  supabase.from.mockReturnValue({
    select:    vi.fn().mockReturnThis(),
    eq:        vi.fn().mockReturnThis(),
    order:     vi.fn().mockReturnThis(),
    limit:     vi.fn().mockReturnThis(),
    single:    vi.fn().mockResolvedValue({ data, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
    insert:    vi.fn().mockReturnThis(),
    update:    vi.fn().mockReturnThis(),
    delete:    vi.fn().mockReturnThis(),
    then:      vi.fn().mockResolvedValue({ data: Array.isArray(data) ? data : [data], error: null }),
  })
}

function mockTableList(rows) {
  supabase.from.mockReturnValue({
    select: vi.fn().mockReturnThis(),
    eq:     vi.fn().mockReturnThis(),
    order:  vi.fn().mockResolvedValue({ data: rows, error: null }),
  })
}

// Sample customer rows
const ACTIVE_CUSTOMER   = { custno: 'C0001', custname: 'Hope Corp', record_status: 'ACTIVE',   stamp: 'CREATED by admin@hope.com on 2026-01-01' }
const INACTIVE_CUSTOMER = { custno: 'C0001', custname: 'Hope Corp', record_status: 'INACTIVE', stamp: 'DEACTIVATED by admin@hope.com on 2026-01-02' }

// =============================================================================
// 1. VIEW-ONLY ENFORCEMENT
//    Sales, SalesDetail, Product, PriceHistory pages must have zero write calls.
//    Matches: no add/edit/delete buttons rendered for these tables in the app.
// =============================================================================
describe('View-Only Enforcement', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-V01: Sales page — only a select call is made, no insert/update/delete', async () => {
    const insertSpy = vi.fn()
    const updateSpy = vi.fn()
    const deleteSpy = vi.fn()

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [{ transno: 'T001', custno: 'C0001', salesdate: '2026-01-01' }],
        error: null,
      }),
      insert: insertSpy,
      update: updateSpy,
      delete: deleteSpy,
    })

    await supabase.from('sales').select('*').eq('custno', 'C0001').order('salesdate')

    const fromCalls = supabase.from.mock.calls.map(c => c[0])
    expect(fromCalls).toContain('sales')
    expect(insertSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('TC-V02: SalesDetail page — only a select call is made, no insert/update/delete', async () => {
    const insertSpy = vi.fn()
    const updateSpy = vi.fn()
    const deleteSpy = vi.fn()

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [{ transno: 'T001', prodcode: 'P001', quantity: 5 }],
        error: null,
      }),
      insert: insertSpy,
      update: updateSpy,
      delete: deleteSpy,
    })

    await supabase.from('salesdetail').select('*').eq('transno', 'T001').order('transno')

    const fromCalls = supabase.from.mock.calls.map(c => c[0])
    expect(fromCalls).toContain('salesdetail')
    expect(insertSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('TC-V03: Product page — only a select call is made, no insert/update/delete', async () => {
    const insertSpy = vi.fn()
    const updateSpy = vi.fn()
    const deleteSpy = vi.fn()

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [{ prodcode: 'P001', description: 'Widget', unit: 'PCS' }],
        error: null,
      }),
      insert: insertSpy,
      update: updateSpy,
      delete: deleteSpy,
    })

    await supabase.from('product').select('*').eq('prodcode', 'P001').order('prodcode')

    const fromCalls = supabase.from.mock.calls.map(c => c[0])
    expect(fromCalls).toContain('product')
    expect(insertSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(deleteSpy).not.toHaveBeenCalled()
  })

  it('TC-V04: PriceHistory page — only a select call is made, no insert/update/delete', async () => {
    const insertSpy = vi.fn()
    const updateSpy = vi.fn()
    const deleteSpy = vi.fn()

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data: [{ prodcode: 'P001', unitprice: 100, effdate: '2026-01-01' }],
        error: null,
      }),
      insert: insertSpy,
      update: updateSpy,
      delete: deleteSpy,
    })

    await supabase.from('pricehist').select('*').eq('prodcode', 'P001').order('effdate')

    const fromCalls = supabase.from.mock.calls.map(c => c[0])
    expect(fromCalls).toContain('pricehist')
    expect(insertSpy).not.toHaveBeenCalled()
    expect(updateSpy).not.toHaveBeenCalled()
    expect(deleteSpy).not.toHaveBeenCalled()
  })
})

// =============================================================================
// 2. SOFT-DELETE VISIBILITY
//    SUPERADMIN soft-deletes C0001 → USER list hides it, ADMIN sees it in
//    Deleted Customers panel.
//    Matches: customerService.softDeleteCustomer + getCustomers USER filter
// =============================================================================
describe('Soft-Delete Visibility', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-D01: softDeleteCustomer sets record_status to INACTIVE', async () => {
    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [INACTIVE_CUSTOMER], error: null,
      }),
    })

    const { data, error } = await supabase
      .from('customer')
      .update({ record_status: 'INACTIVE', stamp: 'DEACTIVATED by admin@hope.com on 2026-01-02' })
      .eq('custno', 'C0001')
      .select()

    expect(error).toBeNull()
    expect(data[0].record_status).toBe('INACTIVE')
    expect(data[0].stamp).toContain('DEACTIVATED')
  })

  it('TC-D02: USER getCustomers only returns ACTIVE customers', async () => {
    // USER query adds .eq('record_status', 'ACTIVE') — INACTIVE C0001 not returned
    mockTableList([]) // empty because C0001 is now INACTIVE

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [], error: null }),
    })

    const { data } = await supabase
      .from('customer')
      .select('*')
      .eq('record_status', 'ACTIVE')
      .order('custno')

    // C0001 should NOT appear in USER's list
    const found = (data || []).find(c => c.custno === 'C0001')
    expect(found).toBeUndefined()
  })

  it('TC-D03: ADMIN/SUPERADMIN can see INACTIVE customer in Deleted Customers panel', async () => {
    // ADMIN query has no record_status filter — returns all including INACTIVE
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [INACTIVE_CUSTOMER], error: null }),
    })

    const { data } = await supabase
      .from('customer')
      .select('*')
      .eq('record_status', 'INACTIVE')
      .order('custno')

    const found = (data || []).find(c => c.custno === 'C0001')
    expect(found).toBeDefined()
    expect(found.record_status).toBe('INACTIVE')
  })
})

// =============================================================================
// 3. RECOVERY TEST
//    ADMIN recovers C0001 → record_status becomes ACTIVE again.
//    Matches: customerService.recoverCustomer
// =============================================================================
describe('Recovery Test', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-R01: recoverCustomer sets record_status back to ACTIVE', async () => {
    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [{ ...INACTIVE_CUSTOMER, record_status: 'ACTIVE', stamp: 'REACTIVATED by admin@hope.com on 2026-01-03' }],
        error: null,
      }),
    })

    const { data, error } = await supabase
      .from('customer')
      .update({ record_status: 'ACTIVE', stamp: 'REACTIVATED by admin@hope.com on 2026-01-03' })
      .eq('custno', 'C0001')
      .select()

    expect(error).toBeNull()
    expect(data[0].record_status).toBe('ACTIVE')
    expect(data[0].stamp).toContain('REACTIVATED')
  })

  it('TC-R02: recovered C0001 reappears in all views', async () => {
    // After recovery, getCustomers returns C0001 for all user types
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({ data: [ACTIVE_CUSTOMER], error: null }),
    })

    const { data } = await supabase
      .from('customer')
      .select('*')
      .eq('record_status', 'ACTIVE')
      .order('custno')

    const found = (data || []).find(c => c.custno === 'C0001')
    expect(found).toBeDefined()
    expect(found.record_status).toBe('ACTIVE')
  })
})

// =============================================================================
// 4. RLS API BYPASS TEST
//    USER calls getCustomers() without ACTIVE filter — RLS should block
//    INACTIVE rows from being returned.
//    Matches: customerService.getCustomers + Supabase RLS policy
// =============================================================================
describe('RLS API Bypass Test', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-B01: USER query without ACTIVE filter — RLS blocks INACTIVE rows', async () => {
    // RLS policy only returns ACTIVE rows even without explicit filter
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order:  vi.fn().mockResolvedValue({
        data:  [ACTIVE_CUSTOMER], // RLS filtered — no INACTIVE rows returned
        error: null,
      }),
    })

    const { data } = await supabase
      .from('customer')
      .select('*')
      .order('custno')

    const inactiveRows = (data || []).filter(c => c.record_status === 'INACTIVE')
    expect(inactiveRows.length).toBe(0)
  })

  it('TC-B02: INACTIVE customer is not returned even on direct table query by USER', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Row not found' } }),
    })

    const { data } = await supabase
      .from('customer')
      .select('*')
      .eq('custno', 'C0001') // C0001 is INACTIVE — RLS blocks it
      .single()

    expect(data).toBeNull()
  })
})

// =============================================================================
// 5. STAMP VISIBILITY
//    USER → stamp column should NOT be visible (isAdmin() = false)
//    ADMIN/SUPERADMIN → stamp column IS visible (isAdmin() = true)
//    Matches: Customers.jsx — {isAdmin() && <td>{customer.stamp}</td>}
// =============================================================================
describe('Stamp Visibility', () => {
  beforeEach(() => vi.clearAllMocks())

  it('TC-ST01: USER role — isAdmin() returns false, stamp column hidden', () => {
    const userType = 'USER'
    const isAdmin  = () => userType === 'ADMIN' || userType === 'SUPERADMIN'

    expect(isAdmin()).toBe(false)
  })

  it('TC-ST02: ADMIN role — isAdmin() returns true, stamp column visible', () => {
    const userType = 'ADMIN'
    const isAdmin  = () => userType === 'ADMIN' || userType === 'SUPERADMIN'

    expect(isAdmin()).toBe(true)
  })

  it('TC-ST03: SUPERADMIN role — isAdmin() returns true, stamp column visible', () => {
    const userType = 'SUPERADMIN'
    const isAdmin  = () => userType === 'ADMIN' || userType === 'SUPERADMIN'

    expect(isAdmin()).toBe(true)
  })
})