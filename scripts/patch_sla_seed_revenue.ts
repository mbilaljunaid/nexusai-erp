import "dotenv/config";
import { db } from "../server/db";
import { slaEventClasses } from "@shared/schema";

async function seed() {
    console.log("Seeding AR_REVENUE_RECOGNIZED event class...");
    try {
        await db.insert(slaEventClasses).values({
            id: "AR_REVENUE_RECOGNIZED",
            applicationId: "AR",
            name: "Revenue Recognition",
            description: "Recognition of deferred revenue",
            enabledFlag: true
        }).onConflictDoNothing();
        console.log("Done.");
    } catch (e) {
        console.error("Seeding failed:", e);
    }
    process.exit(0);
}
seed().catch(console.error);
