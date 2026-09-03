import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Mail, ArrowLeft, CheckCircle, Wallet, AlertCircle, Clock, ShieldAlert } from "lucide-react"
import { MorphIcon } from "morphicons/react"
import { Send, Loader2 } from "lucide" // icon data for morphicons
import { useAuth } from "../hooks/useAuth"
import { authValidators, validateField, required, email as emailRule } from "../lib/validators"
import { sanitizeEmail } from "../lib/sanitizer"
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

const fieldRules = {
  email: [required("Email"), emailRule()],
}

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [form, setForm] = useState({ email: "" })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Server-backed rate limiter for password reset requests (3 attempts -> 60s cooldown)
  const {
    isLocked,
    secondsRemaining,
    checkDebounce,
    recordFailure,
    recordSuccess,
  } = useRateLimiter({
    action: "forgot_password",
    identifier: form.email,
    maxAttempts: 3,
    baseLockoutSeconds: 60,
    debounceMs: 600,
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setServerError("")
    if (touched[name]) {
      const sanitizedVal = sanitizeEmail(value)
      const error = validateField(sanitizedVal, ...(fieldRules[name] ?? []))
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  function handleBlur(e) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const sanitizedVal = sanitizeEmail(value)
    const error = validateField(sanitizedVal, ...(fieldRules[name] ?? []))
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (isLocked) {
      setServerError(`Too many reset attempts. Please wait ${secondsRemaining}s before requesting again.`)
      return
    }

    if (!checkDebounce()) return

    const sanitizedData = {
      email: sanitizeEmail(form.email),
    }

    setTouched({ email: true })
    const fieldErrors = authValidators.forgotPassword(sanitizedData)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setSubmitting(true)
    setServerError("")

    try {
      await resetPassword(sanitizedData.email)
      await recordSuccess(sanitizedData.email)
      setSuccess(true)
    } catch (err) {
      await recordFailure(sanitizedData.email)
      setServerError(err.message || "Could not send reset email. Please try again.")
    } finally {
      setSubmitting(false)
    }
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
          to="/login"
          className="btn-back mb-5 sm:mb-6"
        >
          <ArrowLeft size={13} />
          <span>Back to sign in</span>
        </Link>

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-7">
          <div className="logo-mark mb-3">
            <Wallet className="text-white" size={22} strokeWidth={2.2} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-800">
            Reset password
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-70 text-balance">
            Enter your email and we'll send you a recovery link
          </p>
        </div>

        {/* Rate limit banner */}
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
                <p className="font-semibold text-rose-800">Requests Temporarily Limited</p>
                <p className="mt-0.5 text-rose-600 leading-relaxed">
                  Too many password reset attempts.
                </p>
                <div className="mt-2 flex items-center gap-1.5 font-medium text-rose-700">
                  <Clock size={13} className="animate-pulse" />
                  <span>Cooldown: Try again in {secondsRemaining}s</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#f0fdf4" }}>
                <CheckCircle className="text-green-500" size={24} />
              </div>
            </div>
            <h2 className="text-base font-semibold mb-1" style={{ color: "#2d3748" }}>Email sent</h2>
            <p className="text-sm mb-6 text-balance" style={{ color: "#718096" }}>
              Check <span className="font-medium" style={{ color: "#2d3748" }}>{sanitizeEmail(form.email)}</span> for a reset link.
            </p>
            <Link to="/login" className="btn-primary inline-flex w-auto px-6">Back to Sign In</Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
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
                icon={submitting ? Loader2 : Send}
                size={17}
                strokeWidth={2}
                className={submitting ? "animate-spin" : ""}
              />
              {submitting
                ? "Sending..."
                : isLocked
                ? `Locked (${secondsRemaining}s)`
                : "Send reset link"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
