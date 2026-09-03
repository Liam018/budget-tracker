import { motion, AnimatePresence } from "motion/react"
import { Check, Circle } from "lucide-react"

export default function PasswordRequirements({ password = "", isFocused = false }) {
  // Show rules when user starts typing or when the field is focused
  const shouldShow = isFocused || password.length > 0

  const rules = [
    {
      id: "min-length",
      label: "At least 8 characters",
      passed: password.length >= 8,
    },
    {
      id: "has-letter",
      label: "At least one letter (a-z, A-Z)",
      passed: /[a-zA-Z]/.test(password),
    },
    {
      id: "has-number",
      label: "At least one number (0-9)",
      passed: /\d/.test(password),
    },
  ]

  const allPassed = rules.every((r) => r.passed)

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div
            className="p-3 rounded-xl"
            style={{
              background: "var(--neu-bg)",
              boxShadow: "var(--neu-inset-sm)",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                Password Requirements
              </span>
              {allPassed && (
                <span className="text-[11px] font-medium text-emerald-600">
                  All requirements met!
                </span>
              )}
            </div>

            <ul className="space-y-1.5 text-xs">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 transition-colors duration-150 ${
                    rule.passed
                      ? "text-emerald-600 font-medium"
                      : "text-neutral-500"
                  }`}
                >
                  {rule.passed ? (
                    <motion.div
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                      className="shrink-0"
                    >
                      <Check size={13} className="text-emerald-500" strokeWidth={2.5} />
                    </motion.div>
                  ) : (
                    <Circle size={6} className="text-neutral-300 fill-neutral-300 shrink-0 ml-1 mr-1" />
                  )}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
