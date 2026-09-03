import { useState } from "react"
import { Link, Navigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Lock, User, Wallet, CheckCircle, AlertCircle, Clock, ShieldAlert, ArrowLeft } from "lucide-react"
import { MorphIcon } from "morphicons/react"
import { UserPlus, Loader2 } from "lucide" // icon data for morphicons
import MorphEyeIcon from "../components/ui/MorphEyeIcon"
import PasswordRequirements from "../components/ui/PasswordRequirements"
import { useAuth } from "../hooks/useAuth"
import {
  authValidators,
  validateField,
  required,
  email as emailRule,
  minLength,
  maxLength,
  matches,
  passwordStrength,
} from "../lib/validators"
import { sanitizeEmail, sanitizeName } from "../lib/sanitizer"
import { useRateLimiter } from "../hooks/useRateLimiter"

function FieldError({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          className="field-error"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
        >
          <AlertCircle size={12} />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function PasswordStrengthBar({ password }) {
  const len = password.length
  if (len === 0) return null
  const strength = len < 8 ? "weak" : len < 12 ? "fair" : "strong"
  const label = { weak: "Weak", fair: "Fair", strong: "Strong" }[strength]
  const widths = { weak: "33%", fair: "66%", strong: "100%" }
  const colors = { weak: "#ef4444", fair: "#f59e0b", strong: "#10b981" }
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--neu-dark)", opacity: 0.4 }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors[strength] }}
          animate={{ width: widths[strength] }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <span className="text-xs font-medium" style={{ color: colors[strength], minWidth: "2.5rem" }}>{label}</span>
    </div>
  )
}

// Per-field rules for blur/change validation
const fieldRules = (form) => ({
  fullName: [required("Full name"), minLength(2, "Full name"), maxLength(80, "Full name")],
  email: [required("Email"), emailRule()],
  password: [required("Password"), minLength(8, "Password"), passwordStrength()],
  confirmPassword: [required("Confirm password"), matches(() => form.password, "Passwords do not match.")],
})

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth()
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Server-backed rate limiter for registration attempts (5 attempts -> 60s cooldown)
  const {
    isLocked,
    secondsRemaining,
    checkDebounce,
    recordFailure,
    recordSuccess,
  } = useRateLimiter({
    action: "register",
    identifier: form.email,
    maxAttempts: 5,
    baseLockoutSeconds: 60,
    debounceMs: 600,
  })

  if (!loading && user) return <Navigate to="/" replace />

  function handleChange(e) {
    const { name, value } = e.target
    const newForm = { ...form, [name]: value }
    setForm(newForm)
    setServerError("")
    if (touched[name]) {
      const sanitizedVal =
        name === "email" ? sanitizeEmail(value) : name === "fullName" ? sanitizeName(value) : value
      const rules = fieldRules(newForm)[name] ?? []
      const error = validateField(sanitizedVal, ...rules)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
    // When password changes, re-validate confirmPassword if touched
    if (name === "password" && touched.confirmPassword) {
      const error = validateField(newForm.confirmPassword, ...fieldRules(newForm).confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: error }))
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const sanitizedVal =
      name === "email" ? sanitizeEmail(value) : name === "fullName" ? sanitizeName(value) : value
    const rules = fieldRules(form)[name] ?? []
    const error = validateField(sanitizedVal, ...rules)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isLocked) {
      setServerError(`Too many attempts. Please wait ${secondsRemaining}s before trying again.`)
      return
    }

    if (!checkDebounce()) return

    // Sanitize inputs
    const sanitizedData = {
      fullName: sanitizeName(form.fullName),
      email: sanitizeEmail(form.email),
      password: form.password,
      confirmPassword: form.confirmPassword,
    }

    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })
    const fieldErrors = authValidators.register(sanitizedData)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setSubmitting(true)
    setServerError("")

    try {
      await signUp(sanitizedData.email, sanitizedData.password, sanitizedData.fullName)
      await recordSuccess(sanitizedData.email)
      setSuccess(true)
    } catch (err) {
      await recordFailure(sanitizedData.email)
      setServerError(err.message || "Could not create account. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-layout">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card-lg w-full max-w-100 p-8 text-center"
        >
          <div className="flex justify-center mb-5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#f0fdf4" }}>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#2d3748" }}>Check your email</h2>
          <p className="text-sm mb-6 text-balance" style={{ color: "#718096" }}>
            We sent a confirmation link to{" "}
            <span className="font-medium" style={{ color: "#2d3748" }}>{sanitizeEmail(form.email)}</span>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn-primary inline-flex w-auto px-6">Go to Sign In</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="card-lg w-full max-w-100 p-5 sm:p-8"
      >
        <Link
          to="/welcome"
          className="btn-back mb-4"
        >
          <ArrowLeft size={13} />
          <span>Back</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-7">
          <div className="logo-mark mb-3">
            <Wallet className="text-white" size={22} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-800">
            Create an account
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 text-balance">
            Start tracking your expenses and savings today
          </p>
        </div>

        {/* Lockout Banner */}
        <AnimatePresence>
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
              className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-start gap-2.5"
            >
              <ShieldAlert size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-800">Registration Temporarily Paused</p>
                <p className="mt-0.5 text-rose-600 leading-relaxed">
                  Too many registration attempts.
                </p>
                <div className="mt-2 flex items-center gap-1.5 font-medium text-rose-700">
                  <Clock size={13} className="animate-pulse" />
                  <span>Cooldown: Try again in {secondsRemaining}s</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="form-label">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#a0aec0" }} />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Juan dela Cruz"
                value={form.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={["form-input pl-9", errors.fullName ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.fullName}
              />
            </div>
            <FieldError message={errors.fullName} />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="form-label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#a0aec0" }} />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={["form-input pl-9", errors.email ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.email}
              />
            </div>
            <FieldError message={errors.email} />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#a0aec0" }} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                onBlur={(e) => {
                  setPasswordFocused(false)
                  handleBlur(e)
                }}
                className={["form-input pl-9 pr-10", errors.password ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#a0aec0" }}
                aria-label="Toggle password visibility"
                disabled={isLocked}
              >
                <MorphEyeIcon visible={showPassword} size={16} />
              </button>
            </div>
            <PasswordStrengthBar password={form.password} />
            <PasswordRequirements password={form.password} isFocused={passwordFocused} />
            <FieldError message={errors.password} />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#a0aec0" }} />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={["form-input pl-9 pr-10", errors.confirmPassword ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "#a0aec0" }}
                aria-label="Toggle confirm password visibility"
                disabled={isLocked}
              >
                <MorphEyeIcon visible={showConfirm} size={16} />
              </button>
            </div>
            <FieldError message={errors.confirmPassword} />
          </div>

          <AnimatePresence>
            {!isLocked && serverError && (
              <motion.div className="alert-error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            className="btn-primary mt-1"
            disabled={submitting || isLocked}
          >
            <MorphIcon
              icon={submitting ? Loader2 : UserPlus}
              size={17}
              strokeWidth={2}
              className={submitting ? "animate-spin" : ""}
            />
            {submitting
              ? "Creating account..."
              : isLocked
              ? `Locked (${secondsRemaining}s)`
              : "Create account"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "#718096" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-medium transition-colors" style={{ color: "#4f46e5" }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}
