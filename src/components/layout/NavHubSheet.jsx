import { useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { QUICK_ACTIONS, MENU_NAV_ITEMS } from "../../constants/navigation"

/**
 * NavHubSheet — Floating Quick Action & Navigation Hub Card.
 * Connected to the central 52px button via curved concave fillets.
 */
export default function NavHubSheet({ isOpen, onClose, onNavigate }) {
  const location = useLocation()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="hub-sheet"
          variants={{
            hidden: {
              opacity: 0,
              scale: 0.82,
              y: 28,
              transformOrigin: "bottom center",
            },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transformOrigin: "bottom center",
              transition: {
                type: "spring",
                stiffness: 380,
                damping: 26,
                mass: 0.85,
                staggerChildren: 0.045,
                delayChildren: 0.06,
              },
            },
            exit: {
              opacity: 0,
              scale: 0.84,
              y: 20,
              transformOrigin: "bottom center",
              transition: {
                type: "spring",
                stiffness: 440,
                damping: 32,
                staggerChildren: 0.02,
                staggerDirection: -1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute bottom-17.5 inset-x-0 rounded-3xl p-5 pb-5 pointer-events-auto"
          style={{
            background: "var(--neu-bg)",
            filter: "drop-shadow(0 12px 28px rgba(0, 0, 0, 0.12)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.05))",
          }}
          role="dialog"
          aria-label="Quick Actions and Navigation Menu"
        >
          {/* ── Header ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: -8 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
              exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
            }}
            className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-200/60"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Quick Hub</p>
              <h3 className="text-sm font-extrabold text-neutral-800">Actions & Navigation</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/50 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </motion.div>

          {/* Section 1: Quick Actions */}
          <div className="mb-5">
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.18 } },
                exit: { opacity: 0, transition: { duration: 0.1 } },
              }}
              className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5"
            >
              New Transaction
            </motion.p>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_ACTIONS.map(({ label, icon: Icon, color, to }) => (
                <motion.button
                  key={label}
                  variants={{
                    hidden: { opacity: 0, y: 14, scale: 0.92 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 450, damping: 24 },
                    },
                    exit: {
                      opacity: 0,
                      y: 8,
                      scale: 0.95,
                      transition: { duration: 0.12, ease: "easeIn" },
                    },
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate(to)}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl transition-all cursor-pointer"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-raised-sm)",
                  }}
                >
                  <Icon size={20} className={`${color} mb-1.5`} strokeWidth={2.4} />
                  <span className="text-xs font-bold text-neutral-700">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Section 2: All Other Pages */}
          <div>
            <motion.p
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.18 } },
                exit: { opacity: 0, transition: { duration: 0.1 } },
              }}
              className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2"
            >
              Explore More
            </motion.p>
            <div className="grid grid-cols-2 gap-2">
              {MENU_NAV_ITEMS.map(({ label, icon: Icon, to, desc }) => {
                const isActive = location.pathname === to
                return (
                  <motion.button
                    key={to}
                    variants={{
                      hidden: { opacity: 0, y: 12, scale: 0.94 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: "spring", stiffness: 450, damping: 24 },
                      },
                      exit: {
                        opacity: 0,
                        y: 6,
                        scale: 0.96,
                        transition: { duration: 0.1, ease: "easeIn" },
                      },
                    }}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onNavigate(to)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isActive
                        ? "text-brand-600 font-bold"
                        : "text-neutral-700 hover:text-neutral-900"
                    }`}
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: isActive ? "var(--neu-inset-sm)" : "var(--neu-raised-sm)",
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-brand-500 text-white" : "bg-neutral-200/50 text-neutral-600"
                      }`}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">{label}</p>
                      <p className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">{desc}</p>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/*  Connected Curved Fillets Bridge (Seamlessly fuses card bottom with 52px circle)  */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-px pointer-events-none z-30">
            <svg
              width="112"
              height="30"
              viewBox="-56 0 112 30"
              className="overflow-visible"
            >
              {/* Left concave fillet */}
              <path
                d="M -54 0 C -35 0, -26 4, -26 20 L -26 0 Z"
                fill="var(--neu-bg)"
              />
              {/* Right concave fillet */}
              <path
                d="M 26 20 C 26 10, 30 -1, 54 0 L 26 -0 Z"
                fill="var(--neu-bg)"
              />
              {/* Center solid bridge */}
              <rect x="-26" y="-5" width="52" height="30" fill="var(--neu-bg)" />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
