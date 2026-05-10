import { Link } from 'react-router-dom'

export default function AuthError() {
  const params = new URLSearchParams(window.location.search)
  const message = params.get('error') || 'Authentication error. Please contact your administrator.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-lg text-center p-8 bg-white rounded-xl shadow">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Sign in error</h2>
        <p className="text-gray-600 mb-6">{decodeURIComponent(message)}</p>
        <Link to="/login" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
