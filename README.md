# DoodhWala — Cow Milk Subscription Delivery System
*Punjab Dairy Network • University Final Project (INT252 & INT257)*

Built by a solo student developer as a university final project for **INT252 (React Development)** and **INT257 (Next.js Application Development)**.

---

## 1. Project Overview & Background

DoodhWala is a complete full-stack web application designed for a regional cow milk dairy operating in the Fatehgarh Sahib, Mandi Gobindgarh, and Amloh districts of Punjab, India. 

The application solves daily challenges faced by both household subscribers and the dairy owner:
1. **Quantity Planner:** Subscribers customize their milk requirements for each day of the week (Monday through Sunday) in 0.5 L steps, select between **Desi Cow Milk (₹62/L)** and **A2 Gir Cow Milk (₹85/L)**, and see real-time monthly cost projections update via `useMemo`.
2. **Prepaid Wallet Ledger:** Customers maintain a prepaid balance with simulated instant top-ups (₹100 to ₹10,000). Every morning's confirmed delivery automatically deducts the exact day cost. A "days of milk left" projection warns customers before balance runs out.
3. **Flexible Subscription Pause:** Subscribers can pause deliveries for specific date ranges (vacations, weddings, festivals) with strict overlap prevention. Paused mornings are never billed. Customers can resume early with one click.
4. **Interactive Delivery Calendar:** A monthly grid showing daily statuses (`SCHEDULED`, `DELIVERED`, `PAUSED`, `SKIPPED`, `MISSED`). Customers can skip or adjust quantity for upcoming days before the strict **10:00 PM IST previous-day order cutoff**.
5. **Dairy Owner Dispatch Portal:** Grouped by delivery areas (Mandi Gobindgarh, Fatehgarh Sahib, Amloh). The dairy owner runs **Process Today's Deliveries** inside an atomic Prisma transaction to verify balances, debit wallets, mark missed deliveries if balance is insufficient (no negative balances permitted), and capture delivery proof photos.

---

## 2. Seed Test Credentials

The database comes pre-seeded with realistic Punjabi customer subscriptions and an admin account:

| Role | Name | Phone Number | Password | Default Area | Wallet Balance |
|---|---|---|---|---|---|
| **CUSTOMER** | Gurpreet Singh | `9876500001` | `demo1234` | Mandi Gobindgarh | ₹2,500.00 |
| **CUSTOMER** | Simran Kaur | `9876500002` | `demo1234` | Amloh | ₹1,800.00 |
| **ADMIN** | Harjit Sandhu | `9876500000` | `admin1234` | Fatehgarh Sahib | Dairy Owner |

---

## 3. Quick Start & Setup Instructions

To run the application locally from scratch, run these commands:

```bash
# 1. Install dependencies
npm install

# 2. Push Prisma database schema to local SQLite file
npx prisma db push

# 3. Seed initial dairy products, subscribers, and ledger rows
npx prisma db seed

# 4. Run pure function unit tests
npm test

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. End-to-End Walkthrough Script

Follow these steps to exercise all five core capabilities during project evaluation:

1. **Register or Log In:**
   - Go to `/login` and click the demo button for **Gurpreet Singh** (`9876500001` / `demo1234`), or register a new customer at `/register`.
2. **Configure Quantity Planner:**
   - Navigate to `/dashboard/planner`.
   - Toggle milk varieties between **Desi Cow Milk (₹62/L)** and **A2 Gir Cow Milk (₹85/L)**.
   - Adjust daily litres using the `+` and `-` buttons in 0.5 L steps (e.g., 1.0 L weekdays, 2.5 L on weekends).
   - Observe the live monthly estimate recalculate dynamically. Click **Save Subscription Plan**.
3. **Recharge Prepaid Wallet:**
   - Navigate to `/dashboard/wallet`.
   - Select a preset (e.g., ₹1,000) or enter a custom amount.
   - Click **Pay ₹1,000**. The ledger table immediately prepends the credit transaction, and the "days of milk left" metric updates.
4. **Pause Subscription:**
   - Navigate to `/dashboard/pause`.
   - Select dates for a 3-day trip (or click the quick preset **Next 3 Days**).
   - Click **Confirm Pause Dates**. Notice the scheduled pause card appear. Paused days are highlighted with an optimistic UI update.
5. **Inspect Delivery Calendar:**
   - Navigate to `/dashboard/calendar`.
   - Notice the countdown timer showing remaining hours and minutes until tonight's **10:00 PM IST cutoff**.
   - Observe the paused days colored in terracotta with status `Paused`.
   - Click any future active day to open the modal and click **Skip This Day**.
6. **Admin Daily Fulfillment Batch:**
   - Log out and log in as dairy owner **Harjit Sandhu** (`9876500000` / `admin1234`).
   - You are redirected to `/admin`.
   - View today's delivery round grouped by Punjab areas.
   - Click **⚡ Process Today's Deliveries**. The atomic transaction validates subscriber balances, debits wallets, marks low balances as `MISSED`, and leaves paused customers untouched.
   - Attach a delivery proof photo using the 📷 Photo file upload button.
7. **Uncontrolled Form Price Update:**
   - Navigate to `/admin/products`.
   - Notice the rate update form uses React `useRef` directly on DOM inputs (uncontrolled pattern).
   - Change the price and click **Save New Price via Ref**. The change revalidates both customer views and the public `/plans` page.

---

## 5. Comprehensive Syllabus Coverage & Architecture Mapping

Every single item required across **INT252 (React)** and **INT257 (Next.js)** is explicitly implemented in the codebase:

### React / INT252 Syllabus Mapping

| Syllabus Requirement | Code Implementation & Location |
|---|---|
| **ES6+ Features** (map, filter, reduce, spread, destructuring) | `lib/dates.js`, `lib/money.js`, `features/planner/PlannerForm.js` |
| **Pure Functions Library** | `lib/money.js` (`calcDayAmount`, `calcMonthlyEstimate`, `estimateDaysLeft`) |
| **Functional Components & Props** | Throughout `components/ui/Button.js`, `components/ui/Input.js`, `DayCell.js` |
| **Component Composition Pattern** | `components/ui/Card.js` with `<Card.Header>`, `<Card.Body>`, `<Card.Footer>` |
| **Conditional Rendering** | `features/calendar/DayCell.js`, `features/pause/ActivePausesList.js` |
| **Lifting State Up** | `features/planner/WeeklyGrid.js` lifts day quantities to parent `PlannerForm.js` |
| **Mobile-First Tailwind CSS** | `app/globals.css` with responsive breakpoint classes tested at 360px viewport |
| **Semantic HTML & Accessibility** | `role="grid"`, `role="gridcell"`, `aria-label`, `<label htmlFor>` in forms |
| **useState & useEffect with cleanup** | `features/calendar/useCutoffTimer.js` (`setInterval` with `clearInterval`) |
| **useContext (Context API)** | `features/auth/AuthContext.js` provides user state and session refresh |
| **useMemo & useCallback** | `features/planner/PlannerForm.js` (live monthly calculation via `useMemo`) |
| **React.memo** | `features/calendar/DayCell.js` memoizes 31 day cells against unnecessary renders |
| **Custom Hooks** | `features/wallet/useWalletBalance.js` and `features/calendar/useCutoffTimer.js` |
| **Controlled Forms** | `app/login/page.js`, `app/register/page.js`, `features/wallet/TopUpForm.js` |
| **Uncontrolled Form with Refs** | `features/admin/ProductPriceForm.js` using `useRef` on input nodes |
| **Zod Schema Validation** | `lib/schemas.js` shared across client and server with inline error displays |
| **Zustand Global State** | `stores/uiStore.js` manages toast notifications, sidebar, and selected month |
| **TanStack React Query** | `useWalletBalance.js`, `app/dashboard/planner/page.js`, `app/dashboard/pause/page.js` |
| **Unit Testing** | `tests/utils.test.js` using Node.js built-in test runner (`node --test`) |

---

### Next.js / INT257 Syllabus Mapping

| Syllabus Requirement | Code Implementation & Location |
|---|---|
| **App Router & Nested Layouts** | `app/layout.js`, `app/dashboard/layout.js`, `app/admin/layout.js` |
| **SSG (Static Site Generation)** | `app/page.js` (Landing) and `app/how-it-works/page.js` |
| **ISR (Incremental Static Regeneration)** | `app/plans/page.js` (`export const revalidate = 60`) |
| **SSR (Dynamic Server Rendering)** | `app/dashboard/page.js`, `app/admin/customers/page.js` |
| **CSR (Client-Side Rendering)** | `app/dashboard/calendar/page.js`, `app/dashboard/planner/page.js` |
| **Loading, Error & 404 UI** | `app/loading.js`, `app/error.js`, `app/not-found.js` |
| **Proxy Route Protection (Next 16)** | `proxy.js` validating JWT session cookie and handling RBAC |
| **REST Route Handlers** | `app/api/plan/route.js`, `app/api/wallet/route.js`, `app/api/pauses/route.js`, `app/api/deliveries/route.js`, `app/api/admin/process-today/route.js` |
| **Server Actions** | `features/auth/actions.js`, `features/wallet/actions.js`, `features/pause/actions.js`, `features/planner/actions.js` |
| **Optimistic UI Updates** | `features/pause/ActivePausesList.js` using React 19 `useOptimistic` |
| **File Upload Handling** | `app/api/admin/delivery-status/route.js` saving proof photos to `public/uploads` |
| **Lazy Loading / Dynamic Import** | `app/dashboard/calendar/page.js` dynamically importing `DayModal.js` |
| **Metadata API & SEO** | `app/sitemap.js`, `app/robots.js`, `generateMetadata` in dynamic pages |
| **Bilingual Toggle (i18n)** | `lib/i18n.js` providing English / Hindi translation labels in `Navbar.js` |
| **Prisma Atomic Transactions** | `prisma.$transaction` in wallet top-up and `process-today` delivery batch |

---

## 6. Vercel Production Deployment Guide

SQLite is a local file-based database, which is ideal for grading and local execution without external service setup. When deploying to a serverless platform like Vercel where the filesystem is ephemeral:

1. **Provision a Postgres Database:**
   - Create a free serverless Postgres instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. **Update Prisma Datasource:**
   - In `prisma/schema.prisma`, change provider from `sqlite` to `postgresql`:
     ```prisma
     datasource db {
       provider = "postgresql"
       url      = env("DATABASE_URL")
     }
     ```
3. **Configure Environment Variables in Vercel:**
   - Set `DATABASE_URL` to your pooled Postgres connection string (`postgres://...`).
   - Set `JWT_SECRET` to a cryptographically secure random string.
   - Set `NEXT_PUBLIC_APP_NAME="DoodhWala"`.
4. **Deploy:**
   - Run `npx prisma db push && npx prisma db seed`.
   - Connect your GitHub repository to Vercel and deploy.

---

## 7. What I'd Improve in Future Versions

If I had additional development time, I would like to expand the project with:
- **WhatsApp Webhook Notifications:** Sending automated morning delivery confirmation receipts and low-balance reminders via the WhatsApp Business API.
- **Route Optimization Engine:** Using GPS coordinates to compute the optimal sequence of stops for delivery drivers across Fatehgarh Sahib and Mandi Gobindgarh.
- **RFID Milk Bag Scan:** Allowing the delivery person to tap an NFC or barcode sticker on the subscriber's milk bag to verify location before dropping bottles.
