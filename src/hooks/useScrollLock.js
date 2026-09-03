import { useEffect } from "react"

/**
 * useScrollLock — Prevents background page scrolling while a modal or sheet is open.
 *
 * Saves the current scrollbar width, adds `overflow: hidden` and compensates with
 * `padding-right` on <body> to prevent layout shift from the scrollbar disappearing.
 * Cleans up reliably on unmount or when `isLocked` becomes false.
 *
 * @param {boolean} isLocked - Whether the scroll lock should be active.
 */
export function useScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isLocked])
}
