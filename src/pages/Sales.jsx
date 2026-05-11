import { useState, useEffect } from 'react'
import { getSalesByCustomer, getSalesDetail, getCustomers } from '../services/customerService'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

function SalesContent() {
  const { currentUser } = useAuth()
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSales, setLoadingSales] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [salesDetail, setSalesDetail] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

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

    loadCustomers()
  }, [currentUser])

  async function handleCustomerChange(custno) {
    setSelectedCustomer(custno)
    if (!custno) { setSales([]); return }

    setLoadingSales(true)
    try {
      const data = await getSalesByCustomer(custno)
      setSales(data)
    } catch (err) {
      console.error('Error loading sales:', err)
      setSales([])
    } finally {
      setLoadingSales(false)
    }
  }

  async function handleViewDetail(transno) {
    setSelectedTransaction(transno)
    setLoadingDetail(true)
    try {
      const detail = await getSalesDetail(transno)
      setSalesDetail(detail)
    } catch (err) {
      console.error('Error loading sales detail:', err)
      setSalesDetail([])
    } finally {
      setLoadingDetail(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading..." />

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
      <h1 className="text-2xl font-bold mb-4">Sales Transactions</h1>
      <p className="text-gray-600 mb-4">View-only sales history - No add/edit/delete operations</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Select a customer --</option>
          {customers.map((customer) => (
            <option key={customer.custno} value={customer.custno}>
              {customer.custno} - {customer.custname}
            </option>
          ))}
        </select>
      </div>

      {loadingSales ? (
        <LoadingSpinner message="Loading sales..." />
      ) : sales.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            {selectedCustomer ? 'No sales transactions found for this customer' : 'Please select a customer to view their sales'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.transno}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{sale.transno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(sale.salesdate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.custno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{sale.empno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => handleViewDetail(sale.transno)} className="text-blue-600 hover:text-blue-800">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sales Detail - {selectedTransaction}</h2>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            {loadingDetail ? (
              <LoadingSpinner message="Loading sales detail..." />
            ) : salesDetail.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No items found</p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product Code</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salesDetail.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-mono">{item.prodcode}</td>
                      <td className="px-4 py-2 text-sm">{item.product?.description || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{item.product?.unit || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sales() {
  return (
    <ErrorBoundary>
      <SalesContent />
    </ErrorBoundary>
  )
}
