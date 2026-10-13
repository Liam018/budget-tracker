import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Lock, Wallet, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react"
import MorphEyeIcon from "../components/ui/MorphEyeIcon"
import PasswordRequirements from "../components/ui/PasswordRequirements"
import { supabase } from "../lib/supabase"
import { required, minLength, passwordStrength, matches, validateField } from "../lib/validators"
import { toast } from "../components/ui"
import { NEU } from "../lib/neu"
import { neuButtonHover, neuButtonTap } from "../lib/animations"

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

export default function ResetPasswordPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Guard: Verify that a valid recovery session or token exists
  useEffect(() => {
    let active = true

    async function verifyRecoverySession() {
      // 1. Check if Supabase passed an error in the URL hash (e.g. expired or invalid token)
      const hash = window.location.hash
      if (hash && hash.includes("error=")) {
        const params = new URLSearchParams(hash.replace(/^#/, "?"))
        const errorDesc =
          params.get("error_description")?.replace(/\+/g, " ") ||
          "Password reset link is invalid or has expired."
        toast.error(errorDesc)
        navigate("/forgot-password", { replace: true })
        return
      }

      // 2. Check if a session exists
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!active) return

      if (!session) {
        toast.error("No active password reset session. Please request a new recovery link.")
        navigate("/forgot-password", { replace: true })
        return
      }

      setCheckingSession(false)
    }

    verifyRecoverySession()

    // Listen for PASSWORD_RECOVERY event from Supabase
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setCheckingSession(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [navigate])

  const rules = {
    password: [required("New password"), minLength(8, "New password"), passwordStrength()],
    confirmPassword: [
      required("Confirm password"),
      matches(() => form.password, "Passwords do not match."),
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

    if (field === "password" && touched.confirmPassword) {
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

    setTouched({ password: true, confirmPassword: true })

    const passErr = validateField(form.password, ...rules.password)
    const confErr =
      validateField(form.confirmPassword, ...rules.confirmPassword) ||
      (form.password !== form.confirmPassword ? "Passwords do not match." : null)

    const newErrors = { password: passErr, confirmPassword: confErr }
    setErrors(newErrors)

    if (passErr || confErr) return

    setSubmitting(true)
    setServerError("")

    try {
      const { error } = await supabase.auth.updateUser({
        password: form.password,
      })
      if (error) throw error

      setIsSuccess(true)
      toast.success("Password reset successfully!")

      // Invalidate the recovery session so this page cannot be used or accessed again
      await supabase.auth.signOut()

      // Clear any URL hash containing the recovery token
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname)
      }
    } catch (err) {
      const msg = err?.message || "Failed to reset password. The recovery link may have expired."
      setServerError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (checkingSession && !isSuccess) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div
          className="p-8 rounded-3xl text-center space-y-3 border border-neutral-200/80"
          style={{ background: NEU.bg, boxShadow: NEU.raised }}
        >
          <Loader2 size={24} className="animate-spin text-brand-600 mx-auto" />
          <p className="text-xs font-bold text-neutral-600">Verifying reset session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          to="/welcome"
          className="inline-flex items-center gap-2 text-neutral-800 hover:text-brand-600 transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Wallet size={20} />
          </div>
          <span className="font-extrabold text-xl tracking-tight">Kuri</span>
        </Link>
        <h2 className="mt-4 text-2xl font-black text-neutral-800 tracking-tight">
          Reset Your Password
        </h2>
        <p className="mt-1 text-xs text-neutral-500 font-medium">
          Create a new strong password for your account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div
          className="rounded-3xl p-6 sm:p-8 border border-neutral-200/80"
          style={{
            background: NEU.bg,
            boxShadow: NEU.raised,
          }}
        >
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-800 tracking-tight">
                  Password Updated!
                </h3>
                <p className="text-xs text-neutral-500 mt-1 font-medium">
                  Your password has been changed successfully. You can now sign in with your new credentials.
                </p>
              </div>

              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                onClick={() => navigate("/login")}
                className="w-full mt-4 py-3 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-sm cursor-pointer transition-all"
              >
                Sign In to Your Account
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {serverError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div
                  className={`relative flex items-center h-11 px-3.5 rounded-xl border transition-all ${
                    errors.password ? "border-rose-400" : "border-neutral-300/40"
                  }`}
                  style={{
                    background: NEU.bg,
                    boxShadow: NEU.insetSm,
                  }}
                >
                  <Lock size={15} className="text-neutral-400 shrink-0 mr-2.5" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => {
                      setPasswordFocused(false)
                      handleBlur("password")
                    }}
                    autoComplete="new-password"
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-neutral-800 outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    <MorphEyeIcon visible={showPassword} size={16} />
                  </button>
                </div>
                <PasswordStrengthBar password={form.password} />
                <PasswordRequirements password={form.password} isFocused={passwordFocused} />
                {errors.password && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-extrabold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
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
                  <Lock size={15} className="text-neutral-400 shrink-0 mr-2.5" />
                  <input
                    name="confirmPassword"
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
                    onClick={() => setShowConfirm((v) => !v)}
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

              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Reset Password</span>
                  </>
                )}
              </motion.button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
