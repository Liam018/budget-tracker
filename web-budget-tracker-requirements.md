# Web Budget Tracking System — Project Requirements & Management Plan

## 1. Project Definition

**Project:** Web Budget Tracking System

**Primary Goal:**  
Allow users to manage their income, expenses, budgets, and financial progress through a centralized web application.

**Tech Stack:** React + Vite + Tailwind CSS ✅

**Currency:** Philippine Peso (₱ PHP) ✅

**Design Approach:** Mobile-first, fully responsive (desktop, tablet, and mobile) ✅

**DESIGN STYLE:** Neumorphism (subtle) ✅

**Icon STYLE:** Morphicons with Lucide (npm package) ✅

**Animation:** motion.dev ✅

### Core Objectives

The system should help users answer:

- How much money do I currently have?
- How much did I earn this month?
- Where is my money going?
- Am I staying within my budget?
- Which categories consume most of my money?
- How much can I still spend?
- What are my financial trends over time?

---

# 2. Recommended MVP

The MVP should contain the following core modules:

1. Authentication ✅
2. App Shell & Responsive Navigation (Floating Neumorphic Sidebar + Stadium Bottom Nav with Morphicons) ✅
3. Accounts / Wallets ⏳ *(NEXT)*
4. Categories
5. Transactions *(with Mobile Quick Add FAB Bottom Sheet)*
6. Budget Management
7. Dashboard
8. Reports & Analytics
9. Recurring Transactions
10. Notifications & Mobile More Navigation Sheet
11. Security / Row Level Security / Rate Limiting (Auth Endpoints ✅)

---

# 3. Authentication

Users should be able to:

- Register ✅
- Log in ✅
- Log out ✅
- Reset their password ✅
- Manage their profile

If Supabase is used, authentication can be handled through Supabase Auth.

---

# 4. Dashboard

The dashboard should provide a high-level financial overview.

### Recommended dashboard information

- Total balance
- Total income
- Total expenses
- Available budget
- Budget usage
- Spending by category
- Recent transactions
- Monthly financial summary

### Example

```text
Dashboard

Total Balance     Income       Expenses
₱45,250           ₱35,000      ₱22,500

Monthly Budget
₱30,000
███████████████░░░░░ 75%

Spending by Category

Food               ₱6,500
Transportation     ₱3,200
Bills              ₱5,000
Shopping           ₱2,800

Recent Transactions

Grocery             -₱1,250
Salary              +₱25,000
Internet             -₱1,500
```

---

# 5. Transactions

Transactions are one of the core components of the system.

## Income Types

Example categories:

- Salary
- Freelance
- Business
- Allowance
- Other Income

## Expense Types

Example categories:

- Food
- Transportation
- Housing
- Utilities
- Bills
- Shopping
- Entertainment
- Healthcare
- Education
- Other

## Transaction Types

- **Income** — money received (salary, freelance, etc.)
- **Expense** — money spent (food, bills, etc.)
- **Transfer** — money moved between accounts (e.g., Cash → GCash)

## Transaction Fields

| Field | Example |
|---|---|
| Type | Expense / Income / Transfer |
| Amount | ₱1,250 |
| Category | Food |
| Date | Aug 28, 2026 |
| Description | Grocery |
| Account | Cash |
| To Account | GCash *(Transfer only)* |
| Notes | Weekly groceries |

## Transaction Features

Users should be able to:

- Add transactions (income, expense, or transfer)
- Edit transactions
- Delete transactions
- Search transactions
- Filter by type (income / expense / transfer)
- Filter by category
- Filter by date
- Filter by account
- Sort transactions

### Mobile Action & Navigation Hub (Center FAB Interaction)
- Tapping the center elevated `[+]` button on the mobile bottom navigation bar immediately toggles the **Action & Navigation Hub**:
  1. **Spring Icon Rotation**: The `+` icon rotates 45° with spring physics into an `✕` (Close) button.
  2. **Soft Backdrop**: Dims background content with `backdrop-blur` while keeping navigation clean.
  3. **Quick Actions Row**: Immediate one-tap shortcuts to log:
     - `+ Income` (Emerald badge)
     - `- Expense` (Rose badge)
     - `⇄ Transfer` (Indigo badge)
  4. **Explore More Grid**: Neumorphic tile navigation to all other app sections:
     - 🏷️ **Categories**
     - 📊 **Reports**
     - 🔁 **Recurring**
     - 🔔 **Notifications**
     - 👤 **My Profile & Settings**
  5. **Auto-Dismiss**: Tapping any navigation link or backdrop smoothly dismisses the hub.

---

# 6. Budget Management

The budget module allows users to define spending limits.

### Example

```text
August 2026 Budget

Food              ₱8,000
Transportation    ₱4,000
Bills             ₱6,000
Entertainment     ₱3,000
Shopping          ₱4,000
-------------------------
Total             ₱25,000
```

The system should automatically calculate budget usage.

### Example

```text
Food

Budget:       ₱8,000
Spent:        ₱6,500
Remaining:    ₱1,500
Usage:        81.25%
```

The system should visually indicate when the user is:

- Within budget
- Approaching the budget limit
- At the budget limit
- Over budget

---

# 7. Categories

Users should be able to manage transaction categories.

### Example

```text
🍔 Food
🚗 Transportation
🏠 Housing
💡 Utilities
🛒 Shopping
🎮 Entertainment
📚 Education
🏥 Healthcare
💰 Salary
💼 Freelance
```

### Category Features

- Default categories
- Custom categories
- Category icons
- Category colors
- Income/expense classification

---

# 8. Accounts / Wallets

Users may have multiple places where money is stored.

### Example

```text
Cash                 ₱5,000
BDO                  ₱25,000
GCash                ₱8,500
Maya                 ₱6,750
Credit Card          -₱2,000
```

### Account Types

- Cash
- Bank
- E-wallet
- Credit Card
- Savings
- Investment
- Other

This allows the application to distinguish where the user's money actually exists.

### Milestone Status: ⏳ NEXT (Step 4)
- Multi-account management with Philippine Peso (**₱ PHP**) balances.
- Aggregated Net Worth / Balance summary card (Assets vs. Liabilities).
- Neumorphic raised cards (`--neu-raised-sm`) with brand accent borders and type badges.
- Create, Edit, and Archive account modal dialogs with input validation.

---

# 9. Reports & Analytics

The system should provide useful financial reports.

## Monthly Summary

```text
August 2026

Income:       ₱35,000
Expenses:     ₱22,500
Savings:      ₱12,500
```

## Spending Breakdown

```text
Food             29%
Bills            22%
Transportation   14%
Shopping         13%
Entertainment     9%
Other            13%
```

## Recommended Reports

- Daily spending
- Weekly spending
- Monthly spending
- Income vs. expenses
- Category spending
- Spending trends
- Savings trends

---

# 10. Recurring Transactions

Recurring transactions should support regularly occurring income and expenses.

### Example

```text
Netflix
₱549
Every month
Next: September 1

Internet
₱1,500
Every month
Next: September 5

Salary
₱35,000
Every month
Next: September 15
```

The system can automatically generate or remind users about recurring transactions.

---

# 11. Notifications

The notification system can alert users about important financial events.

### Example Notifications

```text
⚠️ You've used 85% of your Food budget.

🔴 Your Transportation budget has been exceeded.

💰 Your salary is expected tomorrow.

📅 Your ₱1,500 Internet bill is due tomorrow.
```

Potential notification channels:

- In-app notifications
- Browser notifications
- Email notifications

---

# 12. Recommended Database Structure

Supabase will be used. **Project is already created and active.**

### Confirmed Supabase Project

| Field | Value |
|---|---|
| Project Name | `budget-tracker` ✅ |
| Project Ref | `snmvwtkxaemlwimagauf` ✅ |
| Region | `ap-northeast-1` ✅ |
| Status | `ACTIVE_HEALTHY` ✅ |
| Project URL | `https://snmvwtkxaemlwimagauf.supabase.co` ✅ |

The initial architecture can be structured as:

```text
profiles
    │
    ├── accounts
    │
    ├── categories
    │
    ├── transactions
    │
    ├── budgets
    │
    ├── recurring_transactions
    │
    └── notifications
```

## profiles

```text
id
full_name
avatar_url
created_at
```

## accounts

```text
id
user_id
name
type           -- cash | bank | e-wallet | credit_card | savings | investment | other
balance
currency       -- defaults to PHP; multi-currency is a Phase 3 feature
created_at
```

## categories

```text
id
user_id        -- NULL for system default categories
name
type           -- income | expense
icon
color
is_default     -- true for built-in system categories
created_at
```

## transactions

```text
id
user_id
account_id         -- source account
to_account_id      -- destination account (Transfer type only)
category_id        -- NULL for transfers
type               -- income | expense | transfer
amount
description
transaction_date
notes
created_at
```

## budgets

```text
id
user_id
category_id
amount
period
start_date
end_date
created_at
```

## recurring_transactions

```text
id
user_id
account_id
category_id
type
amount
frequency
next_date
description
active
created_at
```

## notifications

```text
id
user_id        -- the user who receives this notification
type           -- budget_warning | budget_exceeded | recurring_reminder | system
message
read_at        -- NULL if unread
created_at
```

> `sender_id` has been removed. Notifications in this system are system-generated (triggered by budget thresholds or recurring transaction schedules), not user-to-user messages.

> Optional security-related tables (`rate_limit_events`, `audit_logs`) are covered separately in Section 14, since they're only needed if certain implementation approaches are chosen.

> The database schema should be finalized only after the client requirements are confirmed.

---

# 13. User Roles

## User

Users can:

- Manage their own finances
- Create transactions
- Manage budgets
- View reports
- Manage accounts
- Manage categories
- Manage notifications

## Admin

Admins can:

- View users
- Manage system settings
- Manage default categories
- Monitor system activity
- Handle support issues

### Security Requirement

Users must never be able to access another user's financial records.

If Supabase is used, Row Level Security (RLS) should be properly configured from the beginning.

---

# 14. Security & Rate Limiting

Given this application stores sensitive financial data, security should be treated as a core requirement from the start rather than something layered on at the end.

## Rate Limiting

Rate limiting protects the system from brute-force login attempts, credential stuffing, spam, and general abuse — especially important for a financial application.

### Suggested Starting Points

| Endpoint / Action | Suggested Limit | Purpose |
|---|---|---|
| Login | 5 attempts / 15 min per account or IP | Prevent brute-force / credential stuffing |
| Registration | 5 / hour per IP | Prevent bot sign-ups |
| Password reset request | 3 / hour per email | Prevent email-bombing / abuse |
| Transaction create/update | ~60 / min per user | Prevent spam or scripted abuse |
| General API requests | ~100 / min per user | General abuse prevention |

These are starting recommendations, not final values — exact thresholds should be confirmed with the client (see the updated Questionnaire in Section 17).

### Implementation Options (React + Vite + Supabase)

- **Supabase Auth built-in limits** — Supabase Auth already applies default rate limits to sign-up, sign-in, password reset, and OTP requests. These should be reviewed in the Supabase dashboard (Authentication → Rate Limits) rather than assumed to be sufficient on their own.
- **Edge Functions + a store (e.g., Upstash Redis)** — for business-logic endpoints like transaction creation, a Supabase Edge Function can check and increment a per-user/IP counter within a time window before allowing the request through.
- **Database-level throttling** — a lightweight table (see below) can track recent attempts per user/action directly in Postgres. Simpler to set up, but less performant at high scale than a dedicated store.
- **Edge/CDN-level protection** — if deployed on Vercel, Netlify, or behind Cloudflare, platform-level rate limiting or WAF rules add a layer of defense before requests even reach the app.
- **Frontend throttling/debouncing** — improves UX (e.g., disabling a submit button while a request is in flight) but is not itself a security control; it must be backed by server-side enforcement.

## Additional Security Measures

Rate limiting is one layer. The following should also be part of the security baseline:

- **Input validation & sanitization** — validate on both the client (for UX) and the server/RLS layer (for security). Never rely on client-side validation alone.
- **XSS prevention** — React escapes output by default; avoid `dangerouslySetInnerHTML`, and sanitize free-text fields (transaction notes, descriptions) before rendering.
- **Secrets management** — the Supabase `anon` key is safe for client-side use; the `service_role` key must never be exposed in frontend code and should only be used in secure server-side contexts (e.g., Edge Functions).
- **Session/token handling** — rely on Supabase's JWT-based sessions; confirm token storage and refresh behavior are configured securely.
- **Account lockout** — temporarily lock or add escalating delays to accounts after repeated failed logins (works together with the login rate limit above).
- **HTTPS everywhere** — enforced by default on Supabase and typical hosts (Vercel/Netlify); confirm there's no mixed-content or HTTP fallback path.
- **Audit logging** — record sensitive actions (login, failed login, password change, account deletion, admin actions) for traceability.
- **Dependency security** — run `npm audit` and enable automated dependency updates (e.g., Dependabot), given the Node-based stack.
- **Least privilege** — RLS policies should stay as restrictive as possible; admin capabilities should be scoped narrowly rather than granting blanket access.
- **CAPTCHA (optional)** — consider adding to registration, login, or password-reset forms if bot abuse becomes an issue. Not required for MVP, but straightforward to add later.

## Suggested Schema Additions (Optional)

If rate limiting or audit logging is implemented at the database level rather than through Supabase's built-in protections or an external store, these tables extend the schema in Section 12:

```text
rate_limit_events
    id
    identifier      -- user_id or IP address
    action          -- login | password_reset | transaction_create | api_request
    created_at

audit_logs
    id
    user_id
    action          -- login | login_failed | password_change | account_deleted | admin_action
    metadata
    created_at
```

These tables are optional — only needed if rate limiting or auditing is handled in Postgres rather than via Supabase Auth's built-in protections or a service like Upstash Redis.

---

# 15. MVP vs. Future Features

## Phase 1 — MVP

### Must Have

- Authentication
- Dashboard
- Income
- Expenses
- Transactions
- Categories
- Accounts
- Budgets
- Basic reports
- Notifications
- Security / RLS
- Rate limiting on authentication endpoints
- Responsive UI

## Phase 2

### Should Have

- Recurring transactions
- Advanced reports
- CSV/PDF export
- Budget alerts
- Financial goals
- Savings tracking
- Transaction attachments / receipts
- Expanded rate limiting (per-endpoint, adaptive limits)
- CAPTCHA on authentication forms
- Audit logging

## Phase 3

### Could Have

- Shared/family budgets
- Multiple currencies
- Bank integrations
- Automatic transaction imports
- AI spending insights
- Investment tracking
- Financial forecasting
- Mobile application
- Advanced financial analytics

---

# 16. Development Phases

| Phase | Deliverable | Status |
| :--- | :--- | :---: | :--- |
| **Step 1** | Project Setup & Design System | ✅ | Tailwind v4, Neumorphic tokens, Lucide/Morphicons, fonts |
| **Step 2** | Auth & Landing Shell | ✅ | Supabase Auth, WelcomePage onboarding story, RLS profiles |
| **Step 3** | Navigation Shell & Layout | ✅ | Desktop Sidebar, floating AppHeader, Scooped Notch BottomNav + Connected Quick Hub card, desktop FAB |
| **Step 4** | Accounts & Wallets | 🚀 **NEXT** | Multi-account management (Cash, Bank, GCash, Maya), ₱ PHP |
| 6 | Categories Taxonomy | ⏸️ Pending |
| 7 | Transaction System & Quick Add FAB | ⏸️ Pending |
| 8 | Budget System | ⏸️ Pending |
| 9 | Dashboard | ⏸️ Pending |
| 10 | Reports & Analytics | ⏸️ Pending |
| 11 | Recurring Engine | ⏸️ Pending |
| 12 | Notifications & Mobile More Sheet | ⏸️ Pending |
| 13 | End-to-End Testing | ⏸️ Pending |
| 14 | Deployment | ⏸️ Pending |

### Development Principle

Do not start by building the dashboard.

The recommended sequence is:

```text
Client Requirements
        ↓
User Flows
        ↓
Data Model
        ↓
UI/UX Design
        ↓
Backend
        ↓
Frontend
        ↓
Integration
        ↓
Testing
        ↓
Deployment
```

---

# 17. Client Requirements Questionnaire

Before development begins, confirm the following requirements with the client.

## General

1. Is the application for personal users, businesses, families, or all three?
2. The application is **mobile-first and fully responsive** — optimized for mobile, tablet, and desktop.
3. **Default currency is Philippine Peso (₱ PHP).** Multiple currencies are deferred to Phase 3.
4. Are there other regional currency requirements beyond PHP?

## Financial Tracking

5. Should users track both income and expenses?
6. Should users have multiple bank accounts and wallets?
7. Should transfers between accounts be supported?
8. Should credit cards be supported?
9. Should users be able to attach receipts?

## Budgeting

10. Are budgets weekly, monthly, yearly, or customizable?
11. Can users create budgets per category?
12. Should users receive warnings at specific budget percentages such as 50%, 80%, and 90%?
13. What should happen when a budget is exceeded?

## Reports

14. What reports does the client require?
15. Should reports be exportable?
16. Should users be able to export CSV/PDF?

## Automation

17. Are recurring expenses required?
18. Are recurring incomes required?
19. Should notifications be sent by email?
20. Should browser notifications be supported?

## Administration

21. Does the client need an admin dashboard?
22. What should administrators be able to see?
23. Should administrators be able to modify user data?

## Security

24. Should users be able to delete their account?
25. Are there additional security or encryption requirements?
26. Are there compliance requirements?
27. Should accounts be temporarily locked after repeated failed login attempts, and if so, after how many?
28. Should CAPTCHA be added to registration, login, or password-reset forms to deter bots?
29. Are there specific rate-limit thresholds required (e.g., max login attempts per hour, max transactions per minute)?

---

# 18. Project Management Approach

The project should be managed in stages rather than implementing all features simultaneously.

## Step 1 — Requirements

Confirm exactly what the client wants.

**Output:**

- Approved feature list
- User roles
- Business rules
- Technical constraints
- MVP scope

## Step 2 — Planning

Create:

- User stories
- User flows
- Database design
- Page list
- API/backend requirements
- Development tasks

## Step 3 — Design

Create and approve:

- Wireframes
- UI design
- Responsive layouts
- Navigation
- Component structure

## Step 4 — Development

Implement the approved features in priority order.

Each feature should have:

- Requirements
- Development task
- Acceptance criteria
- Testing requirements

## Step 5 — QA

Test:

- Functionality
- Validation
- Authentication
- Authorization
- RLS
- Rate limiting
- Responsive design
- Error handling
- Performance
- Edge cases

## Step 6 — Deployment

Before production:

- Configure environment variables
- Verify database migrations
- Verify RLS
- Verify authentication
- Test production build
- Configure domain
- Perform final acceptance testing

---

# 19. Definition of Done

A feature should not be considered complete simply because the code works.

A feature is **Done** when:

- The feature matches the requirements
- UI is responsive
- Form validation works
- Error states are handled
- Loading states are handled
- Empty states are handled
- Database operations work correctly
- Authentication/authorization is enforced
- RLS policies are tested where applicable
- Rate limiting is enforced on authentication and other sensitive endpoints
- No critical console errors remain
- The feature works on supported browsers
- Acceptance criteria are satisfied
- The feature has been tested in realistic scenarios

---

# 20. Recommended Initial MVP Scope

For the first production version, prioritize:

```text
1. Authentication
2. User Profile
3. Accounts / Wallets
4. Categories
5. Income & Expense Transactions
6. Monthly Budgets
7. Dashboard
8. Basic Reports
9. Notifications
10. Security / RLS / Rate Limiting
```

Avoid adding complex bank integrations, AI, investment tracking, or family sharing until the core budgeting workflow is stable.

---

# 21. Project Manager Next Step

The project should now move from the high-level concept into a formal **Product Requirements Document (PRD)**.

The next PM deliverables should be:

1. Final feature requirements
2. User stories
3. Acceptance criteria
4. Complete page/screen list
5. User flow diagrams
6. Database ERD/schema specification
7. API/backend requirements
8. Frontend component requirements
9. Security & rate-limiting requirements
10. Development task breakdown
11. MVP milestone plan
12. QA test cases
13. Final definition of done

The project should be considered **requirements-first**. No major feature should be implemented until its purpose, data requirements, user flow, and acceptance criteria are understood.
