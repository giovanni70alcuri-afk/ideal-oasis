import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Verifica accesso…</span>
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}
