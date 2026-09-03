import { Outlet, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Plus } from "lucide-react"
import Sidebar from "./Sidebar"
import AppHeader from "./AppHeader"
import BottomNav from "./BottomNav"

/**
 * AppLayout — root shell for all protected app routes.
 *
 * Desktop (≥1024px): floating sidebar on the left, floating header, and bottom-right FAB.
 * Mobile (<1024px): full-width content with notched stadium BottomNav pinned at bottom.
 */
export default function AppLayout() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex" style={{ background: "var(--neu-bg)" }}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <Sidebar />

      {/*  Main column — offset by sidebar width + its left margin */}
      <div className="flex flex-col flex-1 min-w-0 lg:ml-68">
        {/* Top header */}
        <AppHeader />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 pb-28 lg:pb-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/*  Desktop Floating Add Transaction FAB (Bottom-Right)  */}
      <motion.button
        whileHover="hover"
        whileTap="tap"
        onClick={() => navigate("/transactions")}
        className="group hidden lg:flex fixed bottom-8 right-8 z-30 items-center gap-3 pl-3.5 pr-5 py-3 rounded-2xl cursor-pointer select-none overflow-hidden"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-raised)",
        }}
        variants={{
          hover: {
            y: -4,
            scale: 1.03,
            boxShadow:
              "7px 7px 16px var(--neu-dark), -5px -5px 14px var(--neu-light)",
          },
          tap: {
            y: 0,
            scale: 0.97,
            boxShadow: "var(--neu-pressed)",
          },
        }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        aria-label="Add transaction"
      >
        {/* Animated icon container: rotates 90deg and springs on hover */}
        <motion.div
          variants={{
            hover: { rotate: 90, scale: 1.12 },
            tap: { scale: 0.9 },
          }}
          transition={{ type: "spring", stiffness: 500, damping: 22 }}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
          style={{
            background: "linear-gradient(145deg, #6366f1, #4338ca)",
          }}
        >
          <Plus size={18} strokeWidth={2.8} />
        </motion.div>

        {/* Text with color transition and spring */}
        <div className="flex flex-col items-start leading-tight">
          <span className="text-sm font-extrabold text-neutral-800 group-hover:text-brand-600 transition-colors">
            Add Transaction
          </span>
        </div>
      </motion.button>

      {/*  Mobile Bottom Nav (hidden on desktop) */}
      <BottomNav />
    </div>
  )
}
