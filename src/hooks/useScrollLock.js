import { useEffect } from "react"

let activeLockCount = 0
let originalBodyOverflow = ""
let originalMainOverflow = ""
let isLockedInDom = false

/**
 * Safely restores background scroll styles by stripping the inline override
 * so CSS classes (like `overflow-y-auto`) take over.
 */
function unlockScroll() {
  if (originalBodyOverflow && originalBodyOverflow !== "hidden") {
    document.body.style.overflow = originalBodyOverflow
  } else {
    document.body.style.removeProperty("overflow")
  }

  const mainEl = document.querySelector("main")
  if (mainEl) {
    if (originalMainOverflow && originalMainOverflow !== "hidden") {
      mainEl.style.overflowY = originalMainOverflow
    } else {
      mainEl.style.removeProperty("overflow-y")
    }
  }

  originalBodyOverflow = ""
  originalMainOverflow = ""
  isLockedInDom = false
}

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

    const mainEl = document.querySelector("main")

    if (!isLockedInDom) {
      const currentBody = document.body.style.overflow
      const currentMain = mainEl ? mainEl.style.overflowY : ""

      originalBodyOverflow = currentBody !== "hidden" ? currentBody : ""
      originalMainOverflow = currentMain !== "hidden" ? currentMain : ""

      document.body.style.overflow = "hidden"
      if (mainEl) {
        mainEl.style.overflowY = "hidden"
      }
      isLockedInDom = true
    }

    activeLockCount++

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1)
      if (activeLockCount === 0) {
        unlockScroll()
      }
    }
  }, [isLocked])
}
