# HOPECMS — Hope Inc. Customer Management System

> A web-based Customer Management System built for **Hope, Inc.** to manage customer records, sales transactions, product listings, and pricing history.

---

## 📐 Entity Relationship Diagram

![HopeCMS ERD](docs/HOPECMS_ERD.png)

The system is built around the following core entities:

- **customer** — stores customer information including name, address, and payment terms
- **sales** — records each sales transaction linked to a customer and employee
- **salesdetail** — line items of each sale, referencing the product and quantity
- **product** — product catalog with description and unit of measure
- **pricehist** — historical pricing records per product with effectivity dates

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Backend / Database | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| Testing | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| Language | JavaScript / JSX |
| Package Manager | npm |
| Version Control | Git + GitHub |

---

## 🚀 Getting Started

### Prerequisites
Make sure **Node.js LTS** is installed → https://nodejs.org

### Clone the repo
```bash
git clone https://github.com/JomarAuditor/HOPECMS.git
cd HOPECMS
```

### Install dependencies
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory and fill in the values from the **pinned message in our GC**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Run local server
```bash
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 🧪 Running Tests

Tests are written with **Vitest + React Testing Library**.

Install test dependencies (one time only):
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom
```

Run all tests:
```bash
npm run test
```

Expected results:
- `authFlows.test.js` — 12 tests (Sprint 1 auth flows)
- `rightsMatrix.test.js` — 27 tests (3 user types × 9 rights)
- `functionalLogic.test.js` — 14 tests (view-only, soft-delete, recovery, RLS, stamp)

Test files are in `src/__tests__/`.

---

## 🗄️ Database Setup

Run migration files **in this exact order** via **Supabase SQL Editor**:

1. `db/migration/hopeCMSTable.sql` — core tables (customer, sales, salesdetail, product, pricehist)
2. `db/migration/alterCustomer.sql` — adds record_status and stamp columns to customer
3. `db/migration/rightsTable.sql` — creates user, module, rights, user_module, usermodule_rights tables
4. `db/migration/seedModulesAndRights` — seeds 4 modules and 9 rights
5. `db/migration/seedSuperAdmin.sql` — creates the initial SUPERADMIN account
6. `db/migration/customerRLS.sql` — RLS policy: USER only sees ACTIVE customers
7. `db/migration/adminMouduleRLS.sql` — RLS policy: blocks non-SUPERADMIN from admin module
8. `db/migration/viewOnlyTableRLS.sql` — RLS policy: blocks write calls on Sales, SalesDetail, Product, PriceHistory
9. `db/migration/salesCustomerSummaryView.sql` — view for sales + customer summary
10. `db/migration/productCurrentPriceView.sql` — view for product + current price
11. `db/migration/customerRevenueView.sql` — view for customer revenue report
12. `db/migration/verifySeeds.sql` — run to verify all seed data is correct

---

## 📂 Project Structure

```
HOPECMS/
├── src/
│   ├── __tests__/          # Vitest test files (M5)
│   │   ├── authFlows.test.js
│   │   ├── rightsMatrix.test.js
│   │   ├── functionalLogic.test.js
│   │   └── setup.js
│   ├── components/         # ProtectedRoute, AppShell, modals
│   ├── context/            # AuthContext, UserRightsContext (M4)
│   ├── lib/                # supabaseClient.js
│   ├── pages/              # Login, Register, AuthCallback, Customers, etc.
│   └── services/           # customerService.js
├── db/
│   └── migration/          # SQL migration files (M3)
├── docs/
│   ├── HOPECMS_ERD.png     # Entity Relationship Diagram (M3)
│   ├── SPRINT1_LOG.md      # Sprint 1 log (M5)
│   └── SPRINT2_LOG.md      # Sprint 2 log (M5)
└── README.md
```

---

## 🌿 Branching Strategy

| Branch | Description |
|---|---|
| `main` | Production-ready — **Locked** |
| `dev` | Main integration branch — **Locked** (PR Required) |
| `feat/*` | Feature development branches |
| `db/*` | Database-related branches |
| `test/*` | QA / test branches (M5) |
| `docs/*` | Documentation branches (M5) |
| `fix/*` | Bug fix branches |

---

## ✍️ PR Naming Convention

All pull requests must follow this format for grading:

```
M#_SPRINT #_PR# - [branch-name] — [brief-description]
```

**Example:**
```
M5_SPRINT 2_PR1 - test/sprint2-rights-27-cases — Full 27-case rights test matrix
```

---

## 👥 Team

| Member | Role |
|--------|------|
| M1 | Project Manager / Lead Developer (Jomar Auditor) |
| M2 | UI Developer (Christian Adlawan)|
| M3 | Database Specialist (Gabriel Antonino) |
| M4 | Rights & Authentication Specialist (Trixian Wackyll Granado) |
| M5 | QA / Documentation Specialist (Wayne Andy Villamor) |
