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
  const [rights, setRights] = useState(DEFAULT_RIGHTS)
  const [rightsLoading, setRightsLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.id) {
      setRights(DEFAULT_RIGHTS)
      setRightsLoading(false)
      return
    }

    async function loadRights() {
      setRightsLoading(true)
      const { data, error } = await supabase
        .from('usermodule_rights')
        .select('rightcode, right_value')
        .eq('userid', currentUser.id)

      if (error || !data) {
        setRights(DEFAULT_RIGHTS)
      } else {
        const map = { ...DEFAULT_RIGHTS }
        data.forEach(({ rightcode, right_value }) => {
          if (rightcode in map) map[rightcode] = right_value
        })
        setRights(map)
      }
      setRightsLoading(false)
    }

    loadRights()
  }, [currentUser?.id])

  return (
    <UserRightsContext.Provider value={{ rights, rightsLoading }}>
      {children}
    </UserRightsContext.Provider>
  )
}

export function useRights() {
  return useContext(UserRightsContext)
}
