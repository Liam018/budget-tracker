# Budget Tracker — Implementation Plan (User Side)

A modern, responsive personal finance web app built with React, Vite, Tailwind CSS v4, and Supabase backend, tailored for Philippine Peso (**₱ PHP**) with subtle Neumorphic design aesthetics and Morphicon spring animations.

---

## 📋 Overall Roadmap & Progress

| # | Step | Key Deliverables | Status |
|:---:|:---|:---|:---:|
| **1** | 🏗️ **Project Scaffolding** | Vite, Tailwind CSS v4, Supabase client, Folder structure, Neumorphic tokens (`#edf0f7`). | ✅ **Done** |
| **2** | 🔐 **Auth & Security** | Registration, Login, Forgot Password, `profiles` schema with RLS, Server-side rate limits & lockout via PostgreSQL RPCs, real-time validators & sanitizers, Morphicons eye toggle & buttons. | ✅ **Done** |
| **⭐** | 📖 **Welcome & Onboarding Story** | Full-screen auto-sliding story carousel (`WelcomePage.jsx`) with moving progress bars, touch-swipe gestures, and clean login/register buttons. | ✅ **Done** |
| **3** | 🧭 **App Shell & Navigation** | Desktop Sidebar, Mobile Bottom Navigation bar, App Header with user popover, notifications badge, and responsive `AppLayout` wrapper. | ⏳ **NEXT** |
| **4** | 👛 **Accounts & Wallets** | Multi-account management (Cash, Bank, GCash, Maya), balances, transfers, and account types. | ⏸️ Pending |
| **5** | 🏷️ **Categories** | Income/Expense category taxonomy, customizable icons, colors, and default seeded categories. | ⏸️ Pending |
| **6** | 💸 **Transactions** | Full CRUD for Income, Expenses & Transfers, multi-account ledger, filters, search, and date pickers. | ⏸️ Pending |
| **7** | 📊 **Budgets** | Monthly spending limits per category, visual threshold bars (healthy / warning / exceeded), rollover calculations. | ⏸️ Pending |
| **8** | 🏠 **Dashboard** | Total net worth, monthly cash flow, category breakdowns, recent transactions, quick action drawer. | ⏸️ Pending |
| **9** | 📈 **Reports & Analytics** | Interactive income vs. expense charts, monthly trend graphs, spending distributions, and CSV/PDF export. | ⏸️ Pending |
| **10** | 🔁 **Recurring Engine** | Subscriptions & recurring salaries, automated ledger logging, upcoming bill reminders. | ⏸️ Pending |
| **11** | 🔔 **Notifications & Settings** | In-app notification center, budget threshold alerts (85%, 100%), profile customization, and preferences. | ⏸️ Pending |

---

## 🎯 Immediate Next Step: Step 3 — App Shell & Navigation

### 1. Components to Build:
1. **[`src/components/layout/AppLayout.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/layout/AppLayout.jsx)**:
   - Root layout container orchestrating the desktop sidebar, top header, mobile bottom navigation, and page `<Outlet />`.
   - Ensures responsive container padding across all screen sizes.
2. **[`src/components/layout/Sidebar.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/layout/Sidebar.jsx)**:
   - Persistent desktop navigation with subtle raised Neumorphic items.
   - Active route glowing highlight with animated indicator.
   - Navigation links: **Dashboard**, **Transactions**, **Budgets**, **Accounts**, **Categories**, **Reports**, **Recurring**, **Notifications**.
   - User profile snippet at the bottom with quick Sign Out action.
3. **[`src/components/layout/AppHeader.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/layout/AppHeader.jsx)**:
   - Dynamic page title and breadcrumb.
   - Quick **"+ Add Transaction"** shortcut button.
   - Notification bell with unread badge count.
   - Profile avatar popover menu.
4. **[`src/components/layout/BottomNav.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/layout/BottomNav.jsx)**:
   - Mobile-first bottom navigation bar (visible on screens `< 1024px`).
   - 4-5 key tabs (Dashboard, Transactions, Add (+) FAB, Budgets, More/Menu).
   - Safe-area inset support for mobile devices.

### 2. Route Integration ([`src/App.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/App.jsx)):
- Wrap all protected routes inside `<AppLayout />` so navigation is persistent across page changes.

---

## 🧪 Verification & Testing Plan
- **Desktop (1024px+)**: Sidebar appears on the left, Header at the top, active route highlighted.
- **Mobile (<1024px)**: Sidebar smoothly hides, BottomNav appears at the bottom with touch-friendly tabs.
- **Authentication Check**: Logging in takes the user to `/` (Dashboard inside AppLayout); signing out returns user to `/welcome`.
- **Build Quality**: Run `npm run build` to guarantee 0 lint/compile errors.
