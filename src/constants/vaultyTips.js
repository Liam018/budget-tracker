/**
 * vaultyTips.js
 * Curated pool of smart personal finance tips and context-aware responses for Kuri.
 */

export const KURI_TIPS = [
  {
    id: "tip-50-30-20",
    category: "budgeting",
    mood: "thinking",
    message: "The 50/30/20 rule: Allocate 50% for Needs, 30% for Wants, and 20% for Savings & Debt repayment!",
  },
  {
    id: "tip-pay-yourself",
    category: "savings",
    mood: "celebrate",
    message: "Pay yourself first! Move your savings target as soon as income lands before spending.",
  },
  {
    id: "tip-emergency-fund",
    category: "safety",
    mood: "wave",
    message: "Aim for 3-6 months of essential living expenses in a high-yield emergency buffer.",
  },
  {
    id: "tip-subscription-audit",
    category: "frugal",
    mood: "alert",
    message: "Subscription audit check: When did you last use that streaming service or unused gym app?",
  },
  {
    id: "tip-48h-rule",
    category: "spending",
    mood: "thinking",
    message: "The 48-Hour Rule: Wait two full days before buying non-essential items to curb impulse spending.",
  },
  {
    id: "tip-compound-interest",
    category: "investing",
    mood: "celebrate",
    message: "Compound interest is the 8th wonder! Time in the market beats timing the market.",
  },
  {
    id: "tip-small-leaks",
    category: "habits",
    mood: "alert",
    message: "Beware of tiny leaks! A daily ₱150 milk tea adds up to over ₱54,000 a year.",
  },
  {
    id: "tip-smart-not-kuripot",
    category: "mindset",
    mood: "celebrate",
    message: "Smart, not kuripot! Spend guilt-free on what truly matters by plugging the leaks that don't.",
  },
  {
    id: "tip-vault-secure",
    category: "general",
    mood: "idle",
    message: "All vaults locked and protected. Kuri the Ro-Vault is keeping your net worth organized and growing!",
  },
]

export const VAULTY_TIPS = KURI_TIPS

export const MOOD_DEFAULT_MESSAGES = {
  idle: "Standing by! Safe door secured. Kuri the Ro-Vault is ready whenever you need smart financial tips.",
  celebrate: "Woohoo! Milestone reached! Your wallet is thanking you right now! 🎉",
  thinking: "Crunching the numbers and analyzing the balance sheets... ⚙️",
  alert: "Heads up! Expense recorded. Watch your category limits! ⚠️",
  wave: "Hey friend! Ready to make your money work harder for you today? 👋",
}

export function getRandomTip(category = null) {
  const filtered = category
    ? KURI_TIPS.filter((t) => t.category === category)
    : KURI_TIPS
  const index = Math.floor(Math.random() * filtered.length)
  return filtered[index] || KURI_TIPS[0]
}

