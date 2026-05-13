import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers } from '../services/customerService'
import AddCustomerModal from '../components/AddCustomerModal'
import EditCustomerModal from '../components/EditCustomerModal'
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog'

// ── Loading skeleton ──────────────────────────────────────────────────────────
function TableSkeleton({ cols }) {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-3 bg-gray-200 rounded" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3
                     px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
                     ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success'
        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      }
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}

export default function Customers() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { rights, isAdmin, rightsLoading } = useRights()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [toast, setToast]         = useState(null)
  const [search, setSearch]       = useState('')
  const [paytermFilter, setPayterm] = useState('ALL')
  const [showAdd, setShowAdd]       = useState(false)
  const [editTarget, setEditTarget] = useState(null)
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

  const colCount = 5 + (isAdmin() ? 1 : 0) + (rights.CUST_EDIT === 1 || rights.CUST_DEL === 1 ? 1 : 0)

  if (rightsLoading) return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="p-4 md:p-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                 width="15" height="15" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search by name or pay term..."
                   className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                              focus:outline-none focus:ring-2 focus:ring-blue-500 w-56" />
          </div>
          <select value={paytermFilter} onChange={e => setPayterm(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2
                             bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="ALL">All Terms</option>
            <option value="COD">COD</option>
            <option value="30D">30D</option>
            <option value="45D">45D</option>
          </select>
          {rights.CUST_ADD === 1 && (
            <button onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                               font-semibold text-white transition"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Customer
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Customer #', 'Name', 'Address', 'Pay Term', 'Status',
                ...(isAdmin() ? ['Stamp'] : []),
                ...((rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) ? ['Actions'] : [])
              ].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableSkeleton cols={colCount} />
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-6 py-16 text-center">
                  <svg className="mx-auto mb-3 text-gray-300" width="40" height="40"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p className="text-sm text-gray-400 font-medium">
                    {search ? `No customers found for "${search}".` : 'No customers found.'}
                  </p>
                </td>
              </tr>
            ) : (
              visible.map(customer => (
                <tr key={customer.custno} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.custno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium
                                  text-blue-600 hover:text-blue-800 cursor-pointer
                                  hover:underline transition"
                      onClick={() => navigate(`/customers/${customer.custno}`)}>
                    {customer.custname}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.address || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5
                                     rounded text-xs font-semibold">
                      {customer.payterm}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5
                                      font-semibold rounded-full ${
                      customer.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.record_status}
                    </span>
                  </td>
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                      {customer.stamp ?? '—'}
                    </td>
                  )}
                  {(rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {rights.CUST_EDIT === 1 && (
                          <button onClick={() => setEditTarget(customer)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                             text-xs font-semibold text-blue-700 bg-blue-50
                                             hover:bg-blue-100 transition">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                        )}
                        {rights.CUST_DEL === 1 && customer.record_status === 'ACTIVE' && (
                          <button onClick={() => setDeleteTarget(customer)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                             text-xs font-semibold text-red-700 bg-red-50
                                             hover:bg-red-100 transition">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                 stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
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

      {showAdd    && <AddCustomerModal onClose={() => setShowAdd(false)} onSuccess={handleAdded} />}
      {editTarget && <EditCustomerModal customer={editTarget} onClose={() => setEditTarget(null)} onSuccess={handleUpdated} />}
      {deleteTarget && <SoftDeleteConfirmDialog customer={deleteTarget} onClose={() => setDeleteTarget(null)} onSuccess={handleDeleted} />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}