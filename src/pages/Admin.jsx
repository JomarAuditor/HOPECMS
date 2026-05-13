import { useCallback, useEffect, useState } from 'react'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'
import ErrorBoundary from '../components/ErrorBoundary'

function PageLoader() {
  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Loading users</p>
          <p className="text-xs text-gray-500 mt-1">Preparing account details...</p>
        </div>
      </div>
    </div>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer" aria-label="Close toast">
        x
      </button>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex min-w-20 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${
      active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}>
      {active ? 'ACTIVE' : 'INACTIVE'}
    </span>
  )
}

function TypeBadge({ type }) {
  const className = type === 'SUPERADMIN'
    ? 'bg-violet-100 text-violet-700'
    : type === 'ADMIN'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex min-w-24 justify-center rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      {type || 'USER'}
    </span>
  )
}

function AdminContent() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(loadUsers, 0)
    return () => clearTimeout(timer)
  }, [loadUsers])

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  async function handleActivate(userId, userType) {
    try {
      setActionLoading({ userId, action: 'activate' })
      await activateUser(userId, userType)
      setUsers(prev => prev.map(user => user.userid === userId ? { ...user, record_status: 'ACTIVE' } : user))
      showToast('User activated successfully.', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeactivate(userId, userType) {
    try {
      setActionLoading({ userId, action: 'deactivate' })
      await deactivateUser(userId, userType)
      setUsers(prev => prev.map(user => user.userid === userId ? { ...user, record_status: 'INACTIVE' } : user))
      showToast('User deactivated successfully.', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) return <PageLoader />

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading users: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} account{users.length !== 1 ? 's' : ''} listed. SUPERADMIN accounts are protected.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition cursor-pointer"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M16 8h5V3" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[24%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">User ID</th>
                <th className="w-[17%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Username</th>
                <th className="w-[23%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Email</th>
                <th className="w-[12%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">User Type</th>
                <th className="w-[11%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Status</th>
                <th className="w-[13%] px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                    <p className="text-sm text-gray-400 font-medium">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const isSuperAdmin = user.user_type === 'SUPERADMIN'
                  const isActive = user.record_status === 'ACTIVE'
                  const isActing = actionLoading?.userId === user.userid
                  const action = isActive ? 'deactivate' : 'activate'

                  return (
                    <tr key={user.userid} className={isSuperAdmin ? 'bg-gray-50/70' : 'hover:bg-gray-50/80 transition-colors'}>
                      <td className="px-3 py-4 align-top">
                        <span className="block select-all break-all font-mono text-[11px] leading-4 text-gray-600">
                          {user.userid}
                        </span>
                      </td>
                      <td className="px-3 py-4 align-top">
                        <span className="block break-all text-sm font-semibold leading-5 text-gray-900">
                          {user.username || <span className="font-medium text-gray-300">N/A</span>}
                        </span>
                      </td>
                      <td className="px-3 py-4 align-top">
                        <span className="block break-all text-sm leading-5 text-gray-600">
                          {user.email || <span className="text-gray-300">N/A</span>}
                        </span>
                      </td>
                      <td className="px-3 py-4 align-top">
                        <TypeBadge type={user.user_type} />
                      </td>
                      <td className="px-3 py-4 align-top">
                        <StatusBadge active={isActive} />
                      </td>
                      <td className="px-3 py-4 align-top">
                        {isSuperAdmin ? (
                          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-100 px-2 py-2 text-xs font-semibold text-gray-400">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => isActive
                              ? handleDeactivate(user.userid, user.user_type)
                              : handleActivate(user.userid, user.user_type)}
                            disabled={isActing}
                            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold shadow-sm transition active:scale-95 disabled:cursor-wait disabled:opacity-70 ${
                              isActive
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {isActing ? (
                              <span className={`h-3.5 w-3.5 rounded-full border-2 border-t-transparent animate-spin ${
                                action === 'activate' ? 'border-green-600' : 'border-red-600'
                              }`} />
                            ) : isActive ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            {isActing ? 'Working...' : isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default function Admin() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  )
}
