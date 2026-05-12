import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import AddCustomerModal from '../components/AddCustomerModal'
import EditCustomerModal from '../components/EditCustomerModal'
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog'

export default function Customers() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { rights, isAdmin, rightsLoading } = useRights()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // Search + filter state
  const [search, setSearch]       = useState('')
  const [paytermFilter, setPayterm] = useState('ALL')

  // Modal open state
  const [showAdd, setShowAdd]         = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (currentUser) loadCustomers()
  }, [currentUser])

  async function loadCustomers() {
    try {
      setLoading(true)
      setError(null)
      // M1's getCustomers already filters ACTIVE-only for USER role via userType check
      const data = await getCustomers(currentUser?.id)
      setCustomers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Optimistic UI updates — no need to re-fetch from Supabase
  function handleAdded(newCustomer) {
    setCustomers(prev => [...prev, newCustomer])
  }

  function handleUpdated(updated) {
    setCustomers(prev => prev.map(c => c.custno === updated.custno ? updated : c))
  }

  // After soft-delete, M3 RLS + M1 service will hide it from USER on next load.
  // We update local state immediately so UI reflects it without a refetch.
  function handleDeleted(updated) {
    setCustomers(prev => prev.map(c => c.custno === updated.custno ? updated : c))
  }

  // Client-side search + payterm filter
  // Note: M1 already handles the USER/ADMIN visibility at service level.
  // This filter is purely for the search box and payterm dropdown.
  const visible = customers.filter(c => {
    const q = search.toLowerCase().trim()
    const matchSearch = !q
      || c.custname.toLowerCase().includes(q)
      || c.payterm.toLowerCase().includes(q)
    const matchTerm = paytermFilter === 'ALL' || c.payterm === paytermFilter
    return matchSearch && matchTerm
  })

  if (loading || rightsLoading) return <LoadingSpinner message="Loading customers..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          Error loading customers: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

        <div className="flex items-center gap-3 flex-wrap">

          {/* Search input — filters by name or payterm (M2 spec) */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or pay term..."
              className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>

          {/* Payterm dropdown filter */}
          <select
            value={paytermFilter}
            onChange={e => setPayterm(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Terms</option>
            <option value="COD">COD</option>
            <option value="30D">30D</option>
            <option value="45D">45D</option>
          </select>

          {/* Add Customer — gated by CUST_ADD right (M4 spec) */}
          {rights.CUST_ADD === 1 && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                         font-semibold text-white transition"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pay Term
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              {/* Stamp column — ADMIN/SUPERADMIN only (M2 + M4 spec) */}
              {isAdmin() && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stamp
                </th>
              )}

              {/* Actions column — only render if user has at least one action right */}
              {(rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {visible.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    5
                    + (isAdmin() ? 1 : 0)
                    + (rights.CUST_EDIT === 1 || rights.CUST_DEL === 1 ? 1 : 0)
                  }
                  className="px-6 py-10 text-center text-gray-400 text-sm"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              visible.map(customer => (
                <tr key={customer.custno} className="hover:bg-gray-50 transition">

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.custno}
                  </td>

                  {/* Clickable name → navigates to CustomerDetailPage (PR-03) */}
                  <td
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium
                               text-blue-600 hover:text-blue-800 cursor-pointer
                               hover:underline transition"
                    onClick={() => navigate(`/customers/${customer.custno}`)}
                  >
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

                  {/* Stamp cell — ADMIN/SUPERADMIN only (M4 spec) */}
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm
                                   text-gray-400 italic">
                      {customer.stamp ?? '—'}
                    </td>
                  )}

                  {/* Action buttons */}
                  {(rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">

                        {/* Edit — gated by CUST_EDIT (M4 spec) */}
                        {rights.CUST_EDIT === 1 && (
                          <button
                            onClick={() => setEditTarget(customer)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-xs font-semibold text-blue-700 bg-blue-50
                                       hover:bg-blue-100 transition"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                        )}

                        {/* Delete — gated by CUST_DEL (SUPERADMIN only in practice, M4 spec)
                            Only show for ACTIVE records — no point deleting an already INACTIVE one */}
                        {rights.CUST_DEL === 1 && customer.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteTarget(customer)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                       text-xs font-semibold text-red-700 bg-red-50
                                       hover:bg-red-100 transition"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2">
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

      {/* ── Modals (PR-02) ── */}
      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onSuccess={handleAdded}
        />
      )}

      {editTarget && (
        <EditCustomerModal
          customer={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleUpdated}
        />
      )}

      {deleteTarget && (
        <SoftDeleteConfirmDialog
          customer={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onSuccess={handleDeleted}
        />
      )}

    </div>
  )
}