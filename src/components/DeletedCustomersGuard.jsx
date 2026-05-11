import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import LoadingSpinner from './LoadingSpinner'

export default function DeletedCustomersGuard({ children }) {
  const { currentUser } = useAuth()
  const [userType, setUserType] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserType() {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('user')
        .select('user_type')
        .eq('userid', currentUser.id)
        .maybeSingle()

      setUserType(data?.user_type || 'USER')
      setLoading(false)
    }

    getUserType()
  }, [currentUser?.id])

  if (loading) return <LoadingSpinner message="Checking permissions..." />
  if (userType === 'USER') return <Navigate to="/customers" replace />
  return children
}
