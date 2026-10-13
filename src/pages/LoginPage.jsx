import { useState, useEffect } from "react"
import { Link, useNavigate, Navigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Lock, AlertCircle, Clock, ShieldAlert, ArrowLeft, Volume2, VolumeX } from "lucide-react"
import { MorphIcon } from "morphicons/react"
import { LogIn, Loader2 } from "lucide" // icon data for morphicons
import MorphEyeIcon from "../components/ui/MorphEyeIcon"
import { useAuth } from "../hooks/useAuth"
import { authValidators, validateField, required, email as emailRule } from "../lib/validators"
import { sanitizeEmail } from "../lib/sanitizer"
import { useRateLimiter } from "../hooks/useRateLimiter"
import { toast } from "../components/ui"
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

// Per-field rules used for blur validation
const fieldRules = {
  email: [required("Email"), emailRule()],
  password: [required("Password")],
}

export default function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Show session-expired toast if redirected from a protected route via /login?reason=session_expired
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get("reason") === "session_expired") {
      toast.warning("Session expired", {
        description: "You were signed out automatically. Please log in again.",
        duration: 6000,
      })
      window.history.replaceState({}, "", "/login")
    }
  }, [location.search])

  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)

  // ── Kuri Mascot State & Sound ──
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return typeof window !== "undefined" && localStorage.getItem("kuri_sound") !== "false"
  })
  const [mascotMood, setMascotMood] = useState("wave")
  const [mascotSpeech, setMascotSpeech] = useState("Kamusta! Welcome back to your vault.")
  const [pokePulse, setPokePulse] = useState(false)

  // Server-backed Rate limiting & Account lockout hook (5 attempts -> 60s cooldown with escalating delays)
  const {
    isLocked,
    secondsRemaining,
    remainingAttempts,
    failedAttempts,
    checkDebounce,
    recordFailure,
    recordSuccess,
  } = useRateLimiter({
    action: "login",
    identifier: form.email,
    maxAttempts: 5,
    baseLockoutSeconds: 60,
    debounceMs: 600,
  })

  const isCoveringEyes = isPasswordFocused && !submitting && !isLocked

  // Settle Kuri from greeting wave to idle after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setMascotMood((current) => (current === "wave" ? "idle" : current))
    }, 2400)
    return () => clearTimeout(timer)
  }, [])

  // Reusing canonical useVaultyIdleEnhancements for blinking, head tilt, and spontaneous wave (radar ping disabled)
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
      setMascotMood("alert")
      setMascotSpeech("Vault locked for safety! Cooldown active.")
      playTone("alert", soundEnabled)
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
      "All vaults locked and secure!",
      "Keep your credentials safe!",
      "Ready to track your pesos!",
    ]
    const chosen = greetings[Math.floor(Math.random() * greetings.length)]
    setMascotSpeech(chosen)
    setMascotMood("wave")
    setTimeout(() => {
      if (!isLocked) setMascotMood("idle")
    }, 2000)
  }

  // ── On change: clear error only if the field was already touched ──
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (serverError) {
      setServerError("")
      if (mascotMood === "alert" && !isLocked) {
        setMascotMood("idle")
        setMascotSpeech("Sign in to access Kuri")
      }
    }
    if (touched[name]) {
      const sanitizedVal = name === "email" ? sanitizeEmail(value) : value
      const error = validateField(sanitizedVal, ...(fieldRules[name] ?? []))
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  // ── On blur: mark as touched and validate that field with sanitization ──
  function handleBlur(e) {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const sanitizedVal = name === "email" ? sanitizeEmail(value) : value
    const error = validateField(sanitizedVal, ...(fieldRules[name] ?? []))
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  // ── Password Peek-a-boo Mascot Interactions ──
  function handlePasswordFocus() {
    setIsPasswordFocused(true)
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
    setIsPasswordFocused(false)
    if (!serverError && !isLocked && mascotMood !== "alert") {
      setMascotSpeech("Guarding your funds peacefully! All accounts secure.")
    }
  }

  function handleTogglePassword() {
    setShowPassword((prev) => {
      const next = !prev
      if (isPasswordFocused) {
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

  // ── On submit: sanitize, validate, and check rate limit ──
  async function handleSubmit(e) {
    e.preventDefault()

    // 1. Prevent submit if currently locked out
    if (isLocked) {
      setServerError(`Account temporarily locked. Please wait ${secondsRemaining}s before trying again.`)
      return
    }

    // 2. Prevent rapid click flooding / debouncing
    if (!checkDebounce()) return

    // 3. Sanitize inputs
    const sanitizedData = {
      email: sanitizeEmail(form.email),
      password: form.password,
    }

    // 4. Mark fields touched & run validation
    setTouched({ email: true, password: true })
    const fieldErrors = authValidators.login(sanitizedData)
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setSubmitting(true)
    setServerError("")
    setMascotMood("thinking")
    setMascotSpeech("Unlocking the vault...")

    try {
      await signIn(sanitizedData.email, sanitizedData.password)
      await recordSuccess(sanitizedData.email)
      setMascotMood("celebrate")
      setMascotSpeech("Vault unlocked! Welcome back.")
      playTone("fanfare", soundEnabled)
      triggerHaptic("success")
      setTimeout(() => {
        navigate("/", { replace: true })
      }, 400)
    } catch (err) {
      await recordFailure(sanitizedData.email)
      setMascotMood("alert")
      playTone("alert", soundEnabled)
      triggerHaptic("medium")
      const isBadCredentials = err.message?.toLowerCase().includes("invalid") || err.status === 400
      if (isBadCredentials && remainingAttempts > 1 && remainingAttempts <= 3) {
        setServerError(`${err.message || "Invalid credentials."} (${remainingAttempts - 1} attempt${remainingAttempts - 1 === 1 ? "" : "s"} remaining)`)
        setMascotSpeech(`Wrong combination! ${remainingAttempts - 1} attempt${remainingAttempts - 1 === 1 ? "" : "s"} left.`)
      } else {
        setServerError(err.message || "Invalid email or password.")
        setMascotSpeech("Check your email and password.")
      }
    } finally {
      setSubmitting(false)
    }
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
                peek: isCoveringEyes && showPassword,
              }}
            />
          </motion.button>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-800 mt-1">
            Welcome back
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

        {/* Temporary Account Lockout Banner */}
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
                <p className="font-semibold text-rose-800">Account Temporarily Locked</p>
                <p className="mt-0.5 text-rose-600 leading-relaxed">
                  Too many consecutive failed login attempts ({failedAttempts}).
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
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" className="text-xs font-medium transition-colors" style={{ color: "#4f46e5" }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} style={{ color: "#a0aec0" }} />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
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
            <FieldError message={errors.password} />
          </div>

          {/* Server error (when not locked) */}
          <AnimatePresence>
            {!isLocked && serverError && (
              <motion.div
                className="alert-error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
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
              icon={submitting ? Loader2 : LogIn}
              size={17}
              strokeWidth={2}
              className={submitting ? "animate-spin" : ""}
            />
            {submitting
              ? "Signing in..."
              : isLocked
              ? `Locked (${secondsRemaining}s)`
              : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "#718096" }}>
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-medium transition-colors" style={{ color: "#4f46e5" }}>
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
