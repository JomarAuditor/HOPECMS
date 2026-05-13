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
| Backend / Database | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
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
- Create a `.env` file in the root directory
- Copy the keys from the **pinned message in our GC**
- Ensure your `.env` looks like `.env.example`:
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

Test files are located in `src/__tests__/`.

---

## 🗄️ Database Setup

Run migration files in this order via **Supabase SQL Editor**:

1. `db/migration/hopeCMSTable.sql` — creates the 5 HopeDB tables (customer, sales, salesDetail, product, priceHist)
2. `db/migration/alterCustomer.sql` — adds `record_status` + `stamp` columns to customer only
3. `db/migration/rightsTable.sql` — creates the authorization tables (user, Module, user_module, rights, UserModule_Rights)
4. `db/migration/seedModulesAndRights.sql` — seeds the 4 modules + 9 rights
5. `db/migration/seedHopeData.sql` — seeds the business data (82 customers, 52 products, 124 sales, 247 salesDetail, 70 priceHist)
6. `db/migration/provisionNewUserTrigger.sql` — installs the trigger that auto-creates `public.user` rows on signup
7. **Manual step:** create the SUPERADMIN auth account in Supabase Dashboard → Authentication → Users (`jcesperanza@neu.edu.ph`), then copy its UID
8. `db/migration/seedSuperAdmin.sql` — find/replace `<<SUPERADMIN_AUTH_UID>>` with the real UID, then run
9. `db/migration/verifySeeds.sql` — confirms all row counts and SUPERADMIN has 9 rights

---

## 📂 Project Structure

```
HOPECMS/
├── src/
│   ├── __tests__/      # Vitest test files (M5)
│   ├── components/     # ProtectedRoute, AppShell, PlaceholderPage
│   ├── context/        # AuthContext, UserRightsContext (M4)
│   ├── lib/            # supabaseClient.js
│   └── pages/          # Login, Register, AuthCallback, Customers, etc.
├── db/
│   └── migration/      # SQL migration files (M3)
├── docs/
│   ├── HOPECMS_ERD.png # Entity Relationship Diagram (M3)
│   └── SPRINT1_LOG.md  # Sprint 1 log (M5)
└── README.md
```

---

## 🛡️ Branching Strategy

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
M#_SPRINT 1_PR# - [branch-name] — [brief-description]
```

**Example:**
```
M5_SPRINT 1_PR1 - test/sprint1-auth-flows — Email + Google OAuth + login guard tests
```

---

## 👥 Team

| Member | Role |
|--------|------|
| M1 | Project Manager / Lead Developer |
| M2 | UI Developer (Jomar Auditor) |
| M3 | Database Specialist |
| M4 | Rights & Authentication Specialist |
| M5 | QA / Documentation Specialist (Wayne Andy Villamor) |
