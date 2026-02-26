import { db } from './server/db';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        await db.execute(sql`ALTER TABLE ap_invoice_payments ADD COLUMN discount_taken numeric(18,2) DEFAULT '0'`);
        console.log("Column added successfully.");
    } catch (e: any) {
        if (e.message.includes('already exists')) {
            console.log("Column already exists.");
        } else {
            console.error(e);
        }
    }
    process.exit(0);
}
main();
