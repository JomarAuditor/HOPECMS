import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers } from '../services/customerService'
import AddCustomerModal from '../components/AddCustomerModal'
import EditCustomerModal from '../components/EditCustomerModal'
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog'

function TableSkeleton({ cols }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded" /></td>
          ))}
        </tr>
      ))}
    </>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
      ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      }
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer">✕</button>
    </div>
  )
}

// Stamp cell — fixed narrow width, tooltip uses fixed positioning so it's never clipped
function StampCell({ stamp }) {
  const [show, setShow] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, alignRight: false })
  const ref             = React.useRef(null)

  if (!stamp) return <span className="text-gray-300 text-xs">—</span>

  const parts = stamp.match(/^(\S+)\s+by\s+(.+)\s+on\s+(\S+)$/)
  const action = parts ? parts[1] : stamp
  const email  = parts ? parts[2] : ''
  const date   = parts ? parts[3] : ''
  const short  = parts ? `${parts[1]} · ${parts[3]}` : stamp

  const actionColor = {
    CREATED:     'text-green-400',
    UPDATED:     'text-blue-400',
    DEACTIVATED: 'text-red-400',
    REACTIVATED: 'text-emerald-400',
  }[action] ?? 'text-gray-400'

  function handleMouseEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      const alignRight = rect.left > window.innerWidth / 2
      setPos({
        top: rect.top - 12,
        left: alignRight ? 'auto' : rect.left,
        right: alignRight ? window.innerWidth - rect.right : 'auto',
        alignRight,
      })
    }
    setShow(true)
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className="block text-xs text-gray-500 italic cursor-default truncate max-w-27.5"
      >
        {short}
      </span>
      {show && (
        <div
          className="fixed z-9999 pointer-events-none -translate-y-full"
          style={{
            top: pos.top,
            ...(pos.alignRight ? { right: pos.right } : { left: pos.left }),
          }}
        >
          {/* Tooltip card */}
          <div className="bg-gray-950 rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-55">
            {/* Colored top bar based on action */}
            <div className={`h-1 w-full ${
              action === 'CREATED'     ? 'bg-green-500' :
              action === 'UPDATED'     ? 'bg-blue-500' :
              action === 'DEACTIVATED' ? 'bg-red-500' :
              action === 'REACTIVATED' ? 'bg-emerald-500' : 'bg-gray-500'
            }`} />
            <div className="px-3.5 py-3">
              {/* Action badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${actionColor}`}>
                  {action}
                </span>
              </div>
              {/* Email */}
              {email && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-[11px] text-gray-300">{email}</span>
                </div>
              )}
              {/* Date */}
              {date && (
                <div className="flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-[11px] text-gray-300">{date}</span>
                </div>
              )}
            </div>
          </div>
          {/* Caret */}
          <div className={`absolute top-full border-4 border-transparent border-t-gray-950 ${
            pos.alignRight ? 'right-4' : 'left-4'
          }`} />
        </div>
      )}
    </>
  )
}

export default function Customers() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { rights, isAdmin, rightsLoading } = useRights()

  const [customers, setCustomers]     = useState([])
  const [loading, setLoading]         = useState(true)
  const [toast, setToast]             = useState(null)
  const [search, setSearch]           = useState('')
  const [paytermFilter, setPayterm]   = useState('ALL')
  const [showAdd, setShowAdd]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => { if (currentUser) loadCustomers() }, [currentUser])

  async function loadCustomers() {
    try {
      setLoading(true)
      const data = await getCustomers(currentUser?.id)
      setCustomers(data)
    } catch (err) {
      setToast({ message: err.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  function handleAdded(c)   { setCustomers(p => [...p, c]); setToast({ message: 'Customer added!', type: 'success' }) }
  function handleUpdated(c) { setCustomers(p => p.map(x => x.custno === c.custno ? c : x)); setToast({ message: 'Customer updated!', type: 'success' }) }
  function handleDeleted(c) { setCustomers(p => p.map(x => x.custno === c.custno ? c : x)); setToast({ message: 'Customer deactivated.', type: 'success' }) }

  const visible = customers.filter(c => {
    const q = search.toLowerCase().trim()
    return (!q || c.custname.toLowerCase().includes(q) || c.payterm.toLowerCase().includes(q))
      && (paytermFilter === 'ALL' || c.payterm === paytermFilter)
  })

  const hasActions = rights.CUST_EDIT === 1 || rights.CUST_DEL === 1
  const colCount   = 5 + (isAdmin() ? 1 : 0) + (hasActions ? 1 : 0)

  if (rightsLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{visible.length} record{visible.length !== 1 ? 's' : ''} shown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or pay term..."
              className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 w-52 transition-all"/>
          </div>
          <select value={paytermFilter} onChange={e => setPayterm(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
            <option value="ALL">All Terms</option>
            <option value="COD">COD</option>
            <option value="30D">30D</option>
            <option value="45D">45D</option>
          </select>
          {rights.CUST_ADD === 1 && (
            <button onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
                         transition active:scale-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* Table — horizontal scroll on small screens */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Customer #</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Name</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Address</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Pay Term</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                {isAdmin() && <th className="w-28 px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Stamp</th>}
                {hasActions && <th className="w-28 px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <TableSkeleton cols={colCount} />
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-6 py-16 text-center">
                    <svg className="mx-auto mb-3 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    </svg>
                    <p className="text-sm text-gray-400">{search ? `No results for "${search}"` : 'No customers found.'}</p>
                  </td>
                </tr>
              ) : (
                visible.map(customer => (
                  <tr key={customer.custno} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">{customer.custno}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-semibold text-blue-600
                                   hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                        onClick={() => navigate(`/customers/${customer.custno}`)}>
                      {customer.custname}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-500 max-w-40">
                      <span className="block" title={customer.address || ''}>{customer.address || '—'}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{customer.payterm}</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${
                        customer.record_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {customer.record_status}
                      </span>
                    </td>
                    {isAdmin() && (
                      <td className="w-28 px-3 py-3">
                        <StampCell stamp={customer.stamp} />
                      </td>
                    )}
                    {hasActions && (
                      <td className="w-28 px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {rights.CUST_EDIT === 1 && (
                            <button onClick={() => setEditTarget(customer)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                         text-blue-700 bg-blue-50 hover:bg-blue-100 transition cursor-pointer active:scale-95">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                              Edit
                            </button>
                          )}
                          {rights.CUST_DEL === 1 && customer.record_status === 'ACTIVE' && (
                            <button onClick={() => setDeleteTarget(customer)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold
                                         text-red-700 bg-red-50 hover:bg-red-100 transition cursor-pointer active:scale-95">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd      && <AddCustomerModal onClose={() => setShowAdd(false)} onSuccess={handleAdded} />}
      {editTarget   && <EditCustomerModal customer={editTarget} onClose={() => setEditTarget(null)} onSuccess={handleUpdated} />}
      {deleteTarget && <SoftDeleteConfirmDialog customer={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={handleDeleted} />}
      {toast        && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
