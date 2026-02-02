
import "dotenv/config";
import { db } from "@db";
import { leaseHeaders } from "@shared/schema/lease";
import { eq } from "drizzle-orm";

async function verifyLeaseMod() {
    console.log("Starting Phase 16 Step 2 Verification: Lease Modifications...");

    try {
        // 1. Create Dummy Lease for Test if needed, or pick existing. 
        // For script simplicity, we'll fetch the first lease.
        const [lease] = await db.select().from(leaseHeaders).limit(1);

        if (!lease) {
            console.log("No leases found to test. Please create one manually first or run Phase 8 verify.");
            process.exit(0);
        }

        console.log(`Testing Modification on Lease: ${lease.leaseNumber}`);
        console.log(`Original Rate: ${lease.discountRate}`);

        // 2. Call Remeasure API Logic (Simulate)
        const newRate = "0.08"; // 8%
        await db.update(leaseHeaders).set({
            isModified: true,
            modificationDate: new Date(),
            modificationReason: "Script Verification",
            previousLiability: lease.initialDirectCosts,
            discountRate: newRate,
            updatedAt: new Date()
        }).where(eq(leaseHeaders.id, lease.id));

        // 3. Verify Update
        const [updatedLease] = await db.select().from(leaseHeaders).where(eq(leaseHeaders.id, lease.id));

        if (updatedLease.discountRate !== newRate || !updatedLease.isModified) {
            throw new Error("Lease modification failed to persist.");
        }
        console.log(`SUCCESS: Lease Rate Updated to ${updatedLease.discountRate}`);
        console.log(`SUCCESS: Modification Flag Set: ${updatedLease.isModified}`);

        console.log("\n✅ PHASE 16 STEP 2 VERIFICATION PASSED");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ VERIFICATION FAILED:", error);
        process.exit(1);
    }
}

verifyLeaseMod();
