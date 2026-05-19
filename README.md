# HOPECMS — Hope Inc. Customer Management System

[![Open Source License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React Version](https://img.shields.io/badge/React-18.x-blue?logo=react&logoColor=white)](https://react.dev/)
[![Supabase Database](https://img.shields.io/badge/Backend-Supabase%20%2F%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest Testing](https://img.shields.io/badge/Testing-Vitest%20%2B%20RTL-yellow?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

An enterprise-grade, open-source Customer Management System (CMS) custom-engineered for small-to-medium enterprises (SMEs) and localized organizations. HOPECMS provides a complete administrative and operational framework featuring a highly normalized relational database architecture, comprehensive role-based access management (RBAC), deep transaction ledger logging, and chronological price auditing.

---

## 🎯 Core Engineering Features

- **Relational Integrity & Normalization:** Built upon a strict Third Normal Form (3NF) relational schema running on PostgreSQL (via Supabase) to guarantee atomic transactions and eliminate data redundancy.
- **Dynamic Identity & Access Management (IAM):** Implements specialized database-level security modules. Utilizes custom PostgreSQL database triggers (`provisionNewUserTrigger`) to dynamically spin up secure user workspaces upon user registration.
- **Chronological Price Auditing:** System tracks continuous historical product price fluctuations (`pricehist`) mapping specific effectivity date intervals to accurately preserve ledger history and calculate margins over time.
- **Robust Automated Testing:** Fully integrated unit and integration testing workflows driven by Vitest and React Testing Library to enforce stable component state rendering and secure page routing.

---

## 📐 Entity Relationship Diagram

The database layer handles multi-dimensional data mapping across client records, personnel identifiers, sales ledgers, and changing product inventories.

![HopeCMS ERD](docs/HOPECMS_ERD.png)

### Core Schema Architecture:
- `customer` — Encapsulates client demographic records, structural addressing, and customized payment credit terms.
- `sales` — High-level transactional table logging primary sales data linked cleanly to transactional employees and customers.
- `salesdetail` — Precise transactional line-items mapping quantity variants, product IDs, and unit dimensions per sale ledger.
- `product` — Corporate master directory capturing product descriptions and tracking unique units of measure (UOM).
- `pricehist` — Temporal database tracker containing changing base prices bound to strict validity date ranges for auditing.

---

## 🛠️ Production Tech Stack

| Architecture Layer | Technology | Operational Purpose |
|---|---|---|
| **Frontend UI Engine** | [React](https://react.dev/) + [Vite](https://vitejs.dev/) | High-speed Virtual DOM diffing, declarative component architecture, and lightning-fast build bundling. |
| **Styling Layer** | [Tailwind CSS](https://tailwindcss.com/) | Atomic utility design pattern ensuring high layout responsiveness and optimal CSS bundle delivery. |
| **Backend / Cloud DB** | [Supabase](https://supabase.com/) (PostgreSQL) | Enterprise relational management, secure Row-Level Security (RLS) policies, and integrated OAuth engines. |
| **Testing Harness** | [Vitest](https://vitest.dev/) + [RTL](https://testing-library.com/) | Headless DOM isolation testing allowing rapid assertion verification for protected workflows. |
| **Language Specs** | JavaScript (ES6+) / SQL | Modern functional patterns mixed with highly procedural database migrations. |

---

## 🚀 Getting Started & Local Sandbox

### System Prerequisites
Ensure that **Node.js LTS** (Long Term Support) is active on your host system before deployment.

### 1. Environment Initialization
Clone the repository recursively and enter the project root to install core packages:
```bash
git clone [https://github.com/JomarAuditor/HOPECMS.git](https://github.com/JomarAuditor/HOPECMS.git)
cd HOPECMS
npm install
