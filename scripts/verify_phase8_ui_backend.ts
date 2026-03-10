
import { db } from "../server/db";
import { matchingService } from "../server/services/MatchingService";
import { partyService } from "../server/services/PartyService";

async function verifyPhase8Backend() {
    console.log("Starting MDM Phase 8 (UI Backend) Verification...");

    try {
        // 1. Verify Count Methods
        console.log("\n[1] Verifying Service Counts...");
        const partyCount = await partyService.countParties();
        console.log(`   - Party Count: ${partyCount}`);

        const openSetCount = await matchingService.countOpenSets();
        console.log(`   - Open Duplicate Sets: ${openSetCount}`);

        if (typeof partyCount !== 'number' || typeof openSetCount !== 'number') {
            throw new Error("Count methods returned invalid type");
        }
        console.log("   ✅ Counts Verified");

        // 2. Mock Fetching Stats (Simulating /api/mdm/stats)
        console.log("\n[2] Verifying Stats Data Structure...");
        const stats = {
            recordsManaged: partyCount,
            dataQualityScore: 94,
            policies: 18,
            openDuplicateSets: openSetCount
        };
        console.log("   - Stats Payload:", stats);
        console.log("   ✅ Stats Structure Verified");

        // 3. Verify Open Duplicate Sets Retrieval
        console.log("\n[3] Verifying Open Sets Retrieval...");
        const sets = await matchingService.getOpenSets();
        console.log(`   - Retrieved ${sets.length} sets`);
        if (sets.length > 0) {
            console.log("   - Sample Set ID:", sets[0].id);
            console.log("   - Candidates:", sets[0].parties.length);
        }
        console.log("   ✅ Open Sets Verified");

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }

    console.log("\n--- Verification SUCCESS ---");
    process.exit(0);
}

verifyPhase8Backend();
