import { useState, useEffect } from 'react'
import { getSalesByCustomer, getSalesDetail, getCustomers } from '../services/customerService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

function SalesContent() {
  const { currentUser } = useAuth()
  const [customers, setCustomers]           = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [sales, setSales]                   = useState([])
  const [loading, setLoading]               = useState(true)
  const [loadingSales, setLoadingSales]     = useState(false)
  const [error, setError]                   = useState(null)
  const [selectedTxn, setSelectedTxn]       = useState(null)   // full txn object
  const [salesDetail, setSalesDetail]       = useState([])
  const [loadingDetail, setLoadingDetail]   = useState(false)

  useEffect(() => {
    async function load() {
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
    load()
  }, [currentUser])

  async function handleCustomerChange(custno) {
    setSelectedCustomer(custno)
    setSelectedTxn(null)
    setSalesDetail([])
    if (!custno) { setSales([]); return }
    setLoadingSales(true)
    try {
      const data = await getSalesByCustomer(custno)
      setSales(data)
    } catch (err) {
      console.error(err)
      setSales([])
    } finally {
      setLoadingSales(false)
    }
  }

  async function handleViewDetail(txn) {
    setSelectedTxn(txn)
    setLoadingDetail(true)
    setSalesDetail([])
    try {
      const detail = await getSalesDetail(txn.transno)
      setSalesDetail(detail)
    } catch (err) {
      console.error(err)
      setSalesDetail([])
    } finally {
      setLoadingDetail(false)
    }
  }

  function closeDetail() {
    setSelectedTxn(null)
    setSalesDetail([])
  }

  if (loading) return <LoadingSpinner message="Loading customers..." />

  if (error) return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        Error: {error}
      </div>
    </div>
  )

  const selectedCustName = customers.find(c => c.custno === selectedCustomer)?.custname ?? ''

  return (
    <div className="p-4 md:p-6 lg:p-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">View-only sales history</p>
      </div>

      {/* Customer selector */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          Select Customer
        </label>
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
          <select
            value={selectedCustomer}
            onChange={e => handleCustomerChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50
                       focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
                       transition-all cursor-pointer appearance-none"
          >
            <option value="">— Select a customer —</option>
            {customers.map(c => (
              <option key={c.custno} value={c.custno}>{c.custno} · {c.custname}</option>
            ))}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Sales table + detail panel side by side when detail is open */}
      <div className={`flex gap-5 items-start transition-all ${selectedTxn ? 'flex-col lg:flex-row' : ''}`}>

        {/* Sales list */}
        <div className={`${selectedTxn ? 'w-full lg:flex-1' : 'w-full'} bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden`}>
          {loadingSales ? (
            <div className="p-8"><LoadingSpinner message="Loading sales..." /></div>
          ) : !selectedCustomer ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="mb-3 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <p className="text-sm font-medium">Select a customer to view their sales</p>
            </div>
          ) : sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <svg className="mb-3 text-gray-300" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p className="text-sm font-medium">No transactions found for {selectedCustName}</p>
            </div>
          ) : (
            <>
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedCustName}</p>
                  <p className="text-xs text-gray-400">{sales.length} transaction{sales.length !== 1 ? 's' : ''}</p>
                </div>
                {selectedTxn && (
                  <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-lg">
                    Viewing {selectedTxn.transno}
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-50">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Transaction #', 'Sales Date', 'Emp No.', ''].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {sales.map(sale => (
                      <tr key={sale.transno}
                        onClick={() => handleViewDetail(sale)}
                        className={`cursor-pointer transition-colors ${
                          selectedTxn?.transno === sale.transno
                            ? 'bg-blue-50 border-l-2 border-blue-500'
                            : 'hover:bg-gray-50/80'
                        }`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-600 font-mono">
                          {sale.transno}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {sale.salesdate
                            ? new Date(sale.salesdate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {sale.empno ?? '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <span className="text-xs text-blue-500 font-medium">
                            View →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Detail panel — slides in beside the table, no black overlay */}
        {selectedTxn && (
          <div className="w-full lg:w-[420px] shrink-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between bg-gray-50/50">
              <div>
                <p className="text-sm font-bold text-gray-900">Transaction Detail</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedTxn.transno}
                  {selectedTxn.salesdate && ` · ${new Date(selectedTxn.salesdate).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  {selectedTxn.empno && ` · Emp ${selectedTxn.empno}`}
                </p>
              </div>
              <button onClick={closeDetail}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg hover:bg-gray-100 ml-3 shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Panel body */}
            <div className="overflow-y-auto max-h-[500px]">
              {loadingDetail ? (
                <div className="p-6"><LoadingSpinner message="Loading items..." /></div>
              ) : salesDetail.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <p className="text-sm">No line items found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-50 text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Product</th>
                        <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Unit</th>
                        <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {salesDetail.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900 text-sm">{item.product?.description || item.prodcode}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">{item.prodcode}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {item.product?.unit || '—'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                            {item.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Sales() {
  return <ErrorBoundary><SalesContent /></ErrorBoundary>
}
