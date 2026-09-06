# Budget Tracker — Implementation Plan (User Side)

A modern, responsive personal finance web app built with React, Vite, Tailwind CSS v4, and Supabase backend, tailored for Philippine Peso (**₱ PHP**) with subtle Neumorphic design aesthetics, Morphicon spring animations, and full Progressive Web App (PWA) capabilities.

---

## 📋 Overall Roadmap & Progress

| # | Step | Key Deliverables | Status |
|:---:|:---|:---|:---:|
| **1** | 🏗️ **Project Scaffolding** | Vite, Tailwind CSS v4, Supabase client, Folder structure, Neumorphic design tokens (`#f4f6fb`). | ✅ **Done** |
| **2** | 🔐 **Auth & Security** | Registration, Login, Forgot Password, `profiles` schema with RLS, Server-side rate limits & lockout via PostgreSQL RPCs, real-time validators & sanitizers, Morphicons eye toggle & buttons, session recovery. | ✅ **Done** |
| **⭐** | 📖 **Welcome & Onboarding Story** | Full-screen auto-sliding story carousel (`WelcomePage.jsx`) with moving progress bars, touch-swipe gestures, and clean login/register buttons. | ✅ **Done** |
| **3** | 🧭 **App Shell & Navigation** | Desktop Sidebar, Mobile Bottom Navigation bar, App Header with user popover, notifications badge, Explore More sheet, responsive `AppLayout` wrapper, dedicated Currency Converter & 160+ live rates carousel (`/converter`). | ✅ **Done** |
| **📱** | 📲 **PWA (Android & iOS)** | Service Worker with offline caching (`vite-plugin-pwa`), Web App Manifest, Standalone display mode, iOS Home Screen meta tags, scroll locks on sheets, and custom `bloub-cercle-fier-| **4** | 👛 **Accounts & Wallets** | Multi-account management (Cash, Bank, GCash, Maya, Credit Cards), balance tracking, currency support, account presets, and Neumorphic wallet cards. | ✅ **Done** |
| **5** | 🏷️ **Categories** | Income/Expense category taxonomy, customizable icons, colors, and default seeded categories. | ⏳ **NEXT** |
| **6** | 💸 **Transactions** | Full CRUD for Income, Expenses & Transfers, multi-account ledger, filters, search, and date pickers. | ⏸️ Pending |
| **7** | 📊 **Budgets** | Monthly spending limits per category, visual threshold bars (healthy / warning / exceeded), rollover calculations. | ⏸️ Pending |
| **8** | 🏠 **Dashboard** | Total net worth, monthly cash flow, category breakdowns, recent transactions, quick action drawer. | ⏸️ Pending |
| **9** | 📈 **Reports & Analytics** | Interactive income vs. expense charts, monthly trend graphs, spending distributions, and CSV/PDF export. | ⏸️ Pending |
| **10** | 🔁 **Recurring Engine** | Subscriptions & recurring salaries, automated ledger logging, upcoming bill reminders. | ⏸️ Pending |
| **11** | 🔔 **Notifications & PWA Web Push** | In-app notification center, background Web Push notifications for Android & iOS 16.4+ (VAPID keys, Supabase `push_subscriptions` table, edge function triggers for 85%/100% budget breaches & bill due dates), and user preference toggles. | ⏸️ Pending |

---

## 🎯 Immediate Next Step: Step 5 — Categories Taxonomy & Management System

### 1. Supabase Database Schema (`categories` table):
```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Tag',
  color text not null default '#863bff',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.categories enable row level security;

-- Policies: Users see system defaults (user_id is null or is_default = true) AND their own custom categories
create policy "Users can view default and own categories" on public.categories 
  for select using (user_id is null or is_default = true or auth.uid() = user_id);

create policy "Users can create custom categories" on public.categories 
  for insert with check (auth.uid() = user_id and is_default = false);

create policy "Users can update own categories" on public.categories 
  for update using (auth.uid() = user_id and is_default = false);

create policy "Users can delete own categories" on public.categories 
  for delete using (auth.uid() = user_id and is_default = false);
```

### 2. Philippine Preset Taxonomy:
- **Expenses**:
  - 🍔 Food & Dining (`#f97316`, `UtensilsCrossed`)
  - 🛒 Groceries & Supermarket (`#10b981`, `ShoppingCart`)
  - 🚗 Transportation & Commute (Jeepney/Bus/Gas) (`#06b6d4`, `Car`)
  - 💡 Utilities (Meralco/Maynilad/Telco) (`#eab308`, `Zap`)
  - 🏠 Housing & Rent (`#6366f1`, `Home`)
  - 🛍️ Shopping & Personal Care (`#ec4899`, `ShoppingBag`)
  - 🏥 Healthcare & Pharmacy (`#ef4444`, `HeartPulse`)
  - 🎮 Entertainment & Leisure (`#8b5cf6`, `Gamepad2`)
  - 📚 Education & Self-Improvement (`#3b82f6`, `GraduationCap`)
  - 💸 Bills & Subscriptions (`#14b8a6`, `Receipt`)
  - 🐾 Pets (`#d97706`, `Dog`)
  - 🎁 Gifts & Donations (`#f43f5e`, `Gift`)
  - 📦 Other Expenses (`#64748b`, `MoreHorizontal`)
- **Income**:
  - 💰 Salary & Wages (`#10b981`, `Banknote`)
  - 💼 Freelance & Side Hustles (`#8b5cf6`, `Briefcase`)
  - 🏢 Business & Sales (`#3b82f6`, `Store`)
  - 📈 Investments & Dividends (`#06b6d4`, `TrendingUp`)
  - 🎁 Allowance & Gifts (`#ec4899`, `Gift`)
  - 💵 Other Income (`#64748b`, `Coins`)

### 3. Frontend Architecture:
1. **[`src/services/categoryService.js`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/services/categoryService.js)**:
   - Supabase CRUD operations, automatic seeding for new users, fallback default categories list.
2. **[`src/hooks/useCategories.js`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/hooks/useCategories.js)**:
   - Custom hook managing categories state, income vs expense filtering, real-time subscription.
3. **[`src/pages/CategoriesPage.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/pages/CategoriesPage.jsx)**:
   - Segmented toggle (`Expenses` vs `Income`), search filter, grid display with Neumorphic cards.
4. **[`src/components/categories/CategoryModal.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/categories/CategoryModal.jsx)**:
   - Mobile bottom sheet / desktop dialog to create or edit custom categories with color/icon picker.

---

## 🔔 Planned PWA Web Push Architecture (Step 11 Detail)

| Component | Technical Implementation |
|---|---|
| **VAPID Keypair** | Generated via `web-push` standard to sign push messages. |
| **`push_subscriptions` Table** | Supabase table tracking user endpoints, auth keys, device user-agents, and notification preferences. |
| **Service Worker Integration** | `sw.js` handles `push` event, display notification payload with `bloub-cercle-fier-violet.png` badge, and `notificationclick` navigation to relevant view. |
| **Automated Alerts** | Budget threshold alerts (85%, 100% exceeded), bill due date warnings (24h before), and weekly spending digests. |
| **Device Compatibility** | Android (Chrome/Brave/Samsung), iOS 16.4+ (PWA Home Screen), and Desktop OS. |

---

## 🧪 Verification & Testing Plan for Step 5
- **Database Operations**: Migration for `categories` table with RLS and user scoping.
- **Seeded Categories**: Verify default Philippine categories load automatically for expenses and income.
- **Custom Categories**: Create, edit, and delete custom categories with custom icons and colors.
- **UI Responsiveness**: Test category grid & modal on mobile (<640px) and desktop (>1024px).
- **Build Quality**: Run `npm run build` to verify 0 errors.
