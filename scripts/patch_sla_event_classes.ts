import "dotenv/config";
import { db } from "../server/db";
import { slaEventClasses } from "@shared/schema";
import { sql } from "drizzle-orm";

async function patch() {
    console.log("Seeding SLA Event Classes...");

    await db.insert(slaEventClasses).values([
        {
            id: "AR_ADJUSTMENT_CREATED",
            applicationId: "AR",
            name: "AR Adjustment Created",
            description: "When an AR Adjustment or Write-off is created."
        }
    ]).onConflictDoNothing();

    console.log("- AR_ADJUSTMENT_CREATED seeded.");
    process.exit(0);
}

patch().catch(err => {
    console.error("Patch failed:", err);
    process.exit(1);
});
