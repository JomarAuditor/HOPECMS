import { useState, useEffect } from 'react'
import { getUsers, activateUser, deactivateUser } from '../services/adminService'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

function AdminContent() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleActivate(userId, userType) {
    try {
      await activateUser(userId, userType)
      alert('User activated successfully!')
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  async function handleDeactivate(userId, userType) {
    try {
      await deactivateUser(userId, userType)
      alert('User deactivated successfully!')
      loadUsers()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner message="Loading users..." />

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
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <p className="text-gray-600 mb-4">Manage user accounts - SUPERADMIN accounts are protected</p>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userid}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                    {user.userid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.username || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.email || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'SUPERADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.user_type === 'ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.record_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    {user.user_type === 'SUPERADMIN' ? (
                      <span className="text-gray-400 text-xs">Protected Account</span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleActivate(user.userid, user.user_type)}
                          disabled={user.record_status === 'ACTIVE'}
                          className="text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleDeactivate(user.userid, user.user_type)}
                          disabled={user.record_status === 'INACTIVE'}
                          className="text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Deactivate
                        </button>
                      </>
                    )}
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

export default function Admin() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  )
}
