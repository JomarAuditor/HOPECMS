import { useState, useEffect } from 'react'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'
import ErrorBoundary from '../components/ErrorBoundary'

// ── Skeleton loader for table rows ──────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-24" /></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-28" /></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-36" /></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-20" /></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-16" /></td>
          <td className="px-6 py-4"><div className="h-3 bg-gray-200 rounded w-32" /></td>
        </tr>
      ))}
    </>
  )
}

// ── Toast notification ───────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3
                     rounded-xl shadow-lg text-sm font-semibold transition-all
                     ${type === 'success'
                       ? 'bg-green-600 text-white'
                       : 'bg-red-600 text-white'}`}>
      {type === 'success' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

function AdminContent() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [actionLoading, setActionLoading] = useState(null) // userId being acted on
  const [toast, setToast]       = useState(null)           // { message, type }

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
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
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  async function handleActivate(userId, userType) {
    try {
      setActionLoading(userId)
      // adminService already throws if userType === 'SUPERADMIN'
      const updated = await activateUser(userId, userType)
      setUsers(prev => prev.map(u => u.userid === userId ? { ...u, record_status: 'ACTIVE' } : u))
      showToast('User activated successfully!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeactivate(userId, userType) {
    try {
      setActionLoading(userId)
      const updated = await deactivateUser(userId, userType)
      setUsers(prev => prev.map(u => u.userid === userId ? { ...u, record_status: 'INACTIVE' } : u))
      showToast('User deactivated successfully!', 'success')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-100 border border-red-400 text-red-700
                        px-4 py-3 rounded-lg text-sm">
          Error loading users: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage user accounts. SUPERADMIN accounts are fully protected and cannot be modified.
        </p>
      </div>

      {/* ── Table — scrollable on mobile ── */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['User ID', 'Username', 'Email', 'User Type', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton />
            ) : users.length === 0 ? (
              // ── Empty state ──
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <svg className="mx-auto mb-3 text-gray-300" width="40" height="40"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p className="text-sm text-gray-400 font-medium">No users found.</p>
                </td>
              </tr>
            ) : (
              users.map(user => {
                const isSuperAdmin  = user.user_type === 'SUPERADMIN'
                const isActing      = actionLoading === user.userid
                const isActive      = user.record_status === 'ACTIVE'

                return (
                  <tr
                    key={user.userid}
                    className={`transition ${isSuperAdmin ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {user.userid.slice(0, 8)}…
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.username || 'N/A'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email || 'N/A'}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5
                                        font-semibold rounded-full ${
                        isSuperAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : user.user_type === 'ADMIN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5
                                        font-semibold rounded-full ${
                        isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.record_status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isSuperAdmin ? (
                        // SUPERADMIN row — fully disabled with tooltip (M2 spec)
                        <div className="relative group inline-block">
                          <span className="text-gray-300 text-xs font-semibold
                                           cursor-not-allowed select-none">
                            Activate · Deactivate
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block
                                          bg-gray-800 text-white text-xs rounded-lg px-3 py-1.5
                                          whitespace-nowrap z-10 shadow-lg">
                            SUPERADMIN accounts cannot be modified
                            <div className="absolute top-full left-4 border-4 border-transparent
                                            border-t-gray-800" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Activate button */}
                          <button
                            onClick={() => handleActivate(user.userid, user.user_type)}
                            disabled={isActive || isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-xs font-semibold text-green-700 bg-green-50
                                       hover:bg-green-100 transition
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isActing && !isActive ? (
                              <span className="animate-spin inline-block w-3 h-3 border-2
                                               border-green-600 border-t-transparent rounded-full" />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                   stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                            Activate
                          </button>

                          {/* Deactivate button */}
                          <button
                            onClick={() => handleDeactivate(user.userid, user.user_type)}
                            disabled={!isActive || isActing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-xs font-semibold text-red-700 bg-red-50
                                       hover:bg-red-100 transition
                                       disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {isActing && isActive ? (
                              <span className="animate-spin inline-block w-3 h-3 border-2
                                               border-red-600 border-t-transparent rounded-full" />
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                   stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            )}
                            Deactivate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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