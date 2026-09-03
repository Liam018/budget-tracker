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
| **📱** | 📲 **PWA (Android & iOS)** | Service Worker with offline caching (`vite-plugin-pwa`), Web App Manifest, Standalone display mode, iOS Home Screen meta tags, scroll locks on sheets, and custom `bloub-cercle-fier-violet.png` app icon. | ✅ **Done** |
| **4** | 👛 **Accounts & Wallets** | Multi-account management (Cash, Bank, GCash, Maya, Credit Cards), balance tracking, currency support, account presets, and Neumorphic wallet cards. | ⏳ **NEXT** |
| **5** | 🏷️ **Categories** | Income/Expense category taxonomy, customizable icons, colors, and default seeded categories. | ⏸️ Pending |
| **6** | 💸 **Transactions** | Full CRUD for Income, Expenses & Transfers, multi-account ledger, filters, search, and date pickers. | ⏸️ Pending |
| **7** | 📊 **Budgets** | Monthly spending limits per category, visual threshold bars (healthy / warning / exceeded), rollover calculations. | ⏸️ Pending |
| **8** | 🏠 **Dashboard** | Total net worth, monthly cash flow, category breakdowns, recent transactions, quick action drawer. | ⏸️ Pending |
| **9** | 📈 **Reports & Analytics** | Interactive income vs. expense charts, monthly trend graphs, spending distributions, and CSV/PDF export. | ⏸️ Pending |
| **10** | 🔁 **Recurring Engine** | Subscriptions & recurring salaries, automated ledger logging, upcoming bill reminders. | ⏸️ Pending |
| **11** | 🔔 **Notifications & PWA Web Push** | In-app notification center, background Web Push notifications for Android & iOS 16.4+ (VAPID keys, Supabase `push_subscriptions` table, edge function triggers for 85%/100% budget breaches & bill due dates), and user preference toggles. | ⏸️ Pending |

---

## 🎯 Immediate Next Step: Step 4 — Accounts & Wallets Management System

### 1. Supabase Database Schema (`accounts` table):
```sql
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'e_wallet', 'credit_card', 'savings')),
  balance numeric(15, 2) not null default 0.00,
  currency text not null default 'PHP',
  color text default '#863bff',
  icon text default 'Wallet',
  is_archived boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.accounts enable row level security;

-- RLS Policies: users can only manage their own accounts
create policy "Users can view own accounts" on public.accounts for select using (auth.uid() = user_id);
create policy "Users can create own accounts" on public.accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own accounts" on public.accounts for update using (auth.uid() = user_id);
create policy "Users can delete own accounts" on public.accounts for delete using (auth.uid() = user_id);
```

### 2. Frontend Components to Build:
1. **[`src/pages/AccountsPage.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/pages/AccountsPage.jsx)**:
   - Header with Total Net Worth summary and **"+ Add Account"** button.
   - Segmented filter / tabs: All Accounts, Cash & Banks, E-Wallets, Credit Cards.
   - Responsive grid of tactile Neumorphic Account Cards.
2. **[`src/components/accounts/AccountCard.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/accounts/AccountCard.jsx)**:
   - Neumorphic surface with brand color accent pill.
   - Account institution branding / icon (GCash, Maya, BDO, BPI, Cash, etc.).
   - Current balance formatted in user's preferred currency (e.g. ₱ PHP).
   - Quick action options (Edit, Archive, View Transactions).
3. **[`src/components/accounts/AccountModal.jsx`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/components/accounts/AccountModal.jsx)**:
   - Adaptive bottom sheet (mobile) / centered dialog (desktop) with `useScrollLock`.
   - Philippine Financial Institution Presets:
     - **E-Wallets**: GCash (Blue), Maya (Green), ShopeePay (Orange), GrabPay.
     - **Banks**: BDO (Dark Blue), BPI (Red), UnionBank (Orange), Metrobank (Blue), GoTyme, SeaBank.
     - **Cash & Cards**: Physical Cash, Credit Card, Savings Jar.
   - Initial balance input, custom name, and color picker.
4. **[`src/hooks/useAccounts.js`](file:///c:/Users/ACER/OneDrive/Desktop/budget-tracker/src/hooks/useAccounts.js)**:
   - Real-time data fetching, optimistic caching, balance aggregates, and Supabase CRUD operations.

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

## 🧪 Verification & Testing Plan for Step 4
- **Database Operations**: Create accounts, verify balances save and update properly in Supabase with RLS.
- **UI Responsiveness**: Test wallet grid on mobile viewport (`<640px`) and desktop (`>1024px`).
- **Filipino Presets**: Confirm quick-select presets for GCash, Maya, BDO, BPI prefill appropriate names, icons, and colors.
- **Build Quality**: Run `npm run build` to verify 0 errors.
