import { Navigate } from 'react-router-dom'
import { useApp } from '../../lib/AppContext'

export default function RequireSuperAdmin({ children }) {
  const { profile, loading } = useApp()

  if (loading) return null
  if (profile?.role !== 'super_admin') return <Navigate to="/admin" replace />

  return children
}