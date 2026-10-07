import { useRef, useState, useLayoutEffect } from "react"
import { motion } from "motion/react"
import { NEU } from "../../lib/neu"
import { triggerHaptic } from "../../lib/haptics"
import { ACCOUNT_MODAL_TABS } from "./accountConstants"

/**
 * AccountModalTabs — Segmented switch between Philippine Presets and Custom Details
 * with fluid morphing Neumorphic pill glide.
 *
 * Uses a ref-measured overlay pill instead of `layoutId` so the animation is
 * immune to surrounding layout shifts (e.g. the preset grid mounting/unmounting).
 */
export default function AccountModalTabs({ activeTab, onTabChange }) {
  const containerRef = useRef(null)
  const buttonRefs = useRef({})
  const [pillStyle, setPillStyle] = useState(null)

  // Measure the active button and update the pill position/size
  useLayoutEffect(() => {
    const activeBtn = buttonRefs.current[activeTab]
    const container = containerRef.current
    if (!activeBtn || !container) return

    const btnRect = activeBtn.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    setPillStyle({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
      height: btnRect.height,
    })
  }, [activeTab])

  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return
    triggerHaptic("light")
    onTabChange?.(tabId)
  }

  return (
    <div
      ref={containerRef}
      className="p-1 rounded-2xl flex items-center gap-1 relative"
      style={{
        background: NEU.bg,
        boxShadow: NEU.insetSm,
      }}
    >
      {/* Measured overlay pill — always rendered, springs between positions */}
      {pillStyle && (
        <motion.div
          className="absolute top-1 rounded-xl pointer-events-none transform-gpu"
          animate={{
            left: pillStyle.left,
            width: pillStyle.width,
            height: pillStyle.height,
          }}
          transition={{
            type: "spring",
            stiffness: 460,
            damping: 34,
          }}
          style={{ willChange: "transform" }}
        >
          <div
            className="w-full h-full rounded-xl"
            style={{
              background: NEU.bg,
              boxShadow: NEU.raisedSm,
            }}
          />
        </motion.div>
      )}

      {ACCOUNT_MODAL_TABS.map((tab) => {
        const isSelected = activeTab === tab.id
        const TabIcon = tab.icon

        return (
          <button
            key={tab.id}
            ref={(el) => { buttonRefs.current[tab.id] = el }}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none z-10 ${
              isSelected
                ? "text-brand-600 font-extrabold"
                : "text-neutral-500 hover:text-neutral-800 active:text-neutral-900"
            }`}
          >
            <TabIcon
              size={13}
              strokeWidth={isSelected ? 2.6 : 2.2}
            />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
