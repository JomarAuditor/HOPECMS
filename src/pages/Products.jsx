import { useState, useEffect } from 'react'
import { getProducts, getPriceHistory, getCurrentPrice } from '../services/customerService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

// M2 spec: read-only table — NO add/edit/delete buttons under any circumstance
// M4 spec confirmed: zero conditional-render checks for write actions on this page
// M5 spec: QA will verify no Supabase write calls exist for this page
function ProductsContent() {
  const [products, setProducts]     = useState([])
  const [prices, setPrices]         = useState({})   // prodcode → unitprice (from latest pricehist)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')

  // Price history modal
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [priceHistory, setPriceHistory]       = useState([])
  const [loadingHistory, setLoadingHistory]   = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      setLoading(true)
      setError(null)

      // M1's getProducts — read-only (M2 + M5 spec)
      const data = await getProducts()
      setProducts(data)

      // Fetch current price (latest pricehist entry) for each product in parallel
      // M1's getCurrentPrice gets the most recent effdate row
      const priceMap = {}
      await Promise.all(
        data.map(async p => {
          const price = await getCurrentPrice(p.prodcode)
          priceMap[p.prodcode] = price?.unitprice ?? null
        })
      )
      setPrices(priceMap)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleViewPriceHistory(prodCode) {
    setSelectedProduct(prodCode)
    setLoadingHistory(true)
    try {
      // M1's getPriceHistory — read-only (M2 + M5 spec)
      const history = await getPriceHistory(prodCode)
      setPriceHistory(history)
    } catch (err) {
      console.error('Error loading price history:', err)
      setPriceHistory([])
    } finally {
      setLoadingHistory(false)
    }
  }

  const visible = products.filter(p => {
    const q = search.toLowerCase().trim()
    return !q
      || p.prodcode.toLowerCase().includes(q)
      || p.description.toLowerCase().includes(q)
      || (p.unit ?? '').toLowerCase().includes(q)
  })

  if (loading) return <LoadingSpinner message="Loading products..." />

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
      <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalogue</h1>

        {/* Search only — no Add button here at all (M2 + M4 + M5 spec) */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="15" height="15" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        View-only global product registry. All prices reflect the current standard tier.
      </p>

      {/* ── Table ── */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Product Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              {/* Current price from latest pricehist entry (M2 spec) */}
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium
                              text-gray-500 uppercase tracking-wider">
                Price History
              </th>
              {/* No Edit, No Delete, No Add columns — ever (M2 + M4 + M5 spec) */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visible.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center
                                           text-gray-400 text-sm">
                  No products found.
                </td>
              </tr>
            ) : (
              visible.map(product => (
                <tr key={product.prodcode} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm
                                  font-mono text-gray-600">
                    {product.prodcode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {product.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.unit ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm
                                  font-semibold text-gray-800">
                    {prices[product.prodcode] != null
                      ? `₱${prices[product.prodcode].toFixed(2)}`
                      : <span className="text-gray-400 font-normal">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewPriceHistory(product.prodcode)}
                      className="text-blue-600 hover:text-blue-800 font-medium transition cursor-pointer hover:underline"
                    >
                      View History
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Read-only notice */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        This catalogue is read-only. No add, edit, or delete operations are available.
      </div>

      {/* ── Price History Modal ── */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center
                        justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4
                          p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Price History</h2>
                <p className="text-sm text-gray-400 mt-0.5">{selectedProduct}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg hover:bg-gray-100"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loadingHistory ? (
              <LoadingSpinner message="Loading price history..." />
            ) : priceHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-6 text-sm">
                No price history found.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium
                                    text-gray-500 uppercase">
                      Effective Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium
                                    text-gray-500 uppercase">
                      Unit Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {priceHistory.map((p, i) => (
                    <tr key={i} className={i === 0 ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {new Date(p.effdate).toLocaleDateString()}
                        {i === 0 && (
                          <span className="ml-2 text-xs text-blue-600 font-semibold">
                            (current)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap font-semibold">
                        ₱{p.unitprice?.toFixed(2)}
                      </td>
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

export default function Products() {
  return (
    <ErrorBoundary>
      <ProductsContent />
    </ErrorBoundary>
  )
}