import financeSvg from "../assets/animation/Finance.svg"
import moneySvg from "../assets/animation/Money.svg"
import analyticsSvg from "../assets/animation/Business_Analytics.svg"
import revenueSvg from "../assets/animation/Revenue.svg"

export const welcomeSlides = [
  {
    id: "tracking",
    badge: "Expense & Income Tracking",
    shortTitle: "Tracking",
    title: "Track Every Expense with Ease",
    description:
      "Log your daily cash flow instantly across Cash, Digital Wallets, and Bank accounts with zero friction.",
    illustration: financeSvg,
    bulletPoints: [
      "Multi-account ledger (Cash, Wallets, Cards & Banks)",
      "Instant income & expense categorization",
      "Multi-currency support (₱ PHP, $ USD, € EUR & more)",
    ],
  },
  {
    id: "budgets",
    badge: "Smart Budgets",
    shortTitle: "Budgets",
    title: "Set Spending Limits & Save",
    description:
      "Create monthly category budgets with real-time visual progress and warnings before you overspend.",
    illustration: moneySvg,
    bulletPoints: [
      "Custom limits for Food, Transport, Utilities & more",
      "Color-coded warning thresholds at 80% & 100%",
      "Real-time remaining budget calculations",
    ],
  },
  {
    id: "analytics",
    badge: "Visual Reports",
    shortTitle: "Reports",
    title: "Clear Insights into Your Habits",
    description:
      "Understand where your money goes with interactive breakdown charts, cash flow metrics, and monthly reports.",
    illustration: analyticsSvg,
    bulletPoints: [
      "Category expense breakdowns and trend charts",
      "Monthly savings rate and net cash flow metrics",
      "Exportable CSV and summary financial reports",
    ],
  },
  {
    id: "recurring",
    badge: "Automation & Security",
    shortTitle: "Automation",
    title: "Automate Bills & Stay Protected",
    description:
      "Schedule recurring subscriptions, avoid late fees, and manage finances with data encryption and privacy.",
    illustration: revenueSvg,
    bulletPoints: [
      "Automated bill logs for recurring subscriptions",
      "Smart due date reminders before billing cycles",
      "Data encryption & privacy protection",
    ],
  },
]
