import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UserRightsProvider } from './context/UserRightsContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import DeletedCustomersGuard from './components/DeletedCustomersGuard'
import AppShell from './components/AppShell'
import { useAuth } from './context/AuthContext' // We need this for the shell

import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Products from './pages/Products'
import Admin from './pages/Admin'
import DeletedCustomers from './pages/DeletedCustomers'

// We create a small helper component to pass the user to the shell
// because useAuth must be used INSIDE AuthProvider
function AuthenticatedLayout() {
  const { currentUser } = useAuth()
  return <AppShell user={currentUser} />
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <UserRightsProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected routes wrapped in AppShell (Layout) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/customers" element={<Customers />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/products" element={<Products />} />
                <Route path="/admin" element={<Admin />} />
                <Route
                  path="/deleted-customers"
                  element={
                    <DeletedCustomersGuard>
                      <DeletedCustomers />
                    </DeletedCustomersGuard>
                  }
                />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </UserRightsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App