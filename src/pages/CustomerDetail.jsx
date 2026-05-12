import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import {
  getCustomers,
  getSalesByCustomer,
  getSalesDetail,
  getCurrentPrice,
} from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

function CustomerDetailContent() {
  const { custno }  = useParams()       // from route /customers/:custno
  const navigate    = useNavigate()
  const { currentUser } = useAuth()
  const { isAdmin, rightsLoading } = useRights()

  const [customer, setCustomer]           = useState(null)
  const [sales, setSales]                 = useState([])
  const [loadingPage, setLoadingPage]     = useState(true)
  const [error, setError]                 = useState(null)

  // SalesDetailModal state
  const [selectedTxn, setSelectedTxn]     = useState(null)
  const [lineItems, setLineItems]         = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    if (currentUser) loadPage()
  }, [currentUser, custno])

  async function loadPage() {
    try {
      setLoadingPage(true)
      setError(null)

      // Re-use M1's getCustomers to find this specific customer.
      // It already respects USER/ADMIN visibility via userType check.
      const all   = await getCustomers(currentUser?.id)
      const found = all.find(c => c.custno === custno)
      if (!found) throw new Error(`Customer "${custno}" not found.`)
      setCustomer(found)

      // M1's getSalesByCustomer — read-only, no write ops (M2 + M5 spec)
      const txns = await getSalesByCustomer(custno)
      setSales(txns)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingPage(false)
    }
  }

  async function handleOpenSalesDetail(txn) {
    setSelectedTxn(txn)
    setLineItems([])
    setLoadingDetail(true)
    try {
      // M1's getSalesDetail returns: transno, prodcode, quantity, product{description, unit}
      const raw = await getSalesDetail(txn.transno)

      // M2 spec: unit price must come from the LATEST pricehist entry
      // M1's getCurrentPrice fetches the most recent effdate record
      const enriched = await Promise.all(
        raw.map(async item => {
          const price = await getCurrentPrice(item.prodcode)
          return { ...item, unitprice: price?.unitprice ?? null }
        })
      )
      setLineItems(enriched)
    } catch (err) {
      console.error('Error loading sales detail:', err)
      setLineItems([])
    } finally {
      setLoadingDetail(false)
    }
  }

  function handleCloseDetail() {
    setSelectedTxn(null)
    setLineItems([])
  }

  if (loadingPage || rightsLoading) return <LoadingSpinner message="Loading customer..." />

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    )
  }

  const initials = customer?.custname?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="p-8">

      {/* Back to list */}
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm font-semibold
                   text-blue-600 hover:text-blue-800 mb-6 transition"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Customers
      </button>

      {/* ── Customer Profile Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center
                       text-white text-lg font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{customer.custname}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{customer.custno}</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${
            customer.record_status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {customer.record_status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6
                        border-t border-gray-100 pt-5">
          <InfoField label="Address" value={customer.address || '—'} />
          <InfoField
            label="Payment Term"
            value={
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5
                               rounded text-xs font-semibold">
                {customer.payterm}
              </span>
            }
          />
          {/* Stamp — ADMIN/SUPERADMIN only (M4 spec) */}
          {isAdmin() && (
            <InfoField
              label="Stamp"
              value={
                <span className="italic text-gray-400 text-sm">
                  {customer.stamp ?? '—'}
                </span>
              }
            />
          )}
        </div>
      </div>

      {/* ── Sales History Panel ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Sales History</h2>
        <p className="text-sm text-gray-500 mb-4">
          Click any transaction row to view its line items.
        </p>

        {sales.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="mx-auto mb-3 text-gray-300" width="40" height="40"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            No sales transactions found for this customer.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium
                                  text-gray-500 uppercase tracking-wider">
                    Trans No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium
                                  text-gray-500 uppercase tracking-wider">
                    Sales Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium
                                  text-gray-500 uppercase tracking-wider">
                    Emp No.
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sales.map(txn => (
                  <tr
                    key={txn.transno}
                    onClick={() => handleOpenSalesDetail(txn)}
                    className="hover:bg-blue-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm
                                   font-semibold text-blue-600">
                      {txn.transno}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {txn.salesdate
                        ? new Date(txn.salesdate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {txn.empno ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Sales Detail Modal ── */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 flex items-center
                        justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4
                          p-6 max-h-[80vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Transaction Detail
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  {selectedTxn.transno}
                  {selectedTxn.salesdate && ` · ${new Date(selectedTxn.salesdate).toLocaleDateString()}`}
                  {selectedTxn.empno && ` · ${selectedTxn.empno}`}
                </p>
              </div>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loadingDetail ? (
              <LoadingSpinner message="Loading line items..." />
            ) : lineItems.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">
                No line items found for this transaction.
              </p>
            ) : (
              <>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium
                                      text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium
                                      text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      {/* Unit price from latest pricehist entry (M2 spec) */}
                      <th className="px-4 py-3 text-left text-xs font-medium
                                      text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium
                                      text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lineItems.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          {/* M1's getSalesDetail joins product table for description + unit */}
                          <p className="font-medium text-gray-900">
                            {item.product?.description ?? item.prodcode}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {item.prodcode}
                            {item.product?.unit ? ` · ${item.product.unit}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.unitprice != null
                            ? `₱${item.unitprice.toFixed(2)}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {item.unitprice != null
                            ? `₱${(item.quantity * item.unitprice).toFixed(2)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={3} className="px-4 py-3 text-right
                                                   font-bold text-gray-800">
                        Total
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        ₱{lineItems
                          .filter(i => i.unitprice != null)
                          .reduce((sum, i) => sum + i.quantity * i.unitprice, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase
                     tracking-wide mb-1">
        {label}
      </p>
      <div className="text-sm text-gray-700">{value}</div>
    </div>
  )
}

export default function CustomerDetail() {
  return (
    <ErrorBoundary>
      <CustomerDetailContent />
    </ErrorBoundary>
  )
}