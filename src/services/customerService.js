import { supabase } from '../lib/supabaseClient'

function makeStamp(action, userEmail) {
  const now = new Date().toISOString().split('T')[0]
  return `${action} by ${userEmail} on ${now}`
}

// ── Customer Services ──────────────────────────────────────────────────────

export async function getCustomers(userId) {
  try {
    const { data: userData } = await supabase
      .from('user')
      .select('user_type')
      .eq('userid', userId)
      .single()

    const userType = userData?.user_type || 'USER'

    let query = supabase.from('customer').select('*').order('custno')
    if (userType === 'USER') query = query.eq('record_status', 'ACTIVE')

    const { data, error } = await query
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getCustomers:', error)
    return []
  }
}

export async function addCustomer(customerData, userEmail) {
  const { data, error } = await supabase
    .from('customer')
    .insert([{
      custno: customerData.custno,
      custname: customerData.custname,
      address: customerData.address || '',
      payterm: customerData.payterm,
      record_status: 'ACTIVE',
      stamp: makeStamp('CREATED', userEmail),
    }])
    .select()
  if (error) throw error
  return data[0]
}

export async function updateCustomer(custno, customerData, userEmail) {
  const { data, error } = await supabase
    .from('customer')
    .update({
      custname: customerData.custname,
      address: customerData.address,
      payterm: customerData.payterm,
      stamp: makeStamp('UPDATED', userEmail),
    })
    .eq('custno', custno)
    .select()
  if (error) throw error
  return data[0]
}

export async function softDeleteCustomer(custno, userEmail) {
  const { data, error } = await supabase
    .from('customer')
    .update({
      record_status: 'INACTIVE',
      stamp: makeStamp('DEACTIVATED', userEmail),
    })
    .eq('custno', custno)
    .select()
  if (error) throw error
  return data[0]
}

export async function recoverCustomer(custno, userEmail) {
  const { data, error } = await supabase
    .from('customer')
    .update({
      record_status: 'ACTIVE',
      stamp: makeStamp('REACTIVATED', userEmail),
    })
    .eq('custno', custno)
    .select()
  if (error) throw error
  return data[0]
}

// ── Sales Services (read-only) ─────────────────────────────────────────────

export async function getSalesByCustomer(custNo) {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('custno', custNo)
    .order('salesdate', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getSalesDetail(transNo) {
  const { data, error } = await supabase
    .from('salesdetail')
    .select(`
      transno,
      prodcode,
      quantity,
      product ( description, unit )
    `)
    .eq('transno', transNo)
  if (error) throw error
  return data || []
}

// ── Product Services (read-only) ───────────────────────────────────────────

export async function getProducts() {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .order('prodcode')
  if (error) throw error
  return data || []
}

export async function getPriceHistory(prodCode) {
  const { data, error } = await supabase
    .from('pricehist')
    .select('*')
    .eq('prodcode', prodCode)
    .order('effdate', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCurrentPrice(prodCode) {
  const { data, error } = await supabase
    .from('pricehist')
    .select('unitprice, effdate')
    .eq('prodcode', prodCode)
    .order('effdate', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

// ── Admin Services (Sprint 3 - M1 PR-01) ──────────────────────────────────

/**
 * Get all users for Admin Module
 * @returns {Promise<Array>} Array of all users
 */
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .order('user_type', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getUsers:', error)
    return []
  }
}

/**
 * Activate a user (set record_status to ACTIVE)
 * BLOCKS modification of SUPERADMIN accounts
 * @param {string} targetUserId - User ID to activate
 * @param {string} targetUserType - User type (USER, ADMIN, SUPERADMIN)
 * @returns {Promise<Object>} Updated user object
 */
export async function activateUser(targetUserId, targetUserType) {
  // M1 GUARD: Protect SUPERADMIN at API level
  if (targetUserType === 'SUPERADMIN') {
    throw new Error('Action Denied: SUPERADMIN accounts cannot be modified.')
  }

  try {
    const { data, error } = await supabase
      .from('user')
      .update({ record_status: 'ACTIVE' })
      .eq('userid', targetUserId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in activateUser:', error)
    throw error
  }
}

/**
 * Deactivate a user (set record_status to INACTIVE)
 * BLOCKS modification of SUPERADMIN accounts
 * @param {string} targetUserId - User ID to deactivate
 * @param {string} targetUserType - User type (USER, ADMIN, SUPERADMIN)
 * @returns {Promise<Object>} Updated user object
 */
export async function deactivateUser(targetUserId, targetUserType) {
  // M1 GUARD: Protect SUPERADMIN at API level
  if (targetUserType === 'SUPERADMIN') {
    throw new Error('Action Denied: SUPERADMIN accounts cannot be modified.')
  }

  try {
    const { data, error } = await supabase
      .from('user')
      .update({ record_status: 'INACTIVE' })
      .eq('userid', targetUserId)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in deactivateUser:', error)
    throw error
  }
}

// ── Report Services (Sprint 3 - M1 PR-02) ─────────────────────────────────

/**
 * Get product revenue report
 * Uses product_revenue SQL view created by M3
 * @returns {Promise<Array>} Array of products with revenue data
 */
export async function getProductRevenue() {
  try {
    const { data, error } = await supabase
      .from('product_revenue')
      .select('*')
      .order('totalrevenue', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getProductRevenue:', error)
    return []
  }
}

/**
 * Get customer sales summary
 * Uses customer_sales_summary SQL view created by M3
 * @returns {Promise<Array>} Array of customers with sales summary
 */
export async function getCustomerSalesSummary() {
  try {
    const { data, error } = await supabase
      .from('customer_sales_summary')
      .select('*')
      .order('totalspend', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getCustomerSalesSummary:', error)
    return []
  }
}

/**
 * Get top 10 customers by total spend
 * Uses customer_sales_summary SQL view
 * @returns {Promise<Array>} Top 10 customers
 */
export async function getTopCustomers() {
  try {
    const { data, error } = await supabase
      .from('customer_sales_summary')
      .select('custno, custname, totaltransactions, totalspend')
      .order('totalspend', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getTopCustomers:', error)
    return []
  }
}