import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Customers() {
  const { currentUser } = useAuth()
  const { rights, isAdmin, rightsLoading } = useRights()

  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true)
        const data = await getCustomers(currentUser?.id)
        setCustomers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (currentUser) loadCustomers()
  }, [currentUser])

  if (loading || rightsLoading) return <LoadingSpinner message="Loading customers..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">

      {/* ── Page header + Add button ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        {rights.CUST_ADD === 1 && (
          <button
            onClick={() => alert('Add Customer — wire up your modal here')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Customer
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>

              {/* ── Stamp column: ADMIN / SUPERADMIN only ── */}
              {isAdmin() && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stamp</th>
              )}

              {/* ── Actions column: only if user has Edit OR Delete ── */}
              {(rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + (isAdmin() ? 1 : 0) + (rights.CUST_EDIT === 1 || rights.CUST_DEL === 1 ? 1 : 0) + 1}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.custno} className="hover:bg-gray-50 transition">

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.custno}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.custname}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {customer.address}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {customer.payterm}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      customer.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.record_status}
                    </span>
                  </td>

                  {/* ── Stamp cell: ADMIN / SUPERADMIN only ── */}
                  {isAdmin() && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 italic">
                      {customer.s_tmp ?? '—'}
                    </td>
                  )}

                  {/* ── Actions cell ── */}
                  {(rights.CUST_EDIT === 1 || rights.CUST_DEL === 1) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">

                        {/* Edit button */}
                        {rights.CUST_EDIT === 1 && (
                          <button
                            onClick={() => alert(`Edit customer ${customer.custno}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                        )}

                        {/* Delete button */}
                        {rights.CUST_DEL === 1 && (
                          <button
                            onClick={() => alert(`Delete customer ${customer.custno}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  )
}