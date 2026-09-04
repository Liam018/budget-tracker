import { motion } from "motion/react"
import { CURRENCY_REGIONS } from "../../services/currencyService"
import { NEU } from "../../lib/neu"
import { neuButtonHover, neuButtonTap } from "../../lib/animations"

/**
 * RatesCarouselFilterTabs — Neumorphic Regional Filter Pills
 * Filters carousel currencies by geographic region or major trading status.
 */
export default function RatesCarouselFilterTabs({ selectedRegion, onSelectRegion }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-0.5">
      {Object.entries(CURRENCY_REGIONS).map(([key, { label }]) => {
        const isSelected = selectedRegion === key
        return (
          <motion.button
            key={key}
            type="button"
            whileHover={isSelected ? {} : { y: -1 }}
            whileTap={isSelected ? {} : { y: 1 }}
            onClick={() => onSelectRegion(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none shrink-0 ${
              isSelected
                ? "text-brand-600 font-extrabold"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
            style={{
              background: isSelected ? NEU.bg : "transparent",
              boxShadow: isSelected ? NEU.insetSm : "none",
            }}
          >
            {label}
          </motion.button>
        )
      })}
    </div>
  )
}
