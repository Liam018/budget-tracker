import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

export default function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: "var(--neu-bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="spinner-dark" />
          <p className="text-sm text-neutral-400">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <Outlet /> : <Navigate to="/welcome" replace />
}

