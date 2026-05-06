export default function PlaceholderPage({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-blue-500"
        style={{ background: '#eff6ff' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-400 text-sm max-w-xs">{description}</p>
      <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
        Coming soon — M3 sprint
      </div>
    </div>
  )
}