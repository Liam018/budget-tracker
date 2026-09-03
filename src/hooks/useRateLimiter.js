import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "../lib/supabase"

/**
 * useRateLimiter hook (Server-Backed with Supabase RPC + LocalStorage fallback)
 *
 * Enforces rate limiting and account lockout directly in Supabase Postgres.
 * Persists across page reloads, new browser tabs, and browser restarts.
 *
 * @param {Object} options
 * @param {string} options.action - Action name ('login', 'register', 'forgot_password')
 * @param {string} [options.identifier] - Identifier being checked (e.g., email or 'global')
 * @param {number} [options.maxAttempts=5] - Maximum allowed attempts before lockout
 * @param {number} [options.baseLockoutSeconds=60] - Lockout duration in seconds
 * @param {number} [options.debounceMs=600] - Rapid click debounce window in ms
 */
export function useRateLimiter({
  action,
  identifier = "",
  maxAttempts = 5,
  baseLockoutSeconds = 60,
  debounceMs = 600,
}) {
  const normalizedId = identifier.trim().toLowerCase() || "anonymous"
  const storageKey = `rate_limit_${action}_${normalizedId}`
  const lastSubmitTimeRef = useRef(0)

  // 1. Initial state from localStorage for instantaneous UI render
  const getLocalState = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()
        if (parsed.lockedUntil && parsed.lockedUntil > now) {
          return {
            isLocked: true,
            secondsRemaining: Math.ceil((parsed.lockedUntil - now) / 1000),
            attempts: parsed.attempts || 0,
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    return { isLocked: false, secondsRemaining: 0, attempts: 0 }
  }, [storageKey])

  const [state, setState] = useState(() => getLocalState())
  const [secondsRemaining, setSecondsRemaining] = useState(() => getLocalState().secondsRemaining)

  // 2. Sync server status from Supabase RPC
  const checkServerStatus = useCallback(
    async (idToCheck = normalizedId) => {
      if (!idToCheck || idToCheck === "anonymous") return

      try {
        const { data, error } = await supabase.rpc("check_rate_limit", {
          p_identifier: idToCheck,
          p_action: action,
          p_max_attempts: maxAttempts,
          p_lockout_seconds: baseLockoutSeconds,
        })

        if (!error && data) {
          const isLocked = Boolean(data.is_locked)
          const remaining = Number(data.remaining_seconds) || 0
          const attempts = Number(data.attempts) || 0

          setState({ isLocked, secondsRemaining: remaining, attempts })
          setSecondsRemaining(remaining)

          if (isLocked && remaining > 0) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                lockedUntil: Date.now() + remaining * 1000,
                attempts,
              })
            )
          } else if (!isLocked) {
            localStorage.removeItem(storageKey)
          }
        }
      } catch (err) {
        console.warn("Rate limit check warning:", err.message)
      }
    },
    [normalizedId, action, maxAttempts, baseLockoutSeconds, storageKey]
  )

  // Re-check server on mount or when identifier changes
  useEffect(() => {
    checkServerStatus(normalizedId)
  }, [checkServerStatus, normalizedId])

  // 3. Local countdown timer
  useEffect(() => {
    if (secondsRemaining <= 0) return

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setState((s) => ({ ...s, isLocked: false, secondsRemaining: 0 }))
          localStorage.removeItem(storageKey)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsRemaining, storageKey])

  /**
   * Check debounce for rapid clicks
   */
  const checkDebounce = useCallback(() => {
    const now = Date.now()
    if (now - lastSubmitTimeRef.current < debounceMs) {
      return false
    }
    lastSubmitTimeRef.current = now
    return true
  }, [debounceMs])

  /**
   * Record a failed attempt to Supabase and update state
   */
  const recordFailure = useCallback(
    async (targetId = normalizedId) => {
      const idToRecord = (targetId || normalizedId).trim().toLowerCase() || "anonymous"

      try {
        const { data, error } = await supabase.rpc("record_rate_limit_attempt", {
          p_identifier: idToRecord,
          p_action: action,
          p_success: false,
          p_max_attempts: maxAttempts,
          p_lockout_seconds: baseLockoutSeconds,
        })

        if (!error && data) {
          const isLocked = Boolean(data.is_locked)
          const remaining = Number(data.remaining_seconds) || 0
          const attempts = Number(data.attempts) || 0

          setState({ isLocked, secondsRemaining: remaining, attempts })
          setSecondsRemaining(remaining)

          if (isLocked && remaining > 0) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                lockedUntil: Date.now() + remaining * 1000,
                attempts,
              })
            )
          }
          return { isLocked, remaining, attempts }
        }
      } catch (err) {
        console.warn("Rate limit record error:", err.message)
      }

      // Fallback local increment if offline
      const nextAttempts = state.attempts + 1
      const isLocked = nextAttempts >= maxAttempts
      const remaining = isLocked ? baseLockoutSeconds : 0
      setState({ isLocked, secondsRemaining: remaining, attempts: nextAttempts })
      setSecondsRemaining(remaining)
      return { isLocked, remaining, attempts: nextAttempts }
    },
    [normalizedId, action, maxAttempts, baseLockoutSeconds, storageKey, state.attempts]
  )

  /**
   * Record a successful attempt (clears lock on server and locally)
   */
  const recordSuccess = useCallback(
    async (targetId = normalizedId) => {
      const idToRecord = (targetId || normalizedId).trim().toLowerCase() || "anonymous"
      localStorage.removeItem(storageKey)
      setState({ isLocked: false, secondsRemaining: 0, attempts: 0 })
      setSecondsRemaining(0)

      try {
        await supabase.rpc("record_rate_limit_attempt", {
          p_identifier: idToRecord,
          p_action: action,
          p_success: true,
          p_max_attempts: maxAttempts,
          p_lockout_seconds: baseLockoutSeconds,
        })
      } catch (err) {
        console.warn("Rate limit reset error:", err.message)
      }
    },
    [normalizedId, action, maxAttempts, baseLockoutSeconds, storageKey]
  )

  const isLocked = secondsRemaining > 0 || state.isLocked
  const remainingAttempts = Math.max(0, maxAttempts - state.attempts)

  return {
    isLocked,
    secondsRemaining,
    remainingAttempts,
    failedAttempts: state.attempts,
    checkDebounce,
    checkServerStatus,
    recordFailure,
    recordSuccess,
  }
}
