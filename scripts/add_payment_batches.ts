// scripts/add_payment_batches.ts
import { db } from "../server/db.ts";

async function main() {
    console.log('Starting Payment Batches migration...');

    // 1. Create ap_payment_batches table
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "ap_payment_batches" (
            "id" serial PRIMARY KEY NOT NULL,
            "batch_name" varchar(100) NOT NULL,
            "status" varchar(50) DEFAULT 'NEW',
            "check_date" timestamp DEFAULT now() NOT NULL,
            "pay_group" varchar(50),
            "payment_method_code" varchar(50) DEFAULT 'CHECK',
            "total_amount" numeric(18, 2) DEFAULT '0',
            "payment_count" integer DEFAULT 0,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now()
        );
    `);

    // 2. Add batch_id to ap_payments
    await db.execute(`
        ALTER TABLE ap_payments ADD COLUMN IF NOT EXISTS "batch_id" integer;
    `);

    console.log('Migration completed successfully.');
}

main().catch(e => {
    console.error('Migration failed:', e);
    process.exit(1);
});
