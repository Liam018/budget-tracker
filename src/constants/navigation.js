import {
  // Lucide DATA icons (required for MorphIcon)
  LayoutDashboard,
  LayoutGrid,
  ArrowLeftRight,
  ArrowRightLeft,
  Target,
  CircleDot,
  Wallet,
  CreditCard,
  Tag,
  Layers,
  BarChart2,
  TrendingUp as TrendingUpLucide,
  RefreshCcw,
  Repeat2,
  Bell,
  BellRing,
  Coins,
} from "lucide"

import {
  // React components for standard icon rendering
  TrendingUp,
  TrendingDown,
  ArrowLeftRight as TransferIcon,
  Tag as TagIcon,
  BarChart2 as BarChart2Icon,
  RefreshCcw as RefreshCcwIcon,
  Bell as BellIcon,
  User as UserIcon,
  Coins as CoinsIcon,
} from "lucide-react"

/**
 * Mobile Bottom Navigation Tabs (Left & Right of center scoop)
 */
export const LEFT_TABS = [
  { label: "Dashboard", icon: LayoutDashboard, activeIcon: LayoutGrid,     to: "/" },
  { label: "Txns",      icon: ArrowLeftRight,  activeIcon: ArrowRightLeft, to: "/transactions" },
]

export const RIGHT_TABS = [
  { label: "Budget",    icon: Target,          activeIcon: CircleDot,      to: "/budgets" },
  { label: "Account",   icon: Wallet,          activeIcon: CreditCard,     to: "/accounts" },
]

/**
 * Quick Action buttons displayed inside NavHubSheet
 */
export const QUICK_ACTIONS = [
  {
    label: "Income",
    icon: TrendingUp,
    color: "text-emerald-600",
    to: "/transactions?action=income",
  },
  {
    label: "Expense",
    icon: TrendingDown,
    color: "text-rose-600",
    to: "/transactions?action=expense",
  },
  {
    label: "Transfer",
    icon: TransferIcon,
    color: "text-brand-600",
    to: "/transactions?action=transfer",
  },
]

/**
 * Secondary Navigation Menu items inside NavHubSheet
 */
export const MENU_NAV_ITEMS = [
  { label: "Categories",    icon: TagIcon,         to: "/categories",    desc: "Manage tags & types" },
  { label: "Reports",       icon: BarChart2Icon,   to: "/reports",       desc: "Analytics & trends" },
  { label: "Recurring",     icon: RefreshCcwIcon,  to: "/recurring",     desc: "Subscriptions & bills" },
  { label: "Converter",     icon: CoinsIcon,       to: "/converter",     desc: "Live exchange rates" },
  { label: "My Profile",    icon: UserIcon,        to: "/profile",       desc: "Account & security" },
]

/**
 * Desktop Sidebar Navigation Items
 */
export const SIDEBAR_NAV_ITEMS = [
  { label: "Dashboard",     icon: LayoutDashboard,   activeIcon: LayoutGrid,       to: "/" },
  { label: "Transactions",  icon: ArrowLeftRight,    activeIcon: ArrowRightLeft,   to: "/transactions" },
  { label: "Budgets",       icon: Target,            activeIcon: CircleDot,        to: "/budgets" },
  { label: "Accounts",      icon: Wallet,            activeIcon: CreditCard,       to: "/accounts" },
  { label: "Categories",    icon: Tag,               activeIcon: Layers,           to: "/categories" },
  { label: "Reports",       icon: BarChart2,         activeIcon: TrendingUpLucide, to: "/reports" },
  { label: "Recurring",     icon: RefreshCcw,        activeIcon: Repeat2,          to: "/recurring" },
  { label: "Converter",     icon: Coins,             activeIcon: ArrowLeftRight,   to: "/converter" },
]
