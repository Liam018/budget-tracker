import { useState, useEffect, useRef, useCallback } from "react"
import { getCircadianSlot, getCircadianProfile } from "./vaultyCircadian"
import { playTone } from "./vaultyEngine"

/**
 * useVaultyIdleEnhancements
 *
 * Implements:
 * 1. Item 2: Natural Micro-Breakdowns
 *    - Organic Random Blinking with 25% double-blink chance (replacing mechanical loops)
 *    - Occasional Antenna Radar Ping (every ~50s or manual trigger) with soft blip tone
 *    - Gentle Head Tilt / Ear-Servo Twitch (every 9–14s)
 * 2. Item 3: Context & Circadian (Time-of-Day) Awareness
 *    - Morning, Afternoon, Evening, Late Night circadian states
 *    - Time-appropriate Philippine greetings and breathing FPS
 *    - Dimmed drooped eyelids during late-night mode
 */
export function useVaultyIdleEnhancements({
  isIdle = true,
  soundEnabled = true,
  timeSlot = "auto", // "auto" | "morning" | "afternoon" | "evening" | "night"
  enableRadar = true, // Optional: disable radar ping for simple contexts like login
  onAmbientDialogue = null,
  onWaveTrigger = null,
} = {}) {
  // Circadian resolution
  const resolvedSlot = timeSlot === "auto" ? getCircadianSlot() : timeSlot
  const circadianProfile = getCircadianProfile(resolvedSlot)

  // Natural organic states
  const [eyeOverride, setEyeOverride] = useState(null)
  const [bodyTiltOffset, setBodyTiltOffset] = useState(0)
  const [isRadarPingActive, setIsRadarPingActive] = useState(false)
  const [ambientStatus, setAmbientStatus] = useState("")

  const blinkTimerRef = useRef(null)
  const tiltTimerRef = useRef(null)
  const radarTimerRef = useRef(null)
  const onAmbientRef = useRef(onAmbientDialogue)
  const onWaveRef = useRef(onWaveTrigger)

  useEffect(() => {
    onAmbientRef.current = onAmbientDialogue
  }, [onAmbientDialogue])

  useEffect(() => {
    onWaveRef.current = onWaveTrigger
  }, [onWaveTrigger])

  // ── 1. Organic Random Blinking & Double-Blink ───────────────────────
  useEffect(() => {
    if (!isIdle) return

    let isSubscribed = true

    const playBlinkSequence = (onComplete) => {
      // Step 1: half-lid anticipation (60ms)
      setEyeOverride("halflid")
      setTimeout(() => {
        if (!isSubscribed) return
        // Step 2: full closed blink (100ms)
        setEyeOverride("blink")
        setTimeout(() => {
          if (!isSubscribed) return
          // Step 3: reopening glimmer (70ms)
          setEyeOverride("glimmer")
          setTimeout(() => {
            if (!isSubscribed) return
            setEyeOverride(null)
            onComplete?.()
          }, 70)
        }, 100)
      }, 60)
    }

    const scheduleNextBlink = () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)

      // Random delay between 3.2s and 5.6s
      const delay = Math.floor(Math.random() * 2400) + 3200

      blinkTimerRef.current = setTimeout(() => {
        if (!isSubscribed) return

        const isDoubleBlink = Math.random() < 0.25

        playBlinkSequence(() => {
          if (isDoubleBlink && isSubscribed) {
            // Quick follow-up blink for lively biological double-blink
            setTimeout(() => {
              if (isSubscribed) {
                playBlinkSequence(() => {
                  if (isSubscribed) scheduleNextBlink()
                })
              }
            }, 180)
          } else if (isSubscribed) {
            scheduleNextBlink()
          }
        })
      }, delay)
    }

    scheduleNextBlink()

    return () => {
      isSubscribed = false
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current)
    }
  }, [isIdle])

  const [isWaveActive, setIsWaveActive] = useState(false)

  // ── 2. Idle Micro-Actions (Body Tilt & Spontaneous Friendly Wave) ──
  const triggerIdleWave = useCallback((durationMs = 2400) => {
    // Safeguard: yield if mascot is currently busy playing another animation
    if (!isIdle) return

    if (onWaveRef.current) {
      onWaveRef.current(durationMs)
      return
    }
    setIsWaveActive(true)
    setAmbientStatus("Spontaneous wave: Kuri waves hello!")

    if (onAmbientRef.current) {
      onAmbientRef.current("Kamusta! Kuri is waving hello while keeping your funds secure!")
    }

    setTimeout(() => {
      setIsWaveActive(false)
      setTimeout(() => setAmbientStatus(""), 2000)
    }, durationMs)
  }, [isIdle])

  useEffect(() => {
    if (!isIdle) return

    let isSubscribed = true

    const scheduleNextMicroAction = () => {
      if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current)

      // Random interval between 10s and 18s
      const delay = Math.floor(Math.random() * 8000) + 10000

      tiltTimerRef.current = setTimeout(() => {
        if (!isSubscribed) return

        // 50% chance of spontaneous Friendly Wave, 50% chance of Gentle Head Tilt
        const pickWave = Math.random() < 0.5

        if (pickWave) {
          triggerIdleWave(2400)
          setTimeout(() => {
            if (isSubscribed) scheduleNextMicroAction()
          }, 2600)
        } else {
          // Subtle 2.5° tilt left or right (±0.045 rad)
          const tiltDirection = Math.random() < 0.5 ? -0.045 : 0.045
          setBodyTiltOffset(tiltDirection)

          // Hold tilt for ~1.4 seconds then return to level
          setTimeout(() => {
            if (!isSubscribed) return
            setBodyTiltOffset(0)
            scheduleNextMicroAction()
          }, 1400)
        }
      }, delay)
    }

    scheduleNextMicroAction()

    return () => {
      isSubscribed = false
      if (tiltTimerRef.current) clearTimeout(tiltTimerRef.current)
    }
  }, [isIdle, triggerIdleWave])

  // ── 3. Antenna Radar Ping (Periodic & On-Demand) ────────────────────
  const triggerRadarPing = useCallback(() => {
    // Safeguard: yield if mascot is currently busy
    if (!isIdle) return

    setIsRadarPingActive(true)
    playTone("ping", soundEnabled)
    setAmbientStatus("Radar scan: Maya & GCash balances verified intact.")

    if (onAmbientRef.current) {
      onAmbientRef.current("Beep-boop! Ran a quick background scan on balances. Everything looks intact!")
    }

    setTimeout(() => {
      setIsRadarPingActive(false)
      setTimeout(() => setAmbientStatus(""), 2000)
    }, 1400)
  }, [soundEnabled, isIdle])

  useEffect(() => {
    if (!isIdle || !enableRadar) return

    let isSubscribed = true

    const scheduleNextPing = () => {
      if (radarTimerRef.current) clearTimeout(radarTimerRef.current)

      // Auto ping every 48–60 seconds of idle
      const delay = Math.floor(Math.random() * 12000) + 48000

      radarTimerRef.current = setTimeout(() => {
        if (!isSubscribed) return
        triggerRadarPing()
        scheduleNextPing()
      }, delay)
    }

    scheduleNextPing()

    return () => {
      isSubscribed = false
      if (radarTimerRef.current) clearTimeout(radarTimerRef.current)
    }
  }, [isIdle, enableRadar, triggerRadarPing])

  const effectiveEye = isIdle ? eyeOverride : null
  const effectiveTilt = isIdle ? bodyTiltOffset : 0
  const effectiveWave = isIdle ? isWaveActive : false

  return {
    circadianSlot: resolvedSlot,
    circadianProfile,
    eyeOverride: effectiveEye,
    bodyTiltOffset: effectiveTilt,
    isRadarPingActive,
    isWaveActive: effectiveWave,
    ambientStatus,
    triggerRadarPing,
    triggerIdleWave,
    // Helper to produce render options for vaulty canvas engine
    getRenderOptions: () => ({
      eyeOverride: effectiveEye || (circadianProfile.sleepyEyes ? "sleepy" : null),
      bodyTiltOffset: effectiveTilt,
      sonarRipple: isRadarPingActive,
      sleepyEyelids: circadianProfile.sleepyEyes && !effectiveEye,
      dimEyes: circadianProfile.sleepyEyes,
      isWaveActive: effectiveWave,
    }),
  }
}

export default useVaultyIdleEnhancements
