# Sprint 1 Log — HOPECMS
**Project:** Hope Inc. Customer Management System
**Team:** New Era University — BS Information Technology
**Prepared by:** M5 — Wayne Andy Villamor (QA / Documentation Specialist)

---

## 👥 Team Members & Roles

| Member | Role |
|--------|------|
| M1 | Project Manager / Lead Developer |
| M2 | UI Developer (Jomar Auditor) |
| M3 | Database Specialist |
| M4 | Rights & Authentication Specialist |
| M5 | QA / Documentation Specialist (Wayne Andy Villamor) |

---

## ✅ Tasks Completed This Sprint

### M3 — Database Specialist
- Set up Supabase project under `CustomerManagementOrg`
- Created core tables via `HopeDB5Tables.sql`: `sales`, `salesDetail`, `product`, `priceHist`, `customer`
- Created authorization structure via `authorizationModule.sql`: `modules`, `rights`, `user_rights` tables
- Seeded 4 modules via `seedModule.sql`: `Cust_Mod`, `Sales_Mod`, `Prod_Mod`, `Adm_Mod`
- Seeded 9 rights via `seedRights.sql`: `CUST_VIEW`, `CUST_ADD`, `CUST_EDIT`, `CUST_DEL`, `SALES_VIEW`, `SD_VIEW`, `PROD_VIEW`, `PRICE_VIEW`, `ADM_USR`
- Created SuperAdmin seed (`seedSuperAdmin.sql`) and rights update script (`updateUserRight.sql`)
- Created `provisionNewUserTrigger.sql`:
  - Inserts new user as `INACTIVE` into `public.user` using `auth_uid`
  - Seeds 4 rows in `user_module`
  - Seeds 9 rights in `UserModule_Rights` (VIEW rights = 1, all others = 0)
- Added `recordAndStampOnCustTable.sql` for customer table record status and timestamps
- Created ERD diagram (`docs/HOPECMS_ERD.png`)

### M4 — Rights & Authentication Specialist
- Built `AuthContext.jsx` — session listener via `onAuthStateChange`, exposes `currentUser` and `loading`
- Built `ProtectedRoute.jsx` — redirects to `/login` if not authenticated
- Built `Login.jsx` — email/password sign-in, Google OAuth, inline login guard via `auth_uid`
- Built `Register.jsx` — fields for first name, last name, username, email, password; Google register; success state
- Built `AuthCallback.jsx` — PKCE code exchange via `exchangeCodeForSession`, login guard for Google OAuth
- Configured `supabaseClient.js` with `flowType: 'pkce'`, `autoRefreshToken`, `persistSession`, `detectSessionInUrl`

### M5 — QA / Documentation
- Installed Vitest + React Testing Library + jsdom
- Configured `vitest.config.js` with jsdom environment and setup file
- Wrote 12 test cases in `src/__tests__/authFlows.test.js` covering all 4 Sprint 1 auth flows
- Completed Sprint 1 log (this document)
- Updated `README.md` with setup instructions, project structure, and branching strategy

---

## 🧪 Test Cases Written (Sprint 1)

| ID | Description | Expected Result | Status |
|----|-------------|-----------------|--------|
| TC-01 | Email sign-up with valid credentials and metadata | Returns user object, no error | ✅ Pass |
| TC-02 | Email sign-up with already registered email | Returns error message | ✅ Pass |
| TC-03 | New account provisioned as INACTIVE by trigger | `record_status` = `INACTIVE` | ✅ Pass |
| TC-04 | Google OAuth initiates with correct provider | `signInWithOAuth` called with `google` | ✅ Pass |
| TC-05 | Google OAuth redirectTo contains /auth/callback | `redirectTo` includes `/auth/callback` | ✅ Pass |
| TC-06 | AuthCallback exchanges PKCE code for session | `exchangeCodeForSession` called with code | ✅ Pass |
| TC-07 | Login guard signs out INACTIVE user | `signOut()` called once | ✅ Pass |
| TC-08 | Login guard sets error for INACTIVE user | Error contains "pending activation" | ✅ Pass |
| TC-09 | Login guard signs out when user row not found | `signOut()` called, error set | ✅ Pass |
| TC-10 | Login guard does NOT sign out ACTIVE user | `signOut()` never called | ✅ Pass |
| TC-11 | No error message set for ACTIVE user | `errorMsg` is null | ✅ Pass |
| TC-12 | ACTIVE user navigated to /customers after login | destination equals `/customers` | ✅ Pass |

---

## 🚧 Blockers Encountered

| Blocker | Who | Resolution |
|---------|-----|------------|
| New device — Node.js not installed | M5 | Installed Node.js LTS from nodejs.org |
| IntelliJ terminal not recognizing npm | M5 | Installed Node.js, restarted terminal |
| Google OAuth required PKCE flow | M4 | Implemented `exchangeCodeForSession` in `AuthCallback.jsx` |
| `supabaseClient.js` needed PKCE config | M4 | Added `flowType: 'pkce'` to client options |

---

## 🎯 Next Sprint Goals

- [ ] Admin Panel — SUPERADMIN activates/deactivates users
- [ ] Wire `UserModule_Rights` to control UI visibility per role
- [ ] Customer CRUD with `record_status` soft-delete
- [ ] AppShell navigation based on user role
- [ ] M5: Sprint 2 test cases for admin panel and rights enforcement

---

## 📅 Sprint Timeline

| Week | Activity |
|------|----------|
| Week 1 | Project setup, Supabase DB and branching strategy agreed |
| Week 2 | Auth context, email sign-in/sign-up, login guard implemented |
| Week 3 | Google OAuth, PKCE callback, provision trigger completed |
| Week 4 | QA testing, documentation, all Sprint 1 PRs submitted |
