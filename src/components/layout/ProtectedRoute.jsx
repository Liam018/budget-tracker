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
    // Only show "session expired" toast if this browser previously had an active session.
    // First-time visitors and users on a new browser/device get a clean redirect.
    const hadSession = localStorage.getItem("bgt-was-authenticated") === "1"
    return <Navigate to={hadSession ? "/welcome?reason=session_expired" : "/welcome"} replace />
  }

  return <Outlet />
}

