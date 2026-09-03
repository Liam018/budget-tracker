import { NavLink, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Wallet as WalletIcon, User as UserIcon, LogOut as LogOutIcon } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { SIDEBAR_NAV_ITEMS } from "../../constants/navigation"

export default function Sidebar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    try {
      await signOut()
      navigate("/welcome", { replace: true })
    } catch {
      // swallow — user is already signed out or network error
    }
  }

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 z-30 p-4">
      {/*
        Floating neumorphic card — margin from all 4 edges via the p-4 on the aside,
        rounded corners on all sides, raised shadow lifts it off the background.
      */}
      <div
        className="flex flex-col w-full h-full py-6 px-4 rounded-2xl"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised-sm)",
        }}
      >

        {/* ── Logo — matches WelcomePage brand mark ─────── */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-xs shrink-0">
            <WalletIcon className="text-white" size={18} strokeWidth={2.4} />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-neutral-800 uppercase leading-none">
            Budget Tracker
          </span>
        </div>

        {/* ── Navigation ────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-none">
          {SIDEBAR_NAV_ITEMS.map(({ label, icon, activeIcon, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                [
                  "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium group",
                  isActive
                    ? "text-brand-600"
                    : "text-neutral-500 hover:text-neutral-700",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* ── Active background: neumorphic inset (pressed into surface) ── */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: "var(--neu-bg)",
                        boxShadow: "var(--neu-inset-sm)",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}

                  {/* ── Active accent bar ─────────────────────────── */}
                  {isActive && (
                    <motion.span
                      layoutId="sidebar-accent"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-brand-500"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}

                  {/* ── Morphicon: springs between idle ↔ active icon ── */}
                  <span className="relative z-10 shrink-0">
                    <MorphIcon
                      icon={isActive ? activeIcon : icon}
                      size={18}
                      strokeWidth={isActive ? 2.2 : 1.8}
                      spring="snappy"
                      className={
                        isActive
                          ? "text-brand-600"
                          : "text-neutral-400 group-hover:text-neutral-600 transition-colors"
                      }
                    />
                  </span>

                  {/* ── Label ─────────────────────────────────────── */}
                  <span className="relative z-10 transition-colors duration-150">{label}</span>

                  {/* ── Hover bg (non-active only) ────────────────── */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-200/40" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── User profile snippet ───────────────────────── */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(200,204,216,0.5)" }}>
          {/* Profile row */}
          <NavLink
            to="/profile"
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors"
          >
            {({ isActive }) => (
              <>
                {/* Neumorphic inset bg — same as nav items */}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-inset-sm)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}

                {/* Active accent bar */}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-accent"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full bg-brand-500"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}

                {/* Hover bg (non-active only) */}
                {!isActive && (
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-200/40" />
                )}

                {/* Avatar */}
                <div
                  className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{
                    background: "linear-gradient(145deg, #6366f1, #4f46e5)",
                    boxShadow: "2px 2px 5px rgba(79,70,229,0.3), -1px -1px 3px rgba(255,255,255,0.5)",
                  }}
                >
                  {initials}
                </div>

                {/* Name + email */}
                <div className="relative z-10 flex-1 min-w-0">
                  <p className={[
                    "text-sm font-semibold truncate leading-tight transition-colors duration-150",
                    isActive ? "text-brand-600" : "text-neutral-700",
                  ].join(" ")}>
                    {displayName}
                  </p>
                  <p className={[
                    "text-xs truncate leading-tight mt-0.5 transition-colors duration-150",
                    isActive ? "text-brand-400" : "text-neutral-400",
                  ].join(" ")}>
                    {user?.email || ""}
                  </p>
                </div>

                <UserIcon
                  size={15}
                  className={[
                    "relative z-10 shrink-0 transition-colors",
                    isActive ? "text-brand-400" : "text-neutral-300 group-hover:text-neutral-400",
                  ].join(" ")}
                />
              </>
            )}
          </NavLink>


          {/* Sign out button */}
          <button
            onClick={handleSignOut}
            className="mt-1 flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-400 hover:text-red-500 transition-colors group"
          >
            <LogOutIcon size={16} className="group-hover:text-red-400 transition-colors" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  )
}
