import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const UserRightsContext = createContext({})

const DEFAULT_RIGHTS = {
  CUST_VIEW: 0, CUST_ADD: 0, CUST_EDIT: 0, CUST_DEL: 0,
  SALES_VIEW: 0, SD_VIEW: 0, PROD_VIEW: 0, PRICE_VIEW: 0, ADM_USER: 0,
}

export function UserRightsProvider({ children }) {
  const { currentUser } = useAuth()
  const [rights, setRights]               = useState(DEFAULT_RIGHTS)
  const [userType, setUserType]           = useState(null)
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.id) {
      setRights(DEFAULT_RIGHTS)
      setUserType(null)
      setRightsLoading(false)
      return
    }

    async function loadRights() {
      setRightsLoading(true)

      // 1. Fetch both rights and user type
      const [rightsResult, userResult] = await Promise.all([
        supabase
          .from('usermodule_rights')
          .select('rightcode, right_value')
          .eq('userid', currentUser.id),
        supabase
          .from('user')
          .select('user_type')
          .eq('userid', currentUser.id)
          .maybeSingle(),
      ])

      // 2. Determine User Type first
      const type = userResult.data?.user_type || null
      setUserType(type)

      // 3. LOGIC FIX: If SUPERADMIN, bypass the table check and grant all 1s
      if (type === 'SUPERADMIN') {
        const fullRights = {}
        Object.keys(DEFAULT_RIGHTS).forEach(key => {
          fullRights[key] = 1
        })
        setRights(fullRights)
        console.log('⚡ SUPERADMIN Bypass: All rights granted automatically.')
        setRightsLoading(false)
        return // Stop here
      }

      // 4. Regular logic for ADMIN and USER
      if (rightsResult.error || !rightsResult.data || rightsResult.data.length === 0) {
        setRights(DEFAULT_RIGHTS)
        console.log('❌ No specific rights found or error, using defaults.')
      } else {
        const map = { ...DEFAULT_RIGHTS }
        rightsResult.data.forEach(({ rightcode, right_value }) => {
          if (rightcode in map) map[rightcode] = right_value
        })
        setRights(map)
        console.log('✅ Rights loaded for', type, ':', map)
      }

      setRightsLoading(false)
    }

    loadRights()
  }, [currentUser?.id])

  const isAdmin = () => userType === 'ADMIN' || userType === 'SUPERADMIN'

  return (
    <UserRightsContext.Provider value={{ rights, userType, isAdmin, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}

export function useRights() {
  return useContext(UserRightsContext)
}