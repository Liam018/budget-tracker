/**
 * src/lib/haptics.js
 * Safe haptic vibration utility for touch-enabled devices.
 */
export function triggerHaptic(type = "light") {
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      if (type === "light") navigator.vibrate(12)
      else if (type === "medium") navigator.vibrate(22)
      else if (type === "success") navigator.vibrate([8, 25, 12])
    } catch {
      // Ignore vibration errors
    }
  }
}
