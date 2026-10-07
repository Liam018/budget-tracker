import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { triggerHaptic } from "../../lib/haptics"
import { PHILIPPINE_INSTITUTION_PRESETS } from "../../services/accountService"
import { getMorphAccountIcon } from "../../constants/accountConstants"

/**
 * AccountPresetGrid — Grid of Philippine financial institution presets (GCash, Maya, BDO, BPI, etc.)
 * Minimizes into an active preset summary pill upon selection with smooth accordion transitions.
 */
export default function AccountPresetGrid({
  institution,
  name,
  onSelectPreset,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Find the currently selected preset object if any
  const selectedPreset = useMemo(() => {
    return PHILIPPINE_INSTITUTION_PRESETS.find(
      (p) => p.name === institution || p.name === name
    )
  }, [institution, name])

  const handleSelect = (preset) => {
    triggerHaptic("light")
    onSelectPreset(preset)
    setIsCollapsed(true)
  }

  const toggleCollapse = () => {
    triggerHaptic("light")
    setIsCollapsed((prev) => !prev)
  }

  return (
    <div className="space-y-2 select-none">
      {/* Header Label & Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            Institution Preset
          </label>
          <span className="text-[10px] font-semibold text-neutral-400">
            {PHILIPPINE_INSTITUTION_PRESETS.length} options
          </span>
        </div>
        {selectedPreset && (
          <button
            type="button"
            onClick={toggleCollapse}
            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <span>{isCollapsed ? "Change Preset" : "Minimize"}</span>
            {isCollapsed ? (
              <ChevronDown size={13} strokeWidth={2.6} />
            ) : (
              <ChevronUp size={13} strokeWidth={2.6} />
            )}
          </button>
        )}
      </div>

      {/* ── Active Preset Summary Pill ── */}
      <AnimatePresence initial={false}>
        {selectedPreset && (
          <motion.div
            key="selected-preset-pill"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden p-1 -m-1"
          >
            <div
              onClick={toggleCollapse}
              className="p-2 sm:p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-shadow"
              style={{
                background: NEU.bg,
                boxShadow: NEU.insetSm,
              }}
              title={isCollapsed ? "Click to change preset" : "Click to minimize"}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ background: selectedPreset.color }}
                >
                  <MorphIcon
                    icon={getMorphAccountIcon(selectedPreset.icon)}
                    size={15}
                    strokeWidth={2.4}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-black text-neutral-800 truncate leading-tight group-hover:text-brand-600 transition-colors">
                      {selectedPreset.name}
                    </p>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md text-neutral-500 bg-neutral-200/70">
                      {selectedPreset.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate">
                    {isCollapsed
                      ? "Preset active · tap to change"
                      : "Tap an institution below or close"}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={neuButtonHover}
                whileTap={neuButtonTap}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCollapse()
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer shrink-0"
                style={{
                  background: NEU.bg,
                  boxShadow: NEU.raisedSm,
                }}
                aria-label={isCollapsed ? "Change preset" : "Minimize preset"}
              >
                <span>{isCollapsed ? "Change" : "Close"}</span>
                {isCollapsed ? (
                  <ChevronDown size={13} strokeWidth={2.6} />
                ) : (
                  <ChevronUp size={13} strokeWidth={2.6} />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapsible Presets Grid (Full Visibility with Shadow Padding) ── */}
      <AnimatePresence initial={false}>
        {(!isCollapsed || !selectedPreset) && (
          <motion.div
            key="expanded-preset-grid"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden p-3 -m-3"
          >
            <div
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 ${
                selectedPreset ? "pt-1.5" : ""
              }`}
            >
              {PHILIPPINE_INSTITUTION_PRESETS.map((preset) => {
                const isSelected =
                  institution === preset.name || name === preset.name
                const PresetIcon = getMorphAccountIcon(preset.icon)

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelect(preset)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer select-none ${
                      isSelected
                        ? "text-neutral-900 font-extrabold ring-1 ring-brand-500/30"
                        : "text-neutral-600 hover:text-neutral-900"
                    }`}
                    style={{
                      background: NEU.bg,
                      boxShadow: isSelected ? NEU.insetSm : NEU.raisedSm,
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs text-xs"
                      style={{ background: preset.color }}
                    >
                      <MorphIcon icon={PresetIcon} size={14} strokeWidth={2.4} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {preset.name}
                      </p>
                      <span className="text-[9px] text-neutral-400 block truncate">
                        {preset.badge}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
