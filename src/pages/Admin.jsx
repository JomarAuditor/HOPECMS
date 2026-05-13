import { useCallback, useEffect, useRef, useState } from 'react'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'
import ErrorBoundary from '../components/ErrorBoundary'

function getInitials(name, email) {
  const src = name && name !== email ? name : email
  const parts = src.trim().split(/[\s@._-]+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

function avatarColor(str = '') {
  const colors = [
    'from-blue-500 to-blue-700',
    'from-violet-500 to-violet-700',
    'from-emerald-500 to-emerald-700',
    'from-rose-500 to-rose-700',
    'from-amber-500 to-amber-700',
    'from-cyan-500 to-cyan-700',
    'from-indigo-500 to-indigo-700',
    'from-pink-500 to-pink-700',
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = type === 'success'
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold ${
      isSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {isSuccess
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 cursor-pointer text-base leading-none">×</button>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${
      active
        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function TypeBadge({ type }) {
  const map = {
    SUPERADMIN: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
    ADMIN:      'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
    USER:       'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  }
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide ${map[type] ?? map.USER}`}>
      {type || 'USER'}
    </span>
  )
}

function UserCard({ user, actionLoading, onActivate, onDeactivate }) {
  const isSuperAdmin = user.user_type === 'SUPERADMIN'
  const isActive     = user.record_status === 'ACTIVE'
  const isActing     = actionLoading?.userId === user.userid
  const initials     = getInitials(user.username, user.email)
  const gradient     = avatarColor(user.userid)

  return (
    <div className={`flex items-center gap-4 px-5 py-4 transition-colors ${
      isSuperAdmin ? 'bg-gray-50' : 'bg-white hover:bg-blue-50'
    }`}>
      <div className={`w-9 h-9 rounded-full bg-linear-to-br ${gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 truncate max-w-45">
            {user.username && user.username !== user.email ? user.username : user.email?.split('@')[0]}
          </span>
          <TypeBadge type={user.user_type} />
          <StatusBadge active={isActive} />
        </div>
        <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
        <p className="text-xs text-gray-300 font-mono mt-0.5 truncate hidden sm:block">{user.userid}</p>
      </div>
      <div className="shrink-0">
        {isSuperAdmin ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Protected
          </span>
        ) : (
          <button
            onClick={() => isActive ? onDeactivate(user.userid, user.user_type) : onActivate(user.userid, user.user_type)}
            disabled={isActing}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition active:scale-95 disabled:cursor-wait disabled:opacity-60 cursor-pointer ${
              isActive
                ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-emerald-200'
            }`}
          >
            {isActing ? (
              <span className={`h-3 w-3 rounded-full border-2 border-t-transparent animate-spin ${isActive ? 'border-red-500' : 'border-emerald-600'}`} />
            ) : isActive ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
            {isActing ? 'Working…' : isActive ? 'Deactivate' : 'Activate'}
          </button>
        )}
      </div>
    </div>
  )
}

function StatsBar({ users }) {
  const stats = [
    { label: 'Total',      value: users.length,                                          color: 'text-gray-700' },
    { label: 'Active',     value: users.filter(u => u.record_status === 'ACTIVE').length, color: 'text-emerald-600' },
    { label: 'Inactive',   value: users.filter(u => u.record_status !== 'ACTIVE').length, color: 'text-gray-400' },
    { label: 'Superadmin', value: users.filter(u => u.user_type === 'SUPERADMIN').length, color: 'text-violet-600' },
    { label: 'Admin',      value: users.filter(u => u.user_type === 'ADMIN').length,      color: 'text-blue-600' },
    { label: 'User',       value: users.filter(u => u.user_type === 'USER').length,       color: 'text-gray-500' },
  ]
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-xl border border-gray-100 px-3 py-3 text-center shadow-sm">
          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/5" />
        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/5" />
      </div>
      <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse shrink-0" />
    </div>
  )
}

function AdminContent() {
  const [users, setUsers]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)
  const [filter, setFilter]               = useState('ALL')
  const hasFetched                        = useRef(false)

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
    if (!hasFetched.current) {
      hasFetched.current = true
      loadUsers()
    }
  }, [loadUsers])

  function showToast(message, type = 'success') { setToast({ message, type }) }

  async function handleActivate(userId, userType) {
    try {
      setActionLoading({ userId, action: 'activate' })
      await activateUser(userId, userType)
      setUsers(prev => prev.map(u => u.userid === userId ? { ...u, record_status: 'ACTIVE' } : u))
      showToast('User activated successfully.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setActionLoading(null) }
  }

  async function handleDeactivate(userId, userType) {
    try {
      setActionLoading({ userId, action: 'deactivate' })
      await deactivateUser(userId, userType)
      setUsers(prev => prev.map(u => u.userid === userId ? { ...u, record_status: 'INACTIVE' } : u))
      showToast('User deactivated successfully.')
    } catch (err) { showToast(err.message, 'error') }
    finally { setActionLoading(null) }
  }

  const FILTERS = ['ALL', 'ACTIVE', 'INACTIVE', 'SUPERADMIN', 'ADMIN', 'USER']
  const filtered = users.filter(u => {
    if (filter === 'ALL')      return true
    if (filter === 'ACTIVE')   return u.record_status === 'ACTIVE'
    if (filter === 'INACTIVE') return u.record_status !== 'ACTIVE'
    return u.user_type === filter
  })

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error loading users: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage account access and roles. SUPERADMIN accounts are protected.</p>
        </div>
        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'animate-spin' : ''}>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M16 8h5V3"/>
          </svg>
          Refresh
        </button>
      </div>

      {!loading && <StatsBar users={users} />}

      <div className="flex gap-1.5 flex-wrap mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filter === f
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f === 'ALL' ? `All (${users.length})` : f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {loading ? 'Loading…' : `${filtered.length} account${filtered.length !== 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block"/>Inactive</span>
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto mb-3 text-gray-200" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p className="text-sm text-gray-400 font-medium">No accounts match this filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(user => (
              <UserCard
                key={user.userid}
                user={user}
                actionLoading={actionLoading}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
              />
            ))}
          </div>
        )}
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
