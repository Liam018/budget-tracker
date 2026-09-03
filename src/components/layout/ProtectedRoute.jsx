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

  if (!user) {
    // All intentional sign-outs navigate to /welcome directly from the sign-out handler.
    // If we reach here, the session was lost unexpectedly (token expired, network, etc.)
    return <Navigate to="/welcome?reason=session_expired" replace />
  }

  return <Outlet />
}

