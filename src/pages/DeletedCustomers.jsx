import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers, recoverCustomer } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

// M2 spec: ADMIN/SUPERADMIN only — sidebar link gating is already handled
// in AppShell.jsx via isAdmin() (M4 spec). Route itself is blocked by
// DeletedCustomersGuard.jsx (M1 PR-04 spec) which redirects USER to /customers.
// This component can safely assume the viewer is ADMIN or SUPERADMIN.

function DeletedCustomersContent() {
  const { currentUser } = useAuth()
  const { rightsLoading } = useRights()

  const [deleted, setDeleted]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [recoverTarget, setRecoverTarget] = useState(null)
  const [recovering, setRecovering]     = useState(false)
  const [successMsg, setSuccessMsg]     = useState(null)

  useEffect(() => {
    if (currentUser) loadDeleted()
  }, [currentUser])

  async function loadDeleted() {
    try {
      setLoading(true)
      setError(null)
      // M1's getCustomers for ADMIN/SUPERADMIN returns all statuses.
      // Filter INACTIVE here to show only soft-deleted records.
      const all = await getCustomers(currentUser?.id)
      setDeleted(all.filter(c => c.record_status === 'INACTIVE'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRecover() {
    if (!recoverTarget) return
    try {
      setRecovering(true)
      // M1's recoverCustomer sets record_status = 'ACTIVE' and updates stamp
      await recoverCustomer(recoverTarget.custno, currentUser?.email)
      // Remove from local deleted list immediately
      setDeleted(prev => prev.filter(c => c.custno !== recoverTarget.custno))
      setSuccessMsg(`${recoverTarget.custname} has been restored to active.`)
      setRecoverTarget(null)
      // Auto-dismiss success message after 4s
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err) {
      setError(err.message)
    } finally {
      setRecovering(false)
    }
  }

  if (loading || rightsLoading) return <LoadingSpinner message="Loading deleted customers..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700
                        px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Deleted Customers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Inactive customer records. Use Recover to restore them to active status.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-5 flex items-center gap-2 bg-green-50 border
                        border-green-200 text-green-700 text-sm px-4 py-3
                        rounded-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Customer #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Pay Term
              </th>
              {/* Stamp always shown here — page is ADMIN/SUPERADMIN only (M2 spec) */}
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Stamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deleted.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center
                                           text-gray-400 text-sm">
                  <svg className="mx-auto mb-3 text-gray-300" width="40" height="40"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="1.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  No deleted customers. All records are active.
                </td>
              </tr>
            ) : (
              deleted.map(customer => (
                <tr key={customer.custno} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.custno}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm
                                  font-medium text-gray-900">
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
                  {/* Stamp shown — ADMIN/SUPERADMIN only page (M2 + M4 spec) */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm
                                  text-gray-400 italic">
                    {customer.stamp ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setRecoverTarget(customer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 text-xs font-semibold text-green-700 bg-green-50
                                 hover:bg-green-100 transition"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 .49-5.1L1 10" />
                      </svg>
                      Recover
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Recover Confirm Dialog ── */}
      {recoverTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center
                        justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm
                          mx-4 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100
                              flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="#15803d" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-5.1L1 10" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Recover Customer
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to restore{' '}
                  <span className="font-semibold text-gray-800">
                    {recoverTarget.custname}
                  </span>{' '}
                  to active status?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setRecoverTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600
                           border border-gray-300 rounded-lg hover:bg-gray-50
                           transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRecover}
                disabled={recovering}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600
                           rounded-lg hover:bg-green-700 transition disabled:opacity-60"
              >
                {recovering ? 'Recovering...' : 'Yes, Recover'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function DeletedCustomers() {
  return (
    <ErrorBoundary>
      <DeletedCustomersContent />
    </ErrorBoundary>
  )
}