import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers, recoverCustomer } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

// Fixed-position tooltip stamp — never clipped by overflow-hidden
function StampCell({ stamp }) {
  const [show, setShow] = useState(false)
  const [pos, setPos]   = useState({ top: 0, left: 0, alignRight: false })
  const ref             = useRef(null)

  if (!stamp) return <span className="text-gray-300 text-xs">—</span>

  const parts  = stamp.match(/^(\S+)\s+by\s+(.+)\s+on\s+(\S+)$/)
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
        className="block text-xs text-gray-500 italic cursor-default truncate max-w-[130px]"
      >
        {short}
      </span>
      {show && (
        <div
          className="fixed z-[9999] pointer-events-none -translate-y-full"
          style={{
            top: pos.top,
            ...(pos.alignRight ? { right: pos.right } : { left: pos.left }),
          }}
        >
          <div className="bg-gray-950 rounded-xl shadow-2xl border border-white/10 overflow-hidden min-w-55">
            <div className={`h-1 w-full ${
              action === 'CREATED'     ? 'bg-green-500' :
              action === 'UPDATED'     ? 'bg-blue-500' :
              action === 'DEACTIVATED' ? 'bg-red-500' :
              action === 'REACTIVATED' ? 'bg-emerald-500' : 'bg-gray-500'
            }`} />
            <div className="px-3.5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${actionColor}`}>
                  {action}
                </span>
              </div>
              {email && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span className="text-[11px] text-gray-300">{email}</span>
                </div>
              )}
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
          <div className={`absolute top-full border-4 border-transparent border-t-gray-950 ${
            pos.alignRight ? 'right-4' : 'left-4'
          }`} />
        </div>
      )}
    </>
  )
}

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
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
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
              <th className="w-[140px] px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Stamp</th>
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
                  {/* Stamp — fixed tooltip, never clipped */}
                  <td className="w-[140px] px-4 py-4">
                    <StampCell stamp={customer.stamp} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setRecoverTarget(customer)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                 text-xs font-semibold text-green-700 bg-green-50
                                 hover:bg-green-100 transition cursor-pointer active:scale-95"
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
                           transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRecover}
                disabled={recovering}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600
                           rounded-lg hover:bg-green-700 transition disabled:opacity-60 cursor-pointer"
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
