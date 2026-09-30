import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { LogOut, ChevronRight } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { useConfirm } from "../../hooks/useConfirm"
import { toast } from "../ui"
import { QUICK_ACTIONS, MENU_NAV_ITEMS } from "../../constants/navigation"
import { useScrollLock } from "../../hooks/useScrollLock"
import { NEU } from "../../lib/neu"
import {
  sheetVariants,
  childItemVariants,
  fadeVariants,
  neuButtonHover,
  neuButtonTap,
} from "../../lib/animations"

function triggerHaptic(ms = 8) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate(ms)
    } catch {
      // Ignore vibration failures if unsupported or blocked
    }
  }
}

export default function NavHubSheet({ isOpen, onClose, onNavigate }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const confirm = useConfirm()
  const dragControls = useDragControls()

  // Prevent background scroll while hub sheet is open
  useScrollLock(isOpen)

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "User"
  const email = user?.email || ""
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Filter out "My Profile" from bottom menu since it is prominently featured at the top
  const secondaryMenuItems = MENU_NAV_ITEMS.filter((item) => item.to !== "/profile")

  async function handleSignOutClick() {
    triggerHaptic(10)
    onClose()
    const ok = await confirm({
      title: "Sign Out?",
      description: "Are you sure you want to sign out of your account?",
      confirmText: "Sign Out",
      cancelText: "Stay",
      variant: "warning",
    })

    if (!ok) return

    try {
      await signOut()
      toast.success("Signed out successfully")
      navigate("/welcome", { replace: true })
    } catch {
      // ignore
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="hub-sheet"
          variants={sheetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag="y"
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.04, bottom: 0.55 }}
          onDragEnd={(_e, { offset, velocity }) => {
            if (offset.y > 50 || velocity.y > 300) {
              triggerHaptic(12)
              onClose()
            }
          }}
          className="absolute bottom-17.5 inset-x-0 rounded-3xl pointer-events-auto select-none max-h-[calc(100dvh-6.5rem)] flex flex-col"
          style={{
            background: "var(--neu-bg)",
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.05)",
            willChange: "transform, opacity",
          }}
          role="dialog"
          aria-label="Quick Actions and Navigation Menu"
        >
          {/* ── Tactile Sunken Neumorphic Drag Handle ── */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="w-full flex flex-col items-center pt-3 pb-1 cursor-grab active:cursor-grabbing touch-none select-none group"
            title="Swipe down to dismiss"
          >
            <div
              className="w-10 h-1.2 rounded-full transition-all duration-200 group-hover:w-12 group-active:scale-95"
              style={{
                background: "rgba(180, 185, 200, 0.7)",
                boxShadow: "inset 1px 1px 2px rgba(0,0,0,0.15), 0 1px 1px rgba(255,255,255,0.8)",
              }}
            />
          </div>

          {/* Scrollable Container for Small Mobile Viewports */}
          <div className="overflow-y-auto overscroll-contain scrollbar-none px-5 pb-5 pt-1 flex-1">
            {/* ── Top Interactive Profile Card (Comfortably Sized) ── */}
            <motion.button
              variants={childItemVariants}
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              onClick={() => {
                triggerHaptic(8)
                onNavigate("/profile")
              }}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl mb-4 transition-all cursor-pointer text-left select-none group"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Initials Avatar matching AppHeader design */}
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0 shadow-sm select-none"
                  style={{
                    background: "linear-gradient(145deg, #6366f1, #4338ca)",
                  }}
                >
                  {initials}
                </div>

                {/* Name and Email / View Profile */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm sm:text-base font-extrabold text-neutral-800 tracking-tight leading-tight truncate">
                      {displayName}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide bg-brand-500/10 text-brand-700 shrink-0">
                      Profile
                    </span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-neutral-400 font-medium leading-tight truncate mt-0.5">
                    {email || "View account & preferences"}
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors shrink-0 ml-2">
                <ChevronRight size={17} strokeWidth={2.4} />
              </div>
            </motion.button>

            {/* Section 1: Quick Actions */}
            <div className="mb-5">
              <motion.p
                variants={fadeVariants}
                className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-2.5"
              >
                Quick Actions
              </motion.p>
              <div className="grid grid-cols-3 gap-2.5">
                {QUICK_ACTIONS.map(({ label, icon: Icon, color, to }) => (
                  <motion.button
                    key={label}
                    variants={childItemVariants}
                    whileHover={neuButtonHover}
                    whileTap={neuButtonTap}
                    onClick={() => {
                      triggerHaptic(8)
                      onNavigate(to)
                    }}
                    className="group flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-2xl transition-all cursor-pointer text-center select-none"
                    style={{
                      background: NEU.bg,
                      boxShadow: NEU.raisedSm,
                    }}
                  >
                    <div className="transition-transform duration-200 group-hover:scale-115 group-active:scale-90">
                      <Icon size={20} className={`${color} mb-1.5 sm:w-5.5 sm:h-5.5`} strokeWidth={2.4} />
                    </div>
                    <span className="text-xs sm:text-sm font-extrabold text-neutral-800 tracking-tight leading-none truncate max-w-full">
                      {label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Section 2: Explore More */}
            <div>
              <motion.p
                variants={fadeVariants}
                className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider mb-2.5"
              >
                Explore More
              </motion.p>
              <div className="grid grid-cols-2 gap-2">
                {secondaryMenuItems.map(({ label, icon: Icon, to, desc }) => {
                  const isActive = location.pathname === to
                  return (
                    <motion.button
                      key={to}
                      variants={childItemVariants}
                      whileHover={isActive ? {} : neuButtonHover}
                      whileTap={{ y: 1, boxShadow: isActive ? NEU.insetSm : NEU.pressed }}
                      onClick={() => {
                        triggerHaptic(8)
                        onNavigate(to)
                      }}
                      className={`group flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer select-none ${
                        isActive
                          ? "text-brand-600 font-bold"
                          : "text-neutral-700 hover:text-neutral-900"
                      }`}
                      style={{
                        background: NEU.bg,
                        boxShadow: isActive ? NEU.insetSm : NEU.raisedSm,
                      }}
                    >
                      <div
                        className={`w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 group-active:scale-95 ${
                          isActive ? "bg-brand-500 text-white" : "bg-neutral-200/50 text-neutral-600"
                        }`}
                      >
                        <Icon size={17} className="sm:w-4.5 sm:h-4.5" strokeWidth={2.1} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-extrabold truncate leading-tight">{label}</p>
                        <p className="text-[10px] sm:text-xs text-neutral-400 truncate leading-tight mt-0.5">{desc}</p>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* ── Sign Out Button (With Inset Depression Physics) ── */}
              <motion.button
                variants={childItemVariants}
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                onClick={handleSignOutClick}
                className="w-full mt-2 flex items-center justify-between p-2.5 sm:p-3 rounded-xl text-left transition-all cursor-pointer text-rose-600 hover:text-rose-700 select-none"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-xl flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-600">
                    <LogOut size={16} className="sm:w-4.5 sm:h-4.5" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold truncate leading-tight">Sign Out</p>
                    <p className="text-[10px] sm:text-xs text-neutral-400 truncate leading-tight mt-0.5">End session</p>
                  </div>
                </div>
                <ChevronRight size={15} className="text-rose-400 shrink-0 ml-1" />
              </motion.button>
            </div>
          </div>

          {/* ── Seamless Curved Fillets Bridge (Flawlessly fuses card bottom with 52px circle) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, delay: 0.08 }}
            className="absolute left-1/2 -translate-x-1/2 top-full -mt-px pointer-events-none z-30"
          >
            <svg
              width="112"
              height="30"
              viewBox="-56 0 112 30"
              className="overflow-visible"
            >
              {/* Single unified path: left fillet + center bridge + right fillet */}
              <path
                d="M -54 0 C -35 0, -26 4, -26 20 L -26 25 L 26 25 L 26 20 C 26 4, 35 0, 54 0 L 54 -2 L -54 -2 Z"
                fill="var(--neu-bg)"
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
