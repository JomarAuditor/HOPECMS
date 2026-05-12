import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { updateCustomer } from '../services/customerService'

export default function EditCustomerModal({ customer, onClose, onSuccess }) {
  const { currentUser } = useAuth()

  // Pre-fill form with existing customer data (M2 spec)
  const [form, setForm] = useState({
    custname: customer.custname || '',
    address:  customer.address  || '',
    payterm:  customer.payterm  || 'COD',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.custname.trim()) {
      setError('Customer Name is required.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      // M1's updateCustomer handles stamp update and Supabase update
      const updated = await updateCustomer(customer.custno, form, currentUser?.email)
      onSuccess(updated)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update customer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Customer</h2>
            <p className="text-xs text-gray-400 mt-0.5">{customer.custno}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700
                          text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">

          {/* custno is read-only on edit — cannot change the primary key */}
          <Field label="Customer No.">
            <input
              value={customer.custno}
              readOnly
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                         bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </Field>

          <Field label="Customer Name">
            <input
              value={form.custname}
              onChange={e => set('custname', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Address">
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          {/* Payterm dropdown — COD / 30D / 45D only (M2 spec) */}
          <Field label="Payment Term">
            <select
              value={form.payterm}
              onChange={e => set('payterm', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="COD">COD</option>
              <option value="30D">30D</option>
              <option value="45D">45D</option>
            </select>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600
                       border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg
                       transition disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500
                         uppercase tracking-wide mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}