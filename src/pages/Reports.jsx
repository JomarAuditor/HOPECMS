import { useState, useEffect, useMemo } from 'react'
import { getProductRevenue, getCustomerSalesSummary, getTopCustomers } from '../services/reportService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

const PAGE_SIZE = 10

// ── Shared helpers ─────────────────────────────────────────────────────────

function fmt(val) {
  return `₱${parseFloat(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function Pagination({ page, total, pageSize, onChange }) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
      <span className="text-xs text-gray-500">
        Showing {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)} disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
          ‹
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition ${
              p === page
                ? 'bg-blue-600 text-white border border-blue-600'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}>
            {p}
          </button>
        ))}
        <button
          onClick={() => onChange(page + 1)} disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs">
          ›
        </button>
      </div>
    </div>
  )
}

const CHART_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']

// ── Tab: Product Revenue ───────────────────────────────────────────────────

function ProductRevenueTab({ data }) {
  const [page, setPage] = useState(1)
  const chartData = data.slice(0, 10).map(p => ({
    name: p.prodcode,
    revenue: parseFloat(p.totalrevenue || 0),
  }))
  const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = data.reduce((s, p) => s + parseFloat(p.totalrevenue || 0), 0)
  const totalQty     = data.reduce((s, p) => s + parseFloat(p.totalqtysold || 0), 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-gray-100">
        <StatCard
          accent="bg-blue-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
          label="Total Products" value={data.length} sub="in revenue report"
        />
        <StatCard
          accent="bg-green-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Total Revenue" value={fmt(totalRevenue)} sub="across all products"
        />
        <StatCard
          accent="bg-purple-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          label="Total Qty Sold" value={parseFloat(totalQty).toLocaleString()} sub="units across all products"
        />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Top 10 by Revenue</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false}/>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₱${(v/1000).toFixed(0)}k`}/>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={v => [fmt(v), 'Revenue']}/>
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table */}
      <div className="px-6 pb-2 pt-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">All Products</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Product Code</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Description</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-right">Qty Sold</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-400">No data available</td></tr>
            ) : paged.map((p, i) => (
              <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                <td className="px-6 py-3.5 text-sm font-mono font-medium text-blue-600">{p.prodcode}</td>
                <td className="px-6 py-3.5 text-sm text-gray-700">{p.description || '—'}</td>
                <td className="px-6 py-3.5 text-sm text-gray-600 text-right">{parseFloat(p.totalqtysold || 0).toLocaleString()}</td>
                <td className="px-6 py-3.5 text-sm font-semibold text-green-600 text-right">{fmt(p.totalrevenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={data.length} pageSize={PAGE_SIZE} onChange={setPage}/>
    </div>
  )
}

// ── Tab: Customer Summary ──────────────────────────────────────────────────

function CustomerSummaryTab({ data }) {
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort]     = useState({ col: 'totalspend', dir: 'desc' })

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return data.filter(c =>
      !q || c.custname?.toLowerCase().includes(q) || c.custno?.toLowerCase().includes(q)
    )
  }, [data, search])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = parseFloat(a[sort.col] || 0)
      const bv = parseFloat(b[sort.col] || 0)
      return sort.dir === 'desc' ? bv - av : av - bv
    })
  }, [filtered, sort])

  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(col) {
    setSort(s => s.col === col ? { col, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { col, dir: 'desc' })
    setPage(1)
  }

  function SortIcon({ col }) {
    if (sort.col !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sort.dir === 'desc' ? '↓' : '↑'}</span>
  }

  const totalSpend = data.reduce((s, c) => s + parseFloat(c.totalspend || 0), 0)
  const totalTxns  = data.reduce((s, c) => s + parseInt(c.totaltransactions || 0), 0)

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-gray-100">
        <StatCard
          accent="bg-blue-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
          label="Total Customers" value={data.length} sub="in summary"
        />
        <StatCard
          accent="bg-green-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Total Revenue" value={fmt(totalSpend)} sub="combined spend"
        />
        <StatCard
          accent="bg-orange-50"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          label="Total Transactions" value={totalTxns.toLocaleString()} sub="across all customers"
        />
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search customers..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"/>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} of {data.length} customers</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-100">
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-gray-600 text-right"
                onClick={() => toggleSort('totaltransactions')}>
                Transactions <SortIcon col="totaltransactions"/>
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest cursor-pointer select-none hover:text-gray-600 text-right"
                onClick={() => toggleSort('totalspend')}>
                Total Spend <SortIcon col="totalspend"/>
              </th>
              <th className="px-6 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Last Sale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-400">No customers found</td></tr>
            ) : paged.map((c, i) => {
              const initials = (c.custname || '??').slice(0, 2).toUpperCase()
              return (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{c.custname}</p>
                        <p className="text-[11px] text-gray-400">{c.custno}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-600 text-right">{c.totaltransactions || 0}</td>
                  <td className="px-6 py-3.5 text-sm font-semibold text-green-600 text-right">{fmt(c.totalspend)}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">
                    {c.lastsaledate ? new Date(c.lastsaledate).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage}/>
    </div>
  )
}

// ── Tab: Top 10 Customers ──────────────────────────────────────────────────

function TopCustomersTab({ data }) {
  // Sort by totalspend descending so customers with ₱0 go to the bottom
  const sorted = [...data].sort((a, b) => parseFloat(b.totalspend || 0) - parseFloat(a.totalspend || 0))

  const chartData = sorted.map(c => ({
    name: c.custname?.split(' ')[0] ?? c.custno,
    spend: parseFloat(c.totalspend || 0),
  }))

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border-b border-gray-100">
        {sorted.slice(0, 3).map((c, i) => (
          <StatCard key={i}
            accent={i === 0 ? 'bg-yellow-50' : i === 1 ? 'bg-gray-100' : 'bg-orange-50'}
            icon={<span className="text-xl">{medals[i]}</span>}
            label={`#${i + 1} Customer`}
            value={c.custname}
            sub={fmt(c.totalspend)}
          />
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Spend Comparison</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/>
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false}
                tickFormatter={v => `₱${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80}/>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={v => [fmt(v), 'Total Spend']}/>
              <Bar dataKey="spend" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leaderboard */}
      <div className="px-6 pt-4 pb-6 space-y-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Leaderboard</p>
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No data available</p>
        ) : sorted.map((c, i) => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 hover:shadow-sm transition-all">
            <div className="w-9 flex-shrink-0 text-center">
              {i < 3
                ? <span className="text-2xl">{medals[i]}</span>
                : <span className="text-sm font-bold text-gray-400">#{i + 1}</span>}
            </div>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
              {(c.custname || '??').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{c.custname}</p>
              <p className="text-[11px] text-gray-400">{c.totaltransactions} transactions</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-bold text-green-600">{fmt(c.totalspend)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Reports Component ─────────────────────────────────────────────────

const TABS = [
  { id: 'product-revenue',  label: 'Product Revenue' },
  { id: 'customer-summary', label: 'Customer Summary' },
  { id: 'top-customers',    label: 'Top 10 Customers' },
]

function ReportsContent() {
  const [activeTab, setActiveTab]         = useState('product-revenue')
  const [productRevenue, setProductRevenue] = useState([])
  const [customerSummary, setCustomerSummary] = useState([])
  const [topCustomers, setTopCustomers]   = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [prod, cust, top] = await Promise.all([
          getProductRevenue(),
          getCustomerSalesSummary(),
          getTopCustomers(),
        ])
        setProductRevenue(prod)
        setCustomerSummary(cust)
        setTopCustomers(top)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner message="Loading reports..." />

  if (error) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
        Error loading reports: {error}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-6xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">CMS Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Business insights and analytics for HOPE, Inc.</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-medium transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'product-revenue'  && <ProductRevenueTab  data={productRevenue}  />}
        {activeTab === 'customer-summary' && <CustomerSummaryTab data={customerSummary} />}
        {activeTab === 'top-customers'    && <TopCustomersTab    data={topCustomers}    />}
      </div>
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
