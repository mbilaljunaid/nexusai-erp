import { db } from './server/db';
import { slaEventTypes, slaEventClasses } from '@shared/schema/sla';
import { eq } from 'drizzle-orm';

async function main() {
    try {
        // Check for 'AP_INVOICE' event class
        let eventClassId = 'AP_INVOICE';
        const classes = await db.select().from(slaEventClasses).where(eq(slaEventClasses.id, eventClassId));
        if (classes.length === 0) {
            console.log("Creating AP_INVOICE event class...");
            await db.insert(slaEventClasses).values({
                id: eventClassId,
                applicationId: 'AP',
                name: 'AP Invoice',
                description: 'Account Payable Invoice Events'
            });
        }

        console.log("Checking AP_PREPAY_APPLICATION event type...");
        const existing = await db.select().from(slaEventTypes).where(eq(slaEventTypes.id, 'AP_PREPAY_APPLICATION'));
        if (existing.length === 0) {
            console.log("Inserting AP_PREPAY_APPLICATION event type...");
            await db.insert(slaEventTypes).values({
                id: 'AP_PREPAY_APPLICATION',
                eventClassId: eventClassId,
                name: 'Prepayment Application',
                description: 'Application of a prepayment to a standard invoice',
                accountingFlag: true
            });
            console.log("Successfully inserted AP_PREPAY_APPLICATION.");
        } else {
            console.log("AP_PREPAY_APPLICATION already exists.");
        }
    } catch (e) {
        console.error("Error setting up SLA Event Type:", e);
    } finally {
        process.exit(0);
    }
}

main();
