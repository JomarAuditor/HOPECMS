# Sprint 2 Log — HOPECMS
**Project:** Hope Inc. Customer Management System
**Team:** New Era University — BS Information Technology
**Prepared by:** M5 — Wayne Andy Villamor (QA / Documentation Specialist)

---

## 👥 Team Members & Roles

| Member | Role |
|--------|------|
| M1 | Project Manager / Lead Developer (Jomar Auditor) |
| M2 | UI Developer (Christian Adlawan)|
| M3 | Database Specialist (Gabriel Antonino) |
| M4 | Rights & Authentication Specialist (Trixian Wackyll Granado) |
| M5 | QA / Documentation Specialist (Wayne Andy Villamor) |

---

## ✅ Tasks Completed This Sprint

### M1 — Project Manager / Lead Developer
- Built `customerService.js` — `getCustomers`, `addCustomer`, `updateCustomer`, `softDeleteCustomer`, `recoverCustomer`
- Built `Customers.jsx` — full CRUD UI with search, payterm filter, rights-gated Add/Edit/Delete buttons
- Built `CustomerDetail.jsx` — customer detail page with sales history
- Built `DeletedCustomers.jsx` — ADMIN/SUPERADMIN view of soft-deleted customers
- Built `DeletedCustomersGuard.jsx` — blocks non-admin from accessing deleted customers route
- Added `salesCustomerSummaryView.sql` and `productCurrentPriceView.sql` DB views

### M2 — UI Developer
- Built `AddCustomerModal.jsx`, `EditCustomerModal.jsx`, `SoftDeleteConfirmDialog.jsx`
- Built `AppShell.jsx` with role-based navigation
- Updated `Sales.jsx`, `Products.jsx` as read-only pages

### M3 — Database Specialist
- Updated `rightsTable.sql` — new schema with `userId`, `moduleCode`, `rightCode` columns
- Updated `seedModulesAndRights` — 4 modules + 9 rights seeded
- Added `customerRLS.sql` — RLS policy: USER role only sees ACTIVE customers
- Added `viewOnlyTableRLS.sql` — RLS policy: blocks write calls on Sales, SalesDetail, Product, PriceHistory
- Added `alterCustomer.sql` and `verifySeeds.sql`

### M4 — Rights & Authentication Specialist
- Updated `UserRightsContext.jsx` — SUPERADMIN bypass (all rights = 1), ADMIN/USER load from DB
- Updated `AuthContext.jsx` — simplified session listener
- Updated `ProtectedRoute.jsx` — redirects to `/login` if not authenticated

### M5 — QA / Documentation
- Wrote 27 test cases in `src/__tests__/rightsMatrix.test.js` (3 user types × 9 rights)
- Wrote 13 test cases in `src/__tests__/viewOnlyAndSoftDelete.test.js`
- Completed Sprint 2 log (this document)

---

## 🧪 Sprint 2 Test Cases

### PR-01 — Rights Matrix (27 cases)

| ID | User Type | Right | Expected | Status |
|----|-----------|-------|----------|--------|
| TC-S01 | SUPERADMIN | CUST_VIEW | 1 | ✅ Pass |
| TC-S02 | SUPERADMIN | CUST_ADD | 1 | ✅ Pass |
| TC-S03 | SUPERADMIN | CUST_EDIT | 1 | ✅ Pass |
| TC-S04 | SUPERADMIN | CUST_DEL | 1 | ✅ Pass |
| TC-S05 | SUPERADMIN | SALES_VIEW | 1 | ✅ Pass |
| TC-S06 | SUPERADMIN | SD_VIEW | 1 | ✅ Pass |
| TC-S07 | SUPERADMIN | PROD_VIEW | 1 | ✅ Pass |
| TC-S08 | SUPERADMIN | PRICE_VIEW | 1 | ✅ Pass |
| TC-S09 | SUPERADMIN | ADM_USER | 1 | ✅ Pass |
| TC-A01 | ADMIN | CUST_VIEW | 1 | ✅ Pass |
| TC-A02 | ADMIN | CUST_ADD | 1 | ✅ Pass |
| TC-A03 | ADMIN | CUST_EDIT | 1 | ✅ Pass |
| TC-A04 | ADMIN | CUST_DEL | 0 | ✅ Pass |
| TC-A05 | ADMIN | SALES_VIEW | 1 | ✅ Pass |
| TC-A06 | ADMIN | SD_VIEW | 1 | ✅ Pass |
| TC-A07 | ADMIN | PROD_VIEW | 1 | ✅ Pass |
| TC-A08 | ADMIN | PRICE_VIEW | 1 | ✅ Pass |
| TC-A09 | ADMIN | ADM_USER | 0 | ✅ Pass |
| TC-U01 | USER | CUST_VIEW | 1 | ✅ Pass |
| TC-U02 | USER | CUST_ADD | 0 | ✅ Pass |
| TC-U03 | USER | CUST_EDIT | 0 | ✅ Pass |
| TC-U04 | USER | CUST_DEL | 0 | ✅ Pass |
| TC-U05 | USER | SALES_VIEW | 1 | ✅ Pass |
| TC-U06 | USER | SD_VIEW | 1 | ✅ Pass |
| TC-U07 | USER | PROD_VIEW | 1 | ✅ Pass |
| TC-U08 | USER | PRICE_VIEW | 1 | ✅ Pass |
| TC-U09 | USER | ADM_USER | 0 | ✅ Pass |

### PR-02 — View-Only, Soft-Delete, Recovery, RLS, Stamp (13 cases)

| ID | Description | Expected Result | Status |
|----|-------------|-----------------|--------|
| TC-V01 | Sales page — no write calls | insert/update/delete not called | ✅ Pass |
| TC-V02 | SalesDetail page — no write calls | insert/update/delete not called | ✅ Pass |
| TC-V03 | Product page — no write calls | insert/update/delete not called | ✅ Pass |
| TC-V04 | PriceHistory page — no write calls | insert/update/delete not called | ✅ Pass |
| TC-D01 | Soft-delete C0001 → INACTIVE | record_status = INACTIVE, stamp contains DEACTIVATED | ✅ Pass |
| TC-D02 | USER list hides INACTIVE C0001 | C0001 not in USER results | ✅ Pass |
| TC-D03 | ADMIN sees INACTIVE C0001 in Deleted panel | C0001 found with INACTIVE status | ✅ Pass |
| TC-R01 | ADMIN recovers C0001 → ACTIVE | record_status = ACTIVE, stamp contains REACTIVATED | ✅ Pass |
| TC-R02 | Recovered C0001 reappears in all views | C0001 found in ACTIVE query | ✅ Pass |
| TC-B01 | RLS blocks INACTIVE rows for USER | No INACTIVE rows returned | ✅ Pass |
| TC-B02 | USER cannot access INACTIVE customer directly | data = null | ✅ Pass |
| TC-ST01 | USER — isAdmin() = false, stamp hidden | isAdmin() returns false | ✅ Pass |
| TC-ST02 | ADMIN — isAdmin() = true, stamp visible | isAdmin() returns true | ✅ Pass |
| TC-ST03 | SUPERADMIN — isAdmin() = true, stamp visible | isAdmin() returns true | ✅ Pass |

---

## 🚧 Blockers Encountered

| Blocker | Who | Resolution |
|---------|-----|------------|
| Git not initialized on new device | M5 | Cloned repo fresh from GitHub |
| Branch push showing empty on GitHub | M5 | Fixed by setting git user config and recommitting |
| `package.json` save conflict in VS Code | M5 | Clicked Overwrite to save changes |

---

## 🎯 Next Sprint Goals

- [ ] Admin Panel — full user activation/deactivation UI
- [ ] Role-based navigation hiding menu items for USER
- [ ] M5: Sprint 3 test cases for Admin Panel and user management

---

## 📅 Sprint Timeline

| Week | Activity |
|------|----------|
| Week 1 | Sprint 2 planning, customer CRUD implementation started |
| Week 2 | Rights system wired, soft-delete + recovery built |
| Week 3 | RLS policies added, view-only pages enforced |
| Week 4 | QA testing, Sprint 2 log, all PRs submitted |
