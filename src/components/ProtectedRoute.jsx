import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  // M4 will implement real authentication check
  // For now, just allow access
  const isAuthenticated = true // Placeholder
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}