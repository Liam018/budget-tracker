import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Lock, User, AlertCircle, Clock, ShieldAlert, ArrowLeft, Volume2, VolumeX } from "lucide-react"
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
import { KuriCanvas, useVaultyIdleEnhancements } from "../components/mascot"
import { playTone } from "../components/mascot/vaultyEngine"
import { triggerHaptic } from "../lib/haptics"

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
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Kuri Mascot State & Sound ──
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("kuri_sound") !== "false"
  })
  const [mascotMood, setMascotMood] = useState("wave")
  const [mascotSpeech, setMascotSpeech] = useState("Kamusta! Ready to create your safe vault?")
  const [pokePulse, setPokePulse] = useState(false)

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

  const isCoveringEyes = (passwordFocused || confirmPasswordFocused) && !submitting && !isLocked
  const isPeeking = isCoveringEyes && (passwordFocused ? showPassword : showConfirm)

  // Settle Kuri from greeting wave to idle after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setMascotMood((current) => (current === "wave" ? "idle" : current))
    }, 2400)
    return () => clearTimeout(timer)
  }, [])

  // Reusing canonical useVaultyIdleEnhancements for blinking, head tilt, and spontaneous wave
  const { getRenderOptions, bodyTiltOffset } = useVaultyIdleEnhancements({
    isIdle: mascotMood === "idle" && !submitting && !isLocked && !isCoveringEyes,
    soundEnabled,
    enableRadar: false, // tilt and wave only
    onWaveTrigger: (durationMs) => {
      if (isCoveringEyes) return
      setMascotMood("wave")
      setTimeout(() => {
        setMascotMood("idle")
      }, durationMs)
    },
  })

  const tiltDeg = bodyTiltOffset ? (bodyTiltOffset > 0 ? 5 : -5) : 0

  // Reflect lockout on Kuri
  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        setMascotMood("alert")
        setMascotSpeech("Registration paused for safety! Cooldown active.")
        playTone("alert", soundEnabled)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isLocked, soundEnabled])

  if (!loading && user) return <Navigate to="/" replace />

  function toggleSound() {
    setSoundEnabled((prev) => {
      const next = !prev
      localStorage.setItem("kuri_sound", String(next))
      if (next) playTone("coin", true)
      return next
    })
    triggerHaptic("light")
  }

  function handlePokeKuri() {
    playTone("coin", soundEnabled)
    triggerHaptic("medium")
    setPokePulse(true)
    setTimeout(() => setPokePulse(false), 500)

    const greetings = [
      "Smart, not kuripot!",
      "Building a safe home for your pesos!",
      "Pick a strong password!",
      "Excited to start budgeting with you!",
    ]
    const chosen = greetings[Math.floor(Math.random() * greetings.length)]
    setMascotSpeech(chosen)
    setMascotMood("wave")
    setTimeout(() => {
      if (!isLocked) setMascotMood("idle")
    }, 2000)
  }

  function handleChange(e) {
    const { name, value } = e.target
    const newForm = { ...form, [name]: value }
    setForm(newForm)
    if (serverError) {
      setServerError("")
      if (mascotMood === "alert" && !isLocked) {
        setMascotMood("idle")
        setMascotSpeech("Fill in your details to get started")
      }
    }
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

  // ── Password Peek-a-boo Mascot Interactions ──
  function handlePasswordFocus() {
    setPasswordFocused(true)
    if (mascotMood !== "alert") {
      setMascotMood("idle")
    }
    if (showPassword) {
      setMascotSpeech("Peeking! Just making sure you typed it right ")
      playTone("peek", soundEnabled)
    } else {
      setMascotSpeech("I'm looking away! Your password is safe ")
      playTone("cover", soundEnabled)
    }
  }

  function handlePasswordBlur(e) {
    handleBlur(e)
    setPasswordFocused(false)
    if (!serverError && !isLocked && mascotMood !== "alert") {
      setMascotSpeech("Creating your personal vault! Let's keep it safe.")
    }
  }

  function handleTogglePassword() {
    setShowPassword((prev) => {
      const next = !prev
      if (passwordFocused) {
        if (next) {
          setMascotSpeech("Peeking! Just making sure you typed it right ")
          playTone("peek", soundEnabled)
        } else {
          setMascotSpeech("Looking away again!")
          playTone("cover", soundEnabled)
        }
      }
      return next
    })
  }

  function handleConfirmPasswordFocus() {
    setConfirmPasswordFocused(true)
    if (mascotMood !== "alert") {
      setMascotMood("idle")
    }
    if (showConfirm) {
      setMascotSpeech("Peeking! Making sure they match ")
      playTone("peek", soundEnabled)
    } else {
      setMascotSpeech("Eyes closed! Double-checking in secret ")
      playTone("cover", soundEnabled)
    }
  }

  function handleConfirmPasswordBlur(e) {
    handleBlur(e)
    setConfirmPasswordFocused(false)
    if (!serverError && !isLocked && mascotMood !== "alert") {
      setMascotSpeech("Almost there! Ready to build your vault.")
    }
  }

  function handleToggleConfirm() {
    setShowConfirm((prev) => {
      const next = !prev
      if (confirmPasswordFocused) {
        if (next) {
          setMascotSpeech("Peeking! Making sure they match ")
          playTone("peek", soundEnabled)
        } else {
          setMascotSpeech("Looking away again!")
          playTone("cover", soundEnabled)
        }
      }
      return next
    })
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
    setMascotMood("thinking")
    setMascotSpeech("Forging your secure vault...")

    try {
      await signUp(sanitizedData.email, sanitizedData.password, sanitizedData.fullName)
      await recordSuccess(sanitizedData.email)
      setMascotMood("celebrate")
      setMascotSpeech("Vault created! Welcome aboard.")
      playTone("fanfare", soundEnabled)
      triggerHaptic("success")
      setSuccess(true)
    } catch (err) {
      await recordFailure(sanitizedData.email)
      setMascotMood("alert")
      playTone("alert", soundEnabled)
      triggerHaptic("medium")
      setServerError(err.message || "Could not create account. Please try again.")
      setMascotSpeech("Oops! Could not create account.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="auth-layout flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card-lg w-full max-w-100 p-8 text-center"
        >
          <div className="flex justify-center mb-5">
            <KuriCanvas
              mood="celebrate"
              size={88}
              animated={true}
              showAura={true}
            />
          </div>
          <h2 className="text-lg font-semibold mb-2 text-neutral-800">Check your email</h2>
          <p className="text-sm mb-6 text-balance text-neutral-500 font-medium">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-neutral-800">{sanitizeEmail(form.email)}</span>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="btn-primary inline-flex w-auto px-6">Go to Sign In</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="auth-layout flex-col">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="card-lg w-full max-w-100 p-5 sm:p-7"
      >
        {/* Top Controls: Back Navigation & Sound Toggle */}
        <div className="flex items-center justify-between mb-3">
          <Link
            to="/welcome"
            className="btn-back"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </Link>
          <button
            type="button"
            onClick={toggleSound}
            className="btn-back h-8 w-8 p-0 rounded-xl flex items-center justify-center text-neutral-500 hover:text-neutral-700 cursor-pointer shrink-0"
            title={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
            aria-label={soundEnabled ? "Mute Kuri sounds" : "Unmute Kuri sounds"}
          >
            {soundEnabled ? (
              <Volume2 size={14} className="text-indigo-600" />
            ) : (
              <VolumeX size={14} />
            )}
          </button>
        </div>

        {/* Header with Interactive Kuri Ro-Vault */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
          <motion.button
            type="button"
            onClick={handlePokeKuri}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            animate={
              pokePulse
                ? { scale: [1, 1.15, 1], rotate: [0, -4, 4, 0] }
                : { rotate: tiltDeg }
            }
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
            }}
            className="cursor-pointer focus:outline-none select-none mb-1 flex items-center justify-center transform-gpu"
            title="Tap Kuri for a greeting & sound!"
            aria-label="Tap Kuri mascot for a greeting and sound"
          >
            <KuriCanvas
              mood={mascotMood}
              size={88}
              animated={true}
              showAura={false}
              renderOptions={{
                ...getRenderOptions(),
                coverEyes: isCoveringEyes,
                peek: isPeeking,
              }}
            />
          </motion.button>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-800 mt-1">
            Create an account
          </h1>
          <motion.p
            key={mascotSpeech}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs sm:text-sm text-neutral-500 mt-1 text-balance font-medium"
          >
            {mascotSpeech}
          </motion.p>
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
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                className={["form-input pl-9 pr-10", errors.password ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                onClick={handleTogglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                style={{ color: "#a0aec0" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
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
                onFocus={handleConfirmPasswordFocus}
                onBlur={handleConfirmPasswordBlur}
                className={["form-input pl-9 pr-10", errors.confirmPassword ? "form-input-error" : ""].join(" ")}
                disabled={submitting || isLocked}
                aria-invalid={!!errors.confirmPassword}
              />
              <button
                type="button"
                onClick={handleToggleConfirm}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                style={{ color: "#a0aec0" }}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
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
