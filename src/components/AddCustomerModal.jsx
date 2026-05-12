import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { addCustomer } from '../services/customerService'

export default function AddCustomerModal({ onClose, onSuccess }) {
  const { currentUser } = useAuth()

  const [form, setForm] = useState({
    custno: '', custname: '', address: '', payterm: 'COD',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.custno.trim() || !form.custname.trim()) {
      setError('Customer No. and Customer Name are required.')
      return
    }
    try {
      setSaving(true)
      setError(null)
      // M1's addCustomer handles stamp generation and Supabase insert
      const newCustomer = await addCustomer(form, currentUser?.email)
      onSuccess(newCustomer)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add customer.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Add Customer</h2>
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
          <Field label="Customer No.">
            <input
              value={form.custno}
              onChange={e => set('custno', e.target.value)}
              placeholder="e.g. C-0010"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Customer Name">
            <input
              value={form.custname}
              onChange={e => set('custname', e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </Field>

          <Field label="Address">
            <input
              value={form.address}
              onChange={e => set('address', e.target.value)}
              placeholder="e.g. 123 Main St, Quezon City"
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
            {saving ? 'Saving...' : 'Add Customer'}
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