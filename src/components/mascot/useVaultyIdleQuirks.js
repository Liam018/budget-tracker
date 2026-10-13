import { useEffect, useRef } from "react"

/**
 * useVaultyIdleQuirks
 *
 * Implements web-budget-tracker-requirements.md Section 22.7.1:
 * "Secondary Rare Idle Quirks:
 *  After 25–40 seconds of idle user inactivity, trigger a randomized micro-action:
 *  - Robotic Yawn: Emits a tiny floating 'Zzz' particle from his antenna orb.
 *  - Dial Buffing: Plays a fast self-polish animation where Vaulty buffs his gold belly dial with his left arm."
 *
 * @param {Object} options
 * @param {boolean} [options.enabled=true] - Active listener switch
 * @param {string} [options.currentMood="idle"] - Current mascot mood/animation; only triggers when "idle"
 * @param {number} [options.minSeconds=25] - Minimum idle interval in seconds (default: 25)
 * @param {number} [options.maxSeconds=40] - Maximum idle interval in seconds (default: 40)
 * @param {function} options.onQuirkTrigger - Callback receiving quirk name ("yawn" | "dial_buff")
 */
export function useVaultyIdleQuirks({
  enabled = true,
  currentMood = "idle",
  minSeconds = 25,
  maxSeconds = 40,
  onQuirkTrigger,
}) {
  const onQuirkRef = useRef(onQuirkTrigger)
  const currentMoodRef = useRef(currentMood)

  useEffect(() => {
    onQuirkRef.current = onQuirkTrigger
  }, [onQuirkTrigger])

  useEffect(() => {
    currentMoodRef.current = currentMood
  }, [currentMood])

  const isIdle = currentMood === "idle"

  useEffect(() => {
    // Safeguard: strictly pause inactivity timer while mascot is busy with another animation
    if (!enabled || !isIdle) return

    let timerId = null

    const scheduleTimer = () => {
      if (timerId) clearTimeout(timerId)

      // Random delay between minSeconds and maxSeconds (e.g. 25s–40s)
      const range = Math.max(1, maxSeconds - minSeconds)
      const delayMs = Math.floor(Math.random() * (range + 1) + minSeconds) * 1000

      timerId = setTimeout(() => {
        // Double-check mascot is still truly idle before executing quirk
        if (currentMoodRef.current === "idle" && typeof onQuirkRef.current === "function") {
          const quirk = Math.random() < 0.5 ? "yawn" : "dial_buff"
          onQuirkRef.current(quirk)
        }
      }, delayMs)
    }

    const resetTimerOnActivity = () => {
      scheduleTimer()
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"]
    events.forEach((evt) => {
      window.addEventListener(evt, resetTimerOnActivity, { passive: true })
    })

    // Start fresh inactivity countdown for this idle period
    scheduleTimer()

    return () => {
      if (timerId) clearTimeout(timerId)
      events.forEach((evt) => {
        window.removeEventListener(evt, resetTimerOnActivity)
      })
    }
  }, [enabled, isIdle, minSeconds, maxSeconds])
}

export default useVaultyIdleQuirks
