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

