import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the current device/viewport supports fine pointer hover.
 * Prevents sticky hover states on touch screens.
 */
export function useCanHover() {
  const [canHover, setCanHover] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false
  )

  useEffect(() => {
    if (typeof window === "undefined") return
    const hoverMedia = window.matchMedia("(hover: hover) and (pointer: fine)")
    const handleHoverChange = (e) => setCanHover(e.matches)
    hoverMedia.addEventListener("change", handleHoverChange)
    return () => hoverMedia.removeEventListener("change", handleHoverChange)
  }, [])

  return canHover
}

export default useCanHover
