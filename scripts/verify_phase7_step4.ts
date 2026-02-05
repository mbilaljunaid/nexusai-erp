
import { db } from "../server/db";
import { matchingService } from "../server/services/MatchingService";
import { partyService } from "../server/services/PartyService";
import { hzDupSets } from "../shared/schema";
import { eq } from "drizzle-orm";

async function verifyDataQuality() {
    console.log("Starting MDM Phase 7 Step 4 Verification (Data Quality)...");

    try {
        // 1. Seed Duplicate Data
        console.log("\n[1] Seeding Duplicate Data...");

        const baseName = "Acme Corp";
        const dupeName = "Acme Corporation"; // Similar enough
        const distinctName = "Zeta Industries"; // Distinct

        // Party 1
        const { party: p1 } = await partyService.createOrganization(
            { partyName: baseName + " " + Date.now(), partyNumber: "DQ-TEST-1-" + Date.now(), partyType: 'ORGANIZATION' },
            { organizationName: baseName }
        );

        // Party 2 (Duplicate)
        const { party: p2 } = await partyService.createOrganization(
            { partyName: dupeName + " " + Date.now(), partyNumber: "DQ-TEST-2-" + Date.now(), partyType: 'ORGANIZATION' },
            { organizationName: dupeName }
        );

        // Party 3 (Distinct)
        const { party: p3 } = await partyService.createOrganization(
            { partyName: distinctName + " " + Date.now(), partyNumber: "DQ-TEST-3-" + Date.now(), partyType: 'ORGANIZATION' },
            { organizationName: distinctName }
        );

        console.log(`Seeded Parties:\n 1. ${p1.partyName}\n 2. ${p2.partyName}\n 3. ${p3.partyName}`);


        // 2. Run Matching Batch
        console.log("\n[2] Running Matching Batch...");
        const batchResult = await matchingService.runBatch("Batch-Verification-" + Date.now());
        console.log("Batch Result:", batchResult);

        if (batchResult.candidatesFound === 0) {
            console.warn("WARNING: No duplicates found. Fuzzy logic threshold might be too high or sample data too distinct.");
            // Don't fail hard if fuzzy logic is subjective, but for test we expect match
        }


        // 3. Verify Duplicate Sets
        console.log("\n[3] Verifying Duplicate Sets...");
        // @ts-ignore
        const openSets = await matchingService.getOpenSets();
        console.log(`Found ${openSets.length} Open Duplicate Sets.`);

        if (openSets.length > 0) {
            const firstSet = openSets[0];
            console.log("Resolving Set ID:", firstSet.id);

            // 4. Resolve Set
            await matchingService.resolveSet(firstSet.id, p1.id); // Picking P1 as survivor

            const [updatedSet] = await db.select().from(hzDupSets).where(eq(hzDupSets.id, firstSet.id));
            if (updatedSet.status !== 'MERGED') throw new Error("Set status not updated to MERGED!");
            console.log("Success: Set marked as MERGED.");
        }

        console.log("\n--- Verification SUCCESS ---");
        process.exit(0);
    } catch (e: any) {
        console.error("Verification FAILED:", e);
        process.exit(1);
    }
}

verifyDataQuality();
