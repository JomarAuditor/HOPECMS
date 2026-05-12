import { supabase } from '../lib/supabaseClient'

export async function getUsers() {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .order('user_type', { ascending: false })
  if (error) throw error
  return data || []
}

export async function activateUser(targetUserId, targetUserType) {
  if (targetUserType === 'SUPERADMIN')
    throw new Error('Action Denied: SUPERADMIN accounts cannot be modified.')
  const { data, error } = await supabase
    .from('user')
    .update({ record_status: 'ACTIVE' })
    .eq('userid', targetUserId)
    .select()
  if (error) throw error
  return data[0]
}

export async function deactivateUser(targetUserId, targetUserType) {
  if (targetUserType === 'SUPERADMIN')
    throw new Error('Action Denied: SUPERADMIN accounts cannot be modified.')
  const { data, error } = await supabase
    .from('user')
    .update({ record_status: 'INACTIVE' })
    .eq('userid', targetUserId)
    .select()
  if (error) throw error
  return data[0]
}
