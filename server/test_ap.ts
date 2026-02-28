import { db } from './db';
import { apInvoices } from '../shared/schema/ap';
import { eq } from 'drizzle-orm';
async function run() {
    try {
        const result = await db.select().from(apInvoices).where(eq(apInvoices.id, '0c534379-87da-46c9-b4c2-a8e7b62e3670')).limit(1);
        console.log("DB Result:", result);
    } catch (e) {
        console.error(e);
    }
}
run();
