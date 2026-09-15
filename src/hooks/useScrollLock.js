import { useEffect } from "react"

let activeLockCount = 0
let originalBodyOverflow = ""
let originalMainOverflow = ""
let restoreTimeout = null

/**
 * useScrollLock — Prevents background page scrolling while a modal or sheet is open.
 *
 * Locks background scrolling without injecting artificial body padding that causes
 * layout jitter/movement. In tandem with `scrollbar-gutter: stable`, the layout
 * remains completely rock-solid and motionless when opening or closing dialogs.
 *
 * @param {boolean} isLocked - Whether the scroll lock should be active.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    // Cancel any pending unlock from a recently closed modal
    if (restoreTimeout) {
      clearTimeout(restoreTimeout)
      restoreTimeout = null
    }

    const mainEl = document.querySelector("main")

    if (activeLockCount === 0) {
      originalBodyOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"

      if (mainEl) {
        originalMainOverflow = mainEl.style.overflowY
        mainEl.style.overflowY = "hidden"
      }
    }
    activeLockCount++

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1)
      if (activeLockCount === 0) {
        // Delay restoring overflow until exit animations finish (~220ms)
        restoreTimeout = setTimeout(() => {
          document.body.style.overflow = originalBodyOverflow
          if (mainEl) {
            mainEl.style.overflowY = originalMainOverflow
          }
          restoreTimeout = null
        }, 220)
      }
    }
  }, [isLocked])
}
