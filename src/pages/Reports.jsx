import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getCustomerSalesSummary,
  getTopCustomers,
  getProductRevenue,
} from '../services/reportService'
import ErrorBoundary from '../components/ErrorBoundary'

// ── Skeleton ─────────────────────────────────────────────────────────────────
function RowSkeleton({ cols }) {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {[...Array(cols)].map((__, j) => (
            <td key={j} className="px-6 py-4">
              <div className="h-3 bg-gray-200 rounded w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ── Currency formatter ────────────────────────────────────────────────────────
function currency(val) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 2,
  }).format(val ?? 0)
}

// ── Sort icon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortCol, sortDir }) {
  if (sortCol !== col) return (
    <svg className="inline ml-1 text-gray-300" width="12" height="12"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="5 12 12 19 19 12" />
    </svg>
  )
  return sortDir === 'asc' ? (
    <svg className="inline ml-1 text-blue-600" width="12" height="12"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  ) : (
    <svg className="inline ml-1 text-blue-600" width="12" height="12"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Customer Sales Summary Tab ────────────────────────────────────────────────
function CustomerSalesSummary() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [sortCol, setSortCol] = useState('totalspend')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await getCustomerSalesSummary()
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleSort(col) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const visible = useMemo(() => {
    let filtered = rows.filter(r =>
      r.custname?.toLowerCase().includes(search.toLowerCase().trim())
    )
    filtered.sort((a, b) => {
      let av = a[sortCol], bv = b[sortCol]
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return filtered
  }, [rows, search, sortCol, sortDir])

  if (error) return <ErrorMsg message={error} />

  const cols = [
    { key: 'custname',        label: 'Customer Name' },
    { key: 'totaltransactions', label: 'Transactions' },
    { key: 'totalspend',      label: 'Total Spend' },
    { key: 'lastsaledate',    label: 'Last Sale Date' },
  ]

  return (
    <div>
      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
               width="15" height="15" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer name..."
            className="pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <span className="text-xs text-gray-400">{visible.length} customer(s)</span>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {cols.map(c => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500
                             uppercase tracking-wider cursor-pointer hover:bg-gray-100
                             select-none transition"
                >
                  {c.label}
                  <SortIcon col={c.key} sortCol={sortCol} sortDir={sortDir} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <RowSkeleton cols={4} />
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-16 text-center">
                  <p className="text-sm text-gray-400 font-medium">
                    {search ? `No results for "${search}"` : 'No sales recorded.'}
                  </p>
                </td>
              </tr>
            ) : (
              visible.map(r => (
                <tr key={r.custno} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {r.custname}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {r.totaltransactions}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {currency(r.totalspend)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.lastsaledate
                      ? new Date(r.lastsaledate).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Top Customers Tab ─────────────────────────────────────────────────────────
function TopCustomers() {
  const navigate          = useNavigate()
  const [rows, setRows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await getTopCustomers()
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorMsg message={error} />

  const max = rows[0]?.totalspend ?? 1

  return (
    <div>
      <p className="text-sm text-gray-500 mb-5">
        Top 10 customers ranked by total spend. Click a row to view their detail page.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4
                                     bg-white rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-40" />
                <div className="h-2 bg-gray-100 rounded w-full" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="mx-auto mb-3 text-gray-300" width="40" height="40"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <p className="text-sm font-medium">No sales recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const pct = Math.round((r.totalspend / max) * 100)
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div
                key={r.custno}
                onClick={() => navigate(`/customers/${r.custno}`)}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border
                           border-gray-100 hover:border-blue-200 hover:bg-blue-50
                           cursor-pointer transition shadow-sm group"
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{medals[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                  )}
                </div>

                {/* Name + bar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 truncate
                                  group-hover:text-blue-700 transition">
                      {r.custname}
                    </p>
                    <p className="text-xs text-gray-400 ml-4 flex-shrink-0">
                      {r.totaltransactions} txn{r.totaltransactions !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Bar chart */}
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : i === 1
                          ? 'linear-gradient(90deg, #6b7280, #9ca3af)'
                          : i === 2
                          ? 'linear-gradient(90deg, #b45309, #d97706)'
                          : 'linear-gradient(90deg, #2563eb, #60a5fa)',
                      }}
                    />
                  </div>
                </div>

                {/* Spend */}
                <div className="text-sm font-bold text-gray-800 flex-shrink-0">
                  {currency(r.totalspend)}
                </div>

                {/* Arrow */}
                <svg className="text-gray-300 group-hover:text-blue-500 transition
                                flex-shrink-0"
                     width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Product Revenue Tab ───────────────────────────────────────────────────────
function ProductRevenue() {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      const data = await getProductRevenue()
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <ErrorMsg message={error} />

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        Read-only breakdown of total quantity sold and revenue per product.
      </p>

      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Product', 'Total Qty Sold', 'Total Revenue'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-medium
                                        text-gray-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <RowSkeleton cols={3} />
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-16 text-center">
                  <p className="text-sm text-gray-400 font-medium">
                    No sales recorded.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {r.description}
                    {r.prodcode && (
                      <span className="block text-xs text-gray-400 font-mono mt-0.5">
                        {r.prodcode}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {r.totalqtysold?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    {currency(r.totalrevenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Read-only notice */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        This report is read-only. No add, edit, or delete operations are available.
      </div>
    </div>
  )
}

// ── Shared error component ────────────────────────────────────────────────────
function ErrorMsg({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700
                    px-4 py-3 rounded-lg text-sm">
      Error: {message}
    </div>
  )
}

// ── Main Reports page with tabs ───────────────────────────────────────────────
const TABS = [
  { key: 'summary',  label: 'Customer Sales Summary' },
  { key: 'top',      label: 'Top Customers' },
  { key: 'products', label: 'Product Revenue' },
]

function ReportsContent() {
  const [activeTab, setActiveTab] = useState('summary')

  return (
    <div className="p-4 md:p-8">

      {/* ── Page header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sales and revenue insights across customers and products.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit
                      overflow-x-auto flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition
                        whitespace-nowrap ${
              activeTab === t.key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === 'summary'  && <CustomerSalesSummary />}
      {activeTab === 'top'      && <TopCustomers />}
      {activeTab === 'products' && <ProductRevenue />}
    </div>
  )
}

export default function Reports() {
  return (
    <ErrorBoundary>
      <ReportsContent />
    </ErrorBoundary>
  )
}