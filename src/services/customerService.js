import { supabase } from '../lib/supabaseClient'

/**
 * Helper: Create stamp string for audit trail
 * Format: "ACTION by USER_EMAIL on DATE"
 */
function makeStamp(action, userEmail) {
  const now = new Date().toISOString().split('T')[0]
  return `${action} by ${userEmail} on ${now}`
}

/**
 * Get all customers (filtered by user type)
 * 
 * For Sprint 2: We only have session.user from AuthContext
 * user_type will come from user table in Sprint 1's M4 work
 * For now, we'll fetch from user table to get user_type
 * 
 * @param {string} userId - Current user's ID
 * @returns {Promise<Array>} Array of customers
 */
export async function getCustomers(userId) {
  try {
    // First, get the user's type from the user table
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('user_type')
      .eq('userId', userId)
      .single()
    
    if (userError) {
      console.error('Error fetching user type:', userError)
      // If user table doesn't exist yet, return all customers
      const { data, error } = await supabase
        .from('customer')
        .select('*')
        .order('custno')
      
      if (error) throw error
      return data || []
    }
    
    const userType = userData?.user_type || 'USER'
    
    // Build query
    let query = supabase
      .from('customer')
      .select('*')
      .order('custno')
    
    // USER type only sees ACTIVE customers (RLS also enforces this)
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE')
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error in getCustomers:', error)
    return []
  }
}

/**
 * Add new customer
 * 
 * @param {Object} customerData - Customer data to insert
 * @param {string} customerData.custno - Customer number
 * @param {string} customerData.custname - Customer name
 * @param {string} customerData.address - Customer address
 * @param {string} customerData.payterm - Payment term (COD, 30D, 45D)
 * @param {string} userEmail - Email of user creating the customer
 * @returns {Promise<Object>} Created customer object
 */
export async function addCustomer(customerData, userEmail) {
  try {
    const { data, error } = await supabase
      .from('customer')
      .insert([{
        custno: customerData.custno,
        custname: customerData.custname,
        address: customerData.address || '',
        payterm: customerData.payterm,
        record_status: 'ACTIVE',
        stamp: makeStamp('CREATED', userEmail)
      }])
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in addCustomer:', error)
    throw error
  }
}

/**
 * Update existing customer
 * 
 * @param {string} custno - Customer number to update
 * @param {Object} customerData - Updated customer data
 * @param {string} userEmail - Email of user updating the customer
 * @returns {Promise<Object>} Updated customer object
 */
export async function updateCustomer(custno, customerData, userEmail) {
  try {
    const { data, error } = await supabase
      .from('customer')
      .update({
        custname: customerData.custname,
        address: customerData.address,
        payterm: customerData.payterm,
        stamp: makeStamp('UPDATED', userEmail)
      })
      .eq('custno', custno)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in updateCustomer:', error)
    throw error
  }
}

/**
 * Soft delete customer (set record_status to INACTIVE)
 * Only SUPERADMIN can do this (enforced by RLS)
 * 
 * @param {string} custno - Customer number to soft delete
 * @param {string} userEmail - Email of user deleting the customer
 * @returns {Promise<Object>} Updated customer object
 */
export async function softDeleteCustomer(custno, userEmail) {
  try {
    const { data, error } = await supabase
      .from('customer')
      .update({
        record_status: 'INACTIVE',
        stamp: makeStamp('DEACTIVATED', userEmail)
      })
      .eq('custno', custno)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in softDeleteCustomer:', error)
    throw error
  }
}

/**
 * Recover deleted customer (set record_status back to ACTIVE)
 * ADMIN and SUPERADMIN can do this
 * 
 * @param {string} custno - Customer number to recover
 * @param {string} userEmail - Email of user recovering the customer
 * @returns {Promise<Object>} Updated customer object
 */
export async function recoverCustomer(custno, userEmail) {
  try {
    const { data, error } = await supabase
      .from('customer')
      .update({
        record_status: 'ACTIVE',
        stamp: makeStamp('REACTIVATED', userEmail)
      })
      .eq('custno', custno)
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error in recoverCustomer:', error)
    throw error
  }
}