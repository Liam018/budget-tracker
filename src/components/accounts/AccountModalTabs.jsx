import { motion, LayoutGroup } from "motion/react"
import { NEU } from "../../lib/neu"
import { triggerHaptic } from "../../lib/haptics"
import { ACCOUNT_MODAL_TABS } from "./accountConstants"

/**
 * AccountModalTabs — Segmented switch between Philippine Presets and Custom Details
 * with fluid morphing Neumorphic pill glide.
 */
export default function AccountModalTabs({ activeTab, onTabChange }) {
  const handleTabClick = (tabId) => {
    if (tabId === activeTab) return
    triggerHaptic("light")
    onTabChange?.(tabId)
  }

  return (
    <LayoutGroup id="accountModalTabs">
      <div
        className="p-1 rounded-2xl flex items-center gap-1 relative"
        style={{
          background: NEU.bg,
          boxShadow: NEU.insetSm,
          contain: "paint layout",
        }}
      >
        {ACCOUNT_MODAL_TABS.map((tab) => {
          const isSelected = activeTab === tab.id
          const TabIcon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none ${
                isSelected
                  ? "text-brand-600 font-extrabold"
                  : "text-neutral-500 hover:text-neutral-800 active:text-neutral-900"
              }`}
            >
              {/* Morphing Active Pill Background */}
              {isSelected && (
                <motion.div
                  layoutId="activeModalTabPill"
                  className="absolute inset-0 rounded-xl pointer-events-none transform-gpu"
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

              {/* Content sits above the animated pill */}
              <span className="relative z-10 flex items-center gap-1.5">
                <TabIcon
                  size={13}
                  strokeWidth={isSelected ? 2.6 : 2.2}
                />
                <span>{tab.label}</span>
              </span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

