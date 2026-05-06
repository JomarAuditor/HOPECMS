import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import Products from './pages/Products'
import Admin from './pages/Admin'
import DeletedCustomers from './pages/DeletedCustomers'

function App() {
  const { currentUser } = useAuth()

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login"         element={<Login />} />
        <Route path="/register"      element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes wrapped in AppShell */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell user={currentUser} />
            </ProtectedRoute>
          }
        >
          <Route path="/customers"         element={<Customers />} />
          <Route path="/sales"             element={<Sales />} />
          <Route path="/products"          element={<Products />} />
          <Route path="/admin"             element={<Admin />} />
          <Route path="/deleted-customers" element={<DeletedCustomers />} />
        </Route>

        {/* Default redirect */}
        <Route path="/"  element={<Navigate to="/login" replace />} />
        <Route path="*"  element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App