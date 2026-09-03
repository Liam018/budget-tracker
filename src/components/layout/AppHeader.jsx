import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Plus, Bell, ChevronDown } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

/**
 * Page metadata mapping route paths to titles and context hints.
 */
const PAGE_TITLES = {
  "/":              { title: "Dashboard",     sub: "Financial overview & cash flow" },
  "/transactions":  { title: "Transactions",  sub: "Track your income, expenses & transfers" },
  "/budgets":       { title: "Budgets",        sub: "Manage monthly spending limits" },
  "/accounts":      { title: "Accounts",       sub: "Wallets, banks & cards" },
  "/categories":    { title: "Categories",     sub: "Organize spending groups" },
  "/reports":       { title: "Reports",        sub: "Financial insights & analytics" },
  "/recurring":     { title: "Recurring",      sub: "Subscriptions & scheduled bills" },
  "/notifications": { title: "Notifications",  sub: "Recent alerts & updates" },
  "/converter":     { title: "Currency Converter", sub: "Live exchange rates & forex calculator" },
  "/profile":       { title: "Profile",        sub: "Account settings & security" },
}

function getPageMeta(pathname) {
  return PAGE_TITLES[pathname] ?? { title: "BudgetWise", sub: "" }
}

export default function AppHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { profile, user } = useAuth()

  const { title, sub } = getPageMeta(pathname)
  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const firstName = displayName.split(" ")[0]
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Format today's date for desktop subtitle / context
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const isNotifActive = pathname === "/notifications"
  const isProfileActive = pathname === "/profile"

  return (
    <div className="sticky top-0 z-20 px-4 pt-4 shrink-0">
      <header
        className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-15 rounded-2xl transition-all"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised-sm)",
        }}
      >
        {/* ── Left: Page Title & Context ────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="min-w-0"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-neutral-800 leading-tight truncate">
                {title}
              </h1>
              <span className="hidden xl:inline-block text-[11px] font-semibold text-neutral-400 bg-neutral-200/50 px-2 py-0.5 rounded-md">
                {today}
              </span>
            </div>
            {sub && (
              <p className="text-xs text-neutral-400 leading-tight mt-0.5 hidden sm:block truncate">
                {sub}
              </p>
            )}
          </motion.div>
        </div>

        {/* ── Right: Quick Actions & Profile ─────────────────────── */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* ── Notification Bell (Neumorphic active state on /notifications) ── */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/notifications")}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
              isNotifActive
                ? "text-brand-600"
                : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/50"
            }`}
            style={{
              background: isNotifActive ? "var(--neu-bg)" : "transparent",
              boxShadow: isNotifActive ? "var(--neu-inset-sm)" : "none",
            }}
            aria-label="Notifications"
          >
            <Bell size={18} strokeWidth={isNotifActive ? 2.2 : 1.8} />
            {/* Unread indicator dot with ring */}
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-(--neu-bg)"
              aria-hidden="true"
            />
          </motion.button>

          {/* ── User Profile Pill (Neumorphic active state on /profile) ── */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/profile")}
            className={`flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-full sm:rounded-xl transition-all text-left ${
              isProfileActive ? "text-brand-600" : "hover:bg-neutral-200/40"
            }`}
            style={{
              background: isProfileActive ? "var(--neu-bg)" : "transparent",
              boxShadow: isProfileActive ? "var(--neu-inset-sm)" : "none",
            }}
            aria-label="User profile"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
              style={{
                background: "linear-gradient(145deg, #6366f1, #4338ca)",
              }}
            >
              {initials}
            </div>
            <div className="hidden md:flex flex-col min-w-0 pr-1">
              <span
                className={`text-xs font-bold leading-tight truncate transition-colors ${
                  isProfileActive ? "text-brand-600" : "text-neutral-800"
                }`}
              >
                {firstName}
              </span>
              <span
                className={`text-[10px] leading-tight transition-colors ${
                  isProfileActive ? "text-brand-400" : "text-neutral-400"
                }`}
              >
                Personal
              </span>
            </div>
            {/* <ChevronDown
              size={14}
              className={`hidden md:block transition-colors ${
                isProfileActive ? "text-brand-500" : "text-neutral-400"
              }`}
            /> */}
          </motion.button>
        </div>
      </header>
    </div>
  )
}
