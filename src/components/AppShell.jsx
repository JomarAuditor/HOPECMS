import React, { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useRights } from '../context/UserRightsContext'

const NAV_ITEMS = [
  {
    label: 'Customers', to: '/customers',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: 'Sales', to: '/sales',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    label: 'Products', to: '/products',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  },
  {
    label: 'Reports', to: '/reports',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
]

const ADMIN_NAV_ITEMS = [
  {
    label: 'Admin', to: '/admin',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    label: 'Deleted Customers', to: '/deleted-customers',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  },
]

const ROLE_BADGE = {
  SUPERADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
  ADMIN:      'bg-blue-50 text-blue-700 border border-blue-200',
  USER:       'bg-gray-100 text-gray-500 border border-gray-200',
}

function NavItem({ to, icon, label, onClick }) {
  return (
    <NavLink to={to} onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group ${
          isActive
            ? 'bg-blue-50 text-blue-700 border-l-[3px] border-blue-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 border-l-[3px] border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
            {icon}
          </span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

export default function AppShell({ user }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAdmin, userType, rightsLoading } = useRights()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const userEmail   = user?.email ?? 'user@hopecms.com'
  const initials    = (user?.user_metadata?.full_name ?? userEmail).slice(0, 2).toUpperCase()
  const displayName = user?.user_metadata?.full_name ?? userEmail.split('@')[0]
  const role        = userType ?? 'USER'

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-62 bg-white border-r border-gray-200 z-30
        flex flex-col transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>

        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-100 shrink-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden mr-3 shrink-0 bg-blue-50 flex items-center justify-center">
            <img src="/favicon.svg" alt="HopeCMS" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">HopeCMS</p>
            <p className="text-[10px] text-gray-400 mt-0.5 tracking-wide">Enterprise CRM</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Main</p>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
          ))}

          {!rightsLoading && isAdmin() && (
            <>
              <div className="pt-4 pb-1 px-3">
                <div className="h-px bg-gray-100 mb-3" />
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Administration</p>
              </div>
              {ADMIN_NAV_ITEMS.map(item => (
                <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />
              ))}
            </>
          )}
        </nav>

        {/* ── User footer ── */}
        <div className="shrink-0 border-t border-gray-100 p-4 space-y-3">

          {/* Avatar row */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{displayName}</p>
              <p className="text-[10px] text-gray-400 truncate mt-0.5">{userEmail}</p>
            </div>
          </div>

          {/* Role badge */}
          <span className={`inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${ROLE_BADGE[role] ?? ROLE_BADGE.USER}`}>
            {role}
          </span>

          {/* Sign Out — full width, clearly separated */}
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg
                       text-xs font-semibold text-gray-500 hover:text-red-600
                       hover:bg-red-50 border border-gray-200 hover:border-red-200
                       transition-all cursor-pointer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col md:ml-62 min-w-0">

        {/* Mobile header */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-20 shrink-0 md:hidden">
          <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <span className="ml-3 text-sm font-bold text-gray-900">HopeCMS</span>
        </header>

        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
