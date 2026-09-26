import { useState, useEffect } from "react"
import { motion, AnimatePresence, useDragControls } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { Lock, X, Check, ShieldCheck, AlertCircle, Loader2 } from "lucide"
import { MorphEyeIcon, toast } from "../ui"
import PasswordRequirements from "../ui/PasswordRequirements"
import { useAuth } from "../../hooks/useAuth"
import { useScrollLock } from "../../hooks/useScrollLock"
import { required, minLength, passwordStrength, matches, validateField } from "../../lib/validators"
import { useRateLimiter } from "../../hooks/useRateLimiter"
import { NEU } from "../../lib/neu"
import {
  neuButtonHover,
  neuButtonTap,
  modalVariants,
  mobileSheetVariants,
  backdropVariants,
} from "../../lib/animations"

function PasswordStrengthBar({ password = "" }) {
  const len = password.length
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecial = /[^a-zA-Z0-9]/.test(password)

  let score = 0
  if (len >= 8) score++
  if (len >= 12) score++
  if (hasLetter && hasNumber) score++
  if (hasSpecial) score++

  const config = [
    { label: "Too weak", color: "bg-rose-500", percent: 20 },
    { label: "Weak", color: "bg-amber-500", percent: 40 },
    { label: "Good", color: "bg-blue-500", percent: 65 },
    { label: "Strong", color: "bg-emerald-500", percent: 85 },
    { label: "Very strong", color: "bg-emerald-600", percent: 100 },
  ]

  if (!password) return null
  const current = config[Math.min(score, config.length - 1)]

  return (
    <div className="space-y-1 mt-2">
      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-500">
        <span>Password Strength</span>
        <span className="capitalize">{current.label}</span>
      </div>
      <div
        className="h-1.5 w-full rounded-full overflow-hidden p-0.5"
        style={{
          background: "var(--neu-bg)",
          boxShadow: "var(--neu-inset-sm)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${current.percent}%` }}
          transition={{ duration: 0.25 }}
          className={`h-full rounded-full ${current.color}`}
        />
      </div>
    </div>
  )
}

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { updatePassword, user } = useAuth()

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [isFocusedNew, setIsFocusedNew] = useState(false)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Rate limiter: 5 attempts per 60 seconds
  const { isLocked, secondsRemaining, recordFailure, recordSuccess } = useRateLimiter({
    action: "change_password",
    identifier: user?.id || "anonymous",
    maxAttempts: 5,
    baseLockoutSeconds: 60,
  })

  // Prevent background scroll while modal is open
  useScrollLock(isOpen)

  // Drag controls for swipe-down to dismiss on mobile
  const dragControls = useDragControls()

  // Track responsive viewport state
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  )

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 640)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  function handleDragEnd(event, info) {
    if (info.offset.y > 50 || info.velocity.y > 180) {
      onClose?.()
    }
  }

  // Animation variants depending on mobile vs desktop
  const motionProps = isMobile
    ? {
        drag: "y",
        dragControls: dragControls,
        dragListener: false,
        dragDirectionLock: true,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0.02, bottom: 0.65 },
        dragSnapToOrigin: true,
        onDragEnd: handleDragEnd,
        variants: mobileSheetVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      }
    : {
        drag: false,
        variants: modalVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      }

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose?.()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Reset form when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setErrors({})
      setTouched({})
      setServerError("")
      setShowCurrent(false)
      setShowNew(false)
      setShowConfirm(false)
    }
  }, [isOpen])

  // Validation rules
  const rules = {
    currentPassword: [required("Current password")],
    newPassword: [required("New password"), minLength(8, "New password"), passwordStrength()],
    confirmPassword: [
      required("Confirm password"),
      matches(() => form.newPassword, "Passwords do not match."),
    ],
  }

  function handleChange(field, value) {
    const nextForm = { ...form, [field]: value }
    setForm(nextForm)

    if (serverError) setServerError("")

    if (touched[field]) {
      const err = validateField(value, ...rules[field])
      setErrors((prev) => ({ ...prev, [field]: err }))
    }

    if (field === "newPassword" && touched.confirmPassword) {
      const confirmErr = nextForm.confirmPassword !== value ? "Passwords do not match." : null
      setErrors((prev) => ({ ...prev, confirmPassword: confirmErr }))
    }
  }

  function handleBlur(field) {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const err = validateField(form[field], ...rules[field])
    setErrors((prev) => ({ ...prev, [field]: err }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isLocked) {
      toast.error(`Too many failed attempts. Try again in ${secondsRemaining}s.`)
      return
    }

    // Touch all fields
    const allTouched = {
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    }
    setTouched(allTouched)

    const curErr = validateField(form.currentPassword, ...rules.currentPassword)
    const newErr = validateField(form.newPassword, ...rules.newPassword)
    const confErr =
      validateField(form.confirmPassword, ...rules.confirmPassword) ||
      (form.newPassword !== form.confirmPassword ? "Passwords do not match." : null)

    const newErrors = {
      currentPassword: curErr,
      newPassword: newErr,
      confirmPassword: confErr,
    }

    setErrors(newErrors)

    if (curErr || newErr || confErr) {
      return
    }

    if (form.currentPassword === form.newPassword) {
      setServerError("New password must be different from your current password.")
      return
    }

    setIsSubmitting(true)
    setServerError("")

    try {
      await updatePassword(form.newPassword, form.currentPassword)
      recordSuccess()
      toast.success("Password updated successfully!")
      onClose()
    } catch (err) {
      recordFailure()
      const msg =
        err?.message || "Failed to update password. Please check your current password."
      setServerError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-50 flex pointer-events-none overflow-hidden ${
            isMobile ? "flex-col justify-end" : "items-center justify-center p-4"
          }`}
        >
          {/* ── Pure Frosted Blur Backdrop with synchronized fade-out on exit ── */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-md pointer-events-auto"
            aria-hidden="true"
          />

          {/* ── Adaptive Card (Bottom Sheet on Mobile, Centered Modal on Desktop) ── */}
          <motion.div
            {...motionProps}
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-modal-title"
            className={`relative pointer-events-auto z-10 flex flex-col select-none ${
              isMobile
                ? "w-full max-w-lg mx-auto rounded-t-3xl max-h-[92dvh] h-auto p-5 pb-8 overflow-y-auto"
                : "w-full max-w-md rounded-3xl p-5 sm:p-7"
            }`}
            style={{
              background: "var(--neu-bg)",
              boxShadow: isMobile
                ? "0 -10px 25px -5px rgba(0, 0, 0, 0.12)"
                : "var(--neu-raised)",
              willChange: isMobile ? "transform" : "auto",
            }}
          >
            {/* Mobile Pull Handle Pill (Hidden on desktop) */}
            {isMobile && (
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="pt-1 pb-3 shrink-0 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none"
                aria-label="Drag down to close"
              >
                <div
                  className="w-12 h-1.5 rounded-full transition-transform duration-150 active:scale-95"
                  style={{
                    background: "var(--neu-bg)",
                    boxShadow: "var(--neu-inset-sm)",
                  }}
                />
              </div>
            )}

            {/* Modal Header */}
            <div
              onPointerDown={(e) => {
                if (isMobile && e.target.tagName !== "INPUT" && !e.target.closest("button")) {
                  dragControls.start(e)
                }
              }}
              className={`flex items-center justify-between pb-4 border-b border-neutral-300/40 shrink-0 ${
                isMobile ? "touch-none" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-brand-600 shrink-0"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <MorphIcon icon={Lock} size={18} strokeWidth={2.4} className="text-brand-600" />
                </div>
                <div>
                  <h3
                    id="change-password-modal-title"
                    className="text-base sm:text-lg font-extrabold text-neutral-800 tracking-tight"
                  >
                    Change Password
                  </h3>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    Update your security credentials
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer shrink-0  select-none"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
                aria-label="Close dialog"
              >
                <MorphIcon icon={X} size={15} strokeWidth={2.4} />
              </motion.button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Server Error Notice */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2"
                >
                  <MorphIcon icon={AlertCircle} size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </motion.div>
              )}

              {/* Current Password Field */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div
                  className={`relative flex items-center h-11 px-3.5 rounded-xl border transition-all ${
                    errors.currentPassword ? "border-rose-400" : "border-neutral-300/40"
                  }`}
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <input
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={form.currentPassword}
                    onChange={(e) => handleChange("currentPassword", e.target.value)}
                    onBlur={() => handleBlur("currentPassword")}
                    autoComplete="current-password"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <MorphEyeIcon visible={showCurrent} size={16} />
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password Field */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div
                  className={`relative flex items-center h-11 px-3.5 rounded-xl border transition-all ${
                    errors.newPassword ? "border-rose-400" : "border-neutral-300/40"
                  }`}
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <input
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.newPassword}
                    onChange={(e) => handleChange("newPassword", e.target.value)}
                    onFocus={() => setIsFocusedNew(true)}
                    onBlur={() => {
                      setIsFocusedNew(false)
                      handleBlur("newPassword")
                    }}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <MorphEyeIcon visible={showNew} size={16} />
                  </button>
                </div>
                <PasswordStrengthBar password={form.newPassword} />
                <PasswordRequirements password={form.newPassword} isFocused={isFocusedNew} />
                {errors.newPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div
                  className={`relative flex items-center h-11 px-3.5 rounded-xl border transition-all ${
                    errors.confirmPassword ? "border-rose-400" : "border-neutral-300/40"
                  }`}
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <MorphEyeIcon visible={showConfirm} size={16} />
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Rate Limiting Notice */}
              {isLocked && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <MorphIcon icon={AlertCircle} size={15} className="text-amber-600 shrink-0" />
                  <span>Rate limited. Please wait {secondsRemaining}s before trying again.</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <motion.button
                  whileHover={neuButtonHover}
                  whileTap={neuButtonTap}
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-neutral-700 transition-all cursor-pointer select-none"
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.raisedSm,
                  }}
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ y: -1.5 }}
                  whileTap={{ y: 1 }}
                  type="submit"
                  disabled={isSubmitting || isLocked}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-linear-to-br from-brand-600 to-brand-700 shadow-sm hover:from-brand-700 hover:to-brand-800 disabled:opacity-50 transition-all cursor-pointer select-none"
                >
                  {isSubmitting ? (
                    <>
                      <MorphIcon icon={Loader2} size={15} className="animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <MorphIcon icon={ShieldCheck} size={15} strokeWidth={2.4} />
                      <span>Update Password</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
