import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function applyExpenseSchema() {
  console.log("🚀 Manually applying Expense Management schema...");

  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "expense_reports" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" varchar NOT NULL,
        "report_number" varchar NOT NULL,
        "employee_id" varchar NOT NULL,
        "purpose" text,
        "status" varchar DEFAULT 'DRAFT' NOT NULL,
        "total_amount" numeric(20, 2) DEFAULT '0' NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "submitted_at" timestamp,
        "approved_at" timestamp,
        "approved_by" varchar,
        "payment_date" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "expense_reports_report_number_unique" UNIQUE("report_number")
      );
    `);
    console.log("✅ Table 'expense_reports' created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "expense_lines" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" varchar NOT NULL,
        "report_id" varchar NOT NULL,
        "expense_date" timestamp NOT NULL,
        "category" varchar NOT NULL,
        "merchant" varchar,
        "amount" numeric(20, 2) NOT NULL,
        "tax_amount" numeric(20, 2) DEFAULT '0',
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "description" text,
        "receipt_url" text,
        "status" varchar DEFAULT 'PENDING' NOT NULL,
        "justification" text,
        "gl_code_combination_id" varchar,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'expense_lines' created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "expense_policies" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" varchar NOT NULL,
        "name" varchar NOT NULL,
        "category" varchar,
        "limit_amount" numeric(20, 2),
        "currency" varchar DEFAULT 'USD',
        "requires_receipt_above" numeric(20, 2) DEFAULT '0',
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'expense_policies' created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "expense_per_diems" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" varchar NOT NULL,
        "location_code" varchar NOT NULL,
        "rate" numeric(20, 2) NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "effective_start_date" timestamp NOT NULL,
        "effective_end_date" timestamp,
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'expense_per_diems' created or already exists.");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "corporate_card_transactions" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "tenant_id" varchar NOT NULL,
        "card_id" varchar NOT NULL,
        "employee_id" varchar NOT NULL,
        "transaction_date" timestamp NOT NULL,
        "merchant" varchar NOT NULL,
        "amount" numeric(20, 2) NOT NULL,
        "currency" varchar DEFAULT 'USD' NOT NULL,
        "status" varchar DEFAULT 'UNRECONCILED' NOT NULL,
        "expense_line_id" varchar,
        "external_reference" varchar,
        "created_at" timestamp DEFAULT now() NOT NULL
      );
    `);
    console.log("✅ Table 'corporate_card_transactions' created or already exists.");

    // Add foreign key constraint if it doesn't exist
    try {
      await db.execute(sql`
        ALTER TABLE "expense_lines" 
        ADD CONSTRAINT "expense_lines_report_id_expense_reports_id_fk" 
        FOREIGN KEY ("report_id") REFERENCES "expense_reports"("id") 
        ON DELETE cascade;
      `);
      console.log("✅ Foreign key constraint added.");
    } catch (e) {
      console.log("ℹ️ Foreign key constraint might already exist, skipping.");
    }

    console.log("✨ Expense Management schema applied successfully!");
  } catch (err) {
    console.error("❌ Error applying schema:", err);
    process.exit(1);
  }
}

applyExpenseSchema();
