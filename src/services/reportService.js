import { supabase } from '../lib/supabaseClient'

export async function getProductRevenue() {
  const { data, error } = await supabase
    .from('product_revenue')
    .select('*')
    .order('totalrevenue', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCustomerSalesSummary() {
  const { data, error } = await supabase
    .from('customer_sales_summary')
    .select('*')
    .order('totalspend', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getTopCustomers() {
  const { data, error } = await supabase
    .from('customer_sales_summary')
    .select('custno, custname, totaltransactions, totalspend')
    .order('totalspend', { ascending: false })
    .limit(10)
  if (error) throw error
  return data || []
}
