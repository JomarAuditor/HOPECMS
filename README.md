# HOPECMS - Hospital Operations & Patient Electronic Care Management System

## 🚀 Getting Started
1. **Clone the repo:** `git clone https://github.com/JomarAuditor/HOPECMS.git`
2. **Install dependencies:** `npm install`
3. **Environment Setup:** - Create a `.env` file in the root directory.
   - Copy the keys from the pinned message in our GC.
   - Ensure your `.env` looks like `.env.example`.
4. **Run local server:** `npm run dev`

## 📂 Project Structure
- `src/pages`: All CMS module pages (Customers, Sales, etc.).
- `src/components`: Reusable UI and Route Guards.
- `src/lib`: Supabase client configuration.
- `db/migrations`: SQL scripts for database seeding (M3).

## 🛡️ Branching Strategy
- **main**: Production ready (Locked).
- **dev**: Main integration branch (Locked - PR Required).
- **feat/* / db/* / fix/*:** Individual task branches.

## ✍️ PR Naming Convention
All PRs must follow this format for grading:
`M#_SPRINT 1_PR# - [branch-name] — [brief-description]`
*Example: M2_SPRINT 1_PR1 - feat/ui-login-page — Login form setup*