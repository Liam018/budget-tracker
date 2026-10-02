import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { MorphIcon } from "morphicons/react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"
import { PHILIPPINE_INSTITUTION_PRESETS } from "../../services/accountService"
import { getMorphAccountIcon } from "../../constants/accountConstants"

/**
 * AccountPresetGrid — Grid of Philippine financial institution presets (GCash, Maya, BDO, BPI, etc.)
 * Minimizes into an active preset summary pill upon selection to maximize form workspace.
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
    onSelectPreset(preset)
    setIsCollapsed(true)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
          Institution Preset
        </label>
        {selectedPreset && (
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
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

      <AnimatePresence mode="wait" initial={false}>
        {isCollapsed && selectedPreset ? (
          /* ── MINIMIZED PRESET PILL (~44px) ── */
          <motion.div
            key="minimized-preset"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setIsCollapsed(false)}
            className="p-2 sm:p-2.5 rounded-2xl flex items-center justify-between gap-3 cursor-pointer group transition-shadow"
            style={{
              background: NEU.bg,
              boxShadow: NEU.insetSm,
            }}
            title="Click to change preset"
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
                  Preset active · tap to change
                </p>
              </div>
            </div>

            <motion.button
              whileHover={neuButtonHover}
              whileTap={neuButtonTap}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setIsCollapsed(false)
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer shrink-0"
              style={{
                background: NEU.bg,
                boxShadow: NEU.raisedSm,
              }}
              aria-label="Change preset"
            >
              <span>Change</span>
              <ChevronDown size={13} strokeWidth={2.6} />
            </motion.button>
          </motion.div>
        ) : (
          /* ── EXPANDED PRESETS GRID ── */
          <motion.div
            key="expanded-preset-grid"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
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
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "text-neutral-900 font-extrabold"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
