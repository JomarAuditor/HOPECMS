import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { softDeleteCustomer } from '../services/customerService'

// CUST_DEL gated — SUPERADMIN only in practice (M2 + M4 spec)
// The parent (Customers.jsx) already guards rendering this with rights.CUST_DEL === 1
export default function SoftDeleteConfirmDialog({ customer, onClose, onSuccess }) {
  const { currentUser } = useAuth()

  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState(null)

  async function handleConfirm() {
    try {
      setDeleting(true)
      setError(null)
      // M1's softDeleteCustomer sets record_status = 'INACTIVE' and updates stamp
      const updated = await softDeleteCustomer(customer.custno, currentUser?.email)
      onSuccess(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to delete customer.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">

        {/* Icon + message */}
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100
                          flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="#dc2626" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Delete Customer</h2>
            {/* M2 spec: show customer name in the dialog */}
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to deactivate{' '}
              <span className="font-semibold text-gray-800">{customer.custname}</span>?
              {' '}This will mark the record as inactive.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700
                          text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600
                       border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600
                       rounded-lg hover:bg-red-700 transition disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>

      </div>
    </div>
  )
}