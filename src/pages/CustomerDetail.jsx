import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useRights } from '../context/UserRightsContext'
import { getCustomers, getSalesByCustomer, getSalesDetail, getCurrentPrice } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

function StampTooltip({ stamp }) {
  if (!stamp) return <span className="text-gray-400 italic text-sm">—</span>
  const parts = stamp.match(/^(\S+)\s+by\s+(.+)\s+on\s+(\S+)$/)
  const short = parts ? `${parts[1]} · ${parts[3]}` : stamp
  return (
    <div className="relative group inline-block">
      <span className="text-sm text-gray-500 italic cursor-default">{short}</span>
      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-20
                      bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl pointer-events-none">
        {stamp}
        <div className="absolute top-full left-4 border-4 border-transparent border-t-gray-900"/>
      </div>
    </div>
  )
}

function CustomerDetailContent() {
  const { custno }      = useParams()
  const navigate        = useNavigate()
  const { currentUser } = useAuth()
  const { isAdmin, rightsLoading } = useRights()

  const [customer, setCustomer]           = useState(null)
  const [sales, setSales]                 = useState([])
  const [loadingPage, setLoadingPage]     = useState(true)
  const [error, setError]                 = useState(null)
  const [selectedTxn, setSelectedTxn]     = useState(null)
  const [lineItems, setLineItems]         = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => { if (currentUser) loadPage() }, [currentUser, custno])

  async function loadPage() {
    try {
      setLoadingPage(true)
      setError(null)
      const all   = await getCustomers(currentUser?.id)
      const found = all.find(c => c.custno === custno)
      if (!found) throw new Error(`Customer "${custno}" not found.`)
      setCustomer(found)
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
      const raw      = await getSalesDetail(txn.transno)
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

  if (loadingPage || rightsLoading) return <LoadingSpinner message="Loading customer..." />

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">Error: {error}</div>
    </div>
  )

  const initials = customer?.custname?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">

      {/* Back button */}
      <button onClick={() => navigate('/customers')}
        className="flex items-center gap-1.5 text-sm font-semibold text-blue-600
                   hover:text-blue-800 mb-6 transition cursor-pointer group">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             className="group-hover:-translate-x-0.5 transition-transform">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Back to Customers
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">{customer.custname}</h1>
            <p className="text-xs text-gray-400 mt-0.5">{customer.custno}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${
            customer.record_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {customer.record_status}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 border-t border-gray-100 pt-5">
          <InfoField label="Address" value={<span className="text-sm text-gray-700">{customer.address || '—'}</span>} />
          <InfoField label="Payment Term" value={
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">{customer.payterm}</span>
          }/>
          {isAdmin() && (
            <InfoField label="Stamp" value={<StampTooltip stamp={customer.stamp} />} />
          )}
        </div>
      </div>

      {/* Sales history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-0.5">Sales History</h2>
        <p className="text-xs text-gray-400 mb-4">Click any row to view line items.</p>

        {sales.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg className="mx-auto mb-3 text-gray-300" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p className="text-sm">No sales transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Trans No.', 'Sales Date', 'Emp No.'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sales.map(txn => (
                  <tr key={txn.transno} onClick={() => handleOpenSalesDetail(txn)}
                    className="hover:bg-blue-50/60 cursor-pointer transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600">{txn.transno}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {txn.salesdate ? new Date(txn.salesdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{txn.empno ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sales detail modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Transaction Detail</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedTxn.transno}
                  {selectedTxn.salesdate && ` · ${new Date(selectedTxn.salesdate).toLocaleDateString()}`}
                  {selectedTxn.empno && ` · ${selectedTxn.empno}`}
                </p>
              </div>
              <button onClick={() => { setSelectedTxn(null); setLineItems([]) }}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg hover:bg-gray-100">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {loadingDetail ? (
                <LoadingSpinner message="Loading line items..." />
              ) : lineItems.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">No line items found.</p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Product', 'Qty', 'Unit Price', 'Subtotal'].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {lineItems.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{item.product?.description ?? item.prodcode}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{item.prodcode}{item.product?.unit ? ` · ${item.product.unit}` : ''}</p>
                            </td>
                            <td className="px-4 py-3 text-gray-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-gray-700">{item.unitprice != null ? `₱${item.unitprice.toFixed(2)}` : '—'}</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {item.unitprice != null ? `₱${(item.quantity * item.unitprice).toFixed(2)}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-200">
                          <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-800">Total</td>
                          <td className="px-4 py-3 font-bold text-gray-900">
                            ₱{lineItems.filter(i => i.unitprice != null).reduce((s, i) => s + i.quantity * i.unitprice, 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <div>{value}</div>
    </div>
  )
}

export default function CustomerDetail() {
  return <ErrorBoundary><CustomerDetailContent /></ErrorBoundary>
}
