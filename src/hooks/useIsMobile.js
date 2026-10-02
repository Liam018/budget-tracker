import { useState, useEffect } from "react"

/**
 * Custom hook to detect if the viewport is below a specific breakpoint (default: 640px).
 * Safely handles SSR and window resize events.
 */
export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  )

  useEffect(() => {
    if (typeof window === "undefined") return

    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [breakpoint])

  return isMobile
}

export default useIsMobile
