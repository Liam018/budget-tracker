import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, Download, ChevronDown, CheckCircle2, Share, PlusSquare, X } from "lucide-react"
import { triggerHaptic } from "../../lib/haptics"
import { usePWAInstall } from "../../hooks/usePWAInstall"
import { NEU } from "../../lib/neu"
import kuriLogo from "../../assets/kuri-logo-2.png"

/**
 * WelcomeStickyBar — Mobile Floating Quick-Action & PWA Bar
 *
 * Features:
 * - Direct "Add to Home Screen / Install" button prominent on mobile
 * - Interactive confirmation modal for instant installation (triggers native prompt or visual iOS steps)
 * - Auto-Minimizing: Automatically contracts into a subtle floating capsule after 5s of inactivity
 * - Pure subtle Neumorphism: Matches Kuri's signature palette (#edf0f7) with tactile button depressions
 * - Safe-area aware for iPhone Home Indicator and Android gesture navigation
 */
export function WelcomeStickyBar({ show }) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [installedSuccess, setInstalledSuccess] = useState(false)
  const timerRef = useRef(null)

  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall()

  // Auto-minimize after 5 seconds when first shown or expanded
  useEffect(() => {
    if (!show || showInstallModal) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    if (!isMinimized) {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setIsMinimized(true)
      }, 5000)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [show, isMinimized, showInstallModal])

  async function handleDirectInstallConfirm() {
    triggerHaptic("medium")
    if (isInstallable) {
      const accepted = await promptInstall()
      if (accepted) {
        setInstalledSuccess(true)
        setTimeout(() => setShowInstallModal(false), 1600)
      } else {
        setShowInstallModal(false)
      }
    } else {
      setShowInstallModal(false)
    }
  }

  function handleOpenInstallModal(e) {
    e?.stopPropagation()
    triggerHaptic("light")
    setShowInstallModal(true)
  }

  function handleExpand() {
    triggerHaptic("light")
    setIsMinimized(false)
  }

  function handleManualMinimize(e) {
    e.stopPropagation()
    triggerHaptic("light")
    setIsMinimized(true)
  }

  const canInstall = !isInstalled && (isInstallable || isIOS)

  return (
    <>
      <AnimatePresence>
        {show && (
          <div
            className="fixed inset-x-3 z-40 sm:hidden flex justify-center pointer-events-none"
            style={{
              bottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))",
            }}
            role="complementary"
            aria-label="Quick action and install bar"
          >
            {isMinimized ? (
              /* Minimized Floating Vault Pill */
              <motion.button
                key="minimized-pill"
                type="button"
                layoutId="welcomeStickyBarSurface"
                initial={{ scale: 0.85, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 16 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleExpand}
                className="pointer-events-auto h-11 px-3.5 rounded-full flex items-center gap-2.5 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.14)] cursor-pointer"
                style={{
                  background: "var(--neu-bg)",
                }}
                aria-label="Expand quick actions"
              >
                <img
                  src={kuriLogo}
                  alt="Kuri"
                  className="w-6 h-6 object-contain shrink-0 drop-shadow-sm select-none"
                  draggable="false"
                />
                <span className="text-xs font-bold text-neutral-800 tracking-tight">
                  {canInstall ? "Add to Home" : "Get Kuri"}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
              </motion.button>
            ) : (
              /* Full Neumorphic Quick Actions Bar */
              <motion.div
                key="expanded-bar"
                layoutId="welcomeStickyBarSurface"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto w-full max-w-md p-2 rounded-2xl flex items-center justify-between gap-1.5 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.16)]"
                style={{
                  background: "var(--neu-bg)",
                }}
              >
                {/* Brand / Mascot Info */}
                <div className="flex items-center gap-2 pl-1 min-w-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-raised-sm)",
                    }}
                  >
                    <img
                      src={kuriLogo}
                      alt="Kuri"
                      className="w-6 h-6 object-contain shrink-0 drop-shadow-sm select-none pointer-events-none"
                      draggable="false"
                    />
                  </div>
                  <div className="flex flex-col leading-none truncate">
                    <span className="text-xs font-black text-neutral-900 tracking-tight">
                      Kuri
                    </span>
                    <span className="text-[10px] text-neutral-500 font-semibold mt-0.5 truncate">
                      Smart, not kuripot
                    </span>
                  </div>
                </div>

                {/* Actions: Add to Home / Install + Start Free + Minimize */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Direct Add to Home Button */}
                  {canInstall && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.94, boxShadow: NEU.pressed }}
                      onClick={handleOpenInstallModal}
                      className="h-8.5 px-2.5 rounded-xl text-[11px] font-extrabold text-indigo-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
                      style={{
                        background: "rgba(238, 242, 255, 0.9)",
                        boxShadow: "var(--neu-raised-sm)",
                      }}
                      title="Add Kuri to Home Screen"
                      aria-label="Add Kuri to Home Screen"
                    >
                      <Download size={13} className="text-indigo-600" />
                      <span>Add to Home</span>
                    </motion.button>
                  )}

                  {/* Start Free Primary Button */}
                  <Link
                    to="/register"
                    className="btn-primary !w-auto h-8.5 py-0 px-3.5 !rounded-xl text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-transform"
                    aria-label="Create a free Kuri account"
                  >
                    <span>Start Free</span>
                    <ArrowRight size={12} />
                  </Link>

                  {/* Manual Minimize Chevron */}
                  <button
                    type="button"
                    onClick={handleManualMinimize}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 active:scale-90 transition-transform cursor-pointer shrink-0"
                    title="Minimize"
                    aria-label="Minimize quick actions bar"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation & Step-by-Step Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <>
            {/* Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstallModal(false)}
              className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm sm:hidden"
              aria-hidden="true"
            />

            {/* Confirmation Sheet */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-x-3.5 bottom-4 z-50 sm:hidden rounded-3xl p-5 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.22)]"
              style={{
                background: "var(--neu-bg)",
              }}
              role="dialog"
              aria-modal="true"
              aria-label="Install Kuri Confirmation"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--neu-bg)",
                      boxShadow: "var(--neu-raised-sm)",
                    }}
                  >
                    <img src={kuriLogo} alt="Kuri Logo" className="w-9 h-9 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 tracking-tight">
                      Install Kuri App
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      Fast, lightweight, works offline
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body: Native 1-Click for Android/Chrome vs Visual Guide for iOS */}
              {isIOS ? (
                <div className="space-y-2.5 my-3 py-2 border-y border-neutral-300/40 text-neutral-700 text-xs">
                  <p className="font-semibold text-neutral-800">
                    To install on iOS Safari:
                  </p>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      1
                    </span>
                    <span>Tap the <strong className="text-neutral-900 font-bold">Share</strong> button <Share size={13} className="inline text-indigo-600 ml-0.5" /> in your Safari toolbar.</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-600">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      2
                    </span>
                    <span>Scroll down and select <strong className="text-neutral-900 font-bold">Add to Home Screen</strong> <PlusSquare size={13} className="inline text-indigo-600 ml-0.5" />.</span>
                  </div>
                </div>
              ) : (
                <div className="my-3 py-2 text-neutral-600 text-xs space-y-1">
                  <p>
                    Add <strong className="text-neutral-900 font-bold">Kuri</strong> directly to your home screen for quick 1-tap expense tracking and zero loading delays.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowInstallModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 cursor-pointer"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-raised-sm)",
                  }}
                >
                  Maybe Later
                </button>

                {isIOS ? (
                  <button
                    type="button"
                    onClick={() => setShowInstallModal(false)}
                    className="btn-primary flex-1 !py-2.5 !rounded-xl text-xs font-bold"
                  >
                    Got It!
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={installedSuccess}
                    onClick={handleDirectInstallConfirm}
                    className="btn-primary flex-1 !py-2.5 !rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5"
                  >
                    {installedSuccess ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-300" />
                        <span>Installed!</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Add to Home Screen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
export default WelcomeStickyBar
