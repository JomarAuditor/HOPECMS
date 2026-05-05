export default function PlaceholderPage({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
        style={{ background: '#eff6ff' }}
      >
        {icon}
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
