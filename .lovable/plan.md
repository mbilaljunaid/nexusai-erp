

# Run Database Migrations

## Current Setup

Your project uses **Drizzle ORM** with `drizzle-kit push` to sync schema changes directly to your PostgreSQL database. The command is defined as:

```
npm run db:push
```

This reads your schema from `shared/schema/index.ts` and pushes any structural changes to your database.

## How to Run Migrations

Since Lovable cannot execute shell commands directly, you have two options:

### Option 1: Run Locally (Recommended)

1. Clone your repository from GitHub
2. Create a `.env` file with your `DATABASE_URL`
3. Run:
   ```bash
   npm install
   npm run db:push
   ```
4. Drizzle Kit will show you the pending changes and ask for confirmation

### Option 2: Generate SQL and Run Manually

1. Clone the repo locally
2. Run `npx drizzle-kit generate` to create SQL migration files
3. Copy the generated SQL
4. Run it directly against your database using a tool like **pgAdmin**, **DBeaver**, or your hosting provider's SQL console

## About the Build Errors

The build errors shown are **not migration issues** -- they are TypeScript type mismatches in backend files (NestJS controllers and Drizzle schema field name mismatches). These need separate fixes:

- **NestJS controllers** (`ar-tax`, `intercompany-tax`, `inventory-tax`, `configuration`): Need `import type` instead of regular `import` for decorated parameters
- **`ap.service.ts`**: References fields like `status`, `amount`, `invoiceNumber` that don't match the current `apInvoices` schema column names
- **Migration scripts** (`migrate_core_hr`, `migrate_tca_data`, `seed_ar_revenue_sla`, etc.): Schema mismatches from recent schema changes

These are code fixes, not database migration issues. If you'd like, I can fix these build errors in a follow-up step after you approve.

