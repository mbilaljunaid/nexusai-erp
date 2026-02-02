
import 'dotenv/config';
import { db } from "../server/db";
import { financeService } from "../server/services/finance";
import { glLedgers, glCoaStructures, glSegments, glSegmentValues, glValueSets } from "@shared/schema";
import { eq } from "drizzle-orm";

async function verifyDynamicCoa() {
    console.log("Starting Dynamic COA Verification...");

    const uniqueId = Date.now().toString();
    const structureName = `TEST_STRUCT_${uniqueId}`;
    const ledgerName = `TEST_LEDGER_${uniqueId}`;

    // 1. Create a Custom COA Structure (3 Segments)
    console.log("Creating COA Structure...");
    const [structure] = await db.insert(glCoaStructures).values({
        name: structureName,
        delimiter: "-",
        description: "Test Structure for Dynamic COA Verification"
    }).returning();

    // 2. Create 3 Value Sets & Values
    const valueSets = [];
    for (let i = 1; i <= 3; i++) {
        const vsName = `VS_${uniqueId}_SEG${i}`;

        const [vsDirect] = await db.insert(glValueSets).values({
            name: vsName,
            validationType: "Independent",
            formatType: "Char"
        }).returning();

        valueSets.push(vsDirect);

        // Add a value
        await db.insert(glSegmentValues).values({
            valueSetId: vsDirect.id,
            value: `00${i}`, // 001, 002, 003
            description: `Test Value ${i}`,
            accountType: i === 3 ? "Asset" : undefined // Make 3rd segment the Account
        });
    }

    // 3. Define Segments
    console.log("Defining Segments...");
    for (let i = 0; i < 3; i++) {
        await db.insert(glSegments).values({
            coaStructureId: structure.id,
            segmentName: `Segment ${i + 1}`,
            segmentNumber: i + 1,
            columnName: `segment${i + 1}`,
            valueSetId: valueSets[i].id,
            prompt: `Seg ${i + 1}`
        });
    }

    // 4. Create Ledger
    console.log("Creating Ledger...");
    const [ledger] = await db.insert(glLedgers).values({
        name: ledgerName,
        coaId: structure.id,
        currencyCode: "USD",
        category: "PRIMARY"
    } as any).returning();

    // 5. Test VALID CCID Creation
    console.log("Testing VALID CCID Creation...");
    const validString = "001-002-003";
    try {
        const ccid = await financeService.getOrCreateCodeCombination(ledger.id, validString);
        console.log(`✅ Success: Created CCID ${ccid.code}`);
        if (ccid.accountType !== "Asset") {
            console.warn(`⚠️ Warning: Account Type not derived correctly. Expected Asset, got ${ccid.accountType}`);
        }
    } catch (err: any) {
        console.error("❌ Failed to create valid CCID:", err.message);
        process.exit(1);
    }

    // 6. Test INVALID Value
    console.log("Testing INVALID Value...");
    const invalidString = "001-999-003";
    try {
        await financeService.getOrCreateCodeCombination(ledger.id, invalidString);
        console.error("❌ Error: Should have failed for invalid value '999'");
        process.exit(1);
    } catch (err: any) {
        if (err.message.includes("Invalid value")) {
            console.log("✅ Correctly rejected invalid value.");
        } else {
            console.error("❌ Unexpected error message:", err.message);
            process.exit(1);
        }
    }

    // 7. Test INVALID Segment Count
    console.log("Testing INVALID Segment Count...");
    const wrongCountString = "001-002";
    try {
        await financeService.getOrCreateCodeCombination(ledger.id, wrongCountString);
        console.error("❌ Error: Should have failed for wrong segment count");
        process.exit(1);
    } catch (err: any) {
        if (err.message.includes("Invalid number of segments")) {
            console.log("✅ Correctly rejected wrong segment count.");
        } else {
            console.error("❌ Unexpected error message:", err.message);
            process.exit(1);
        }
    }

    console.log("✅ Dynamic COA Verification Successful");
}

verifyDynamicCoa().catch((err) => {
    console.error(err);
    process.exit(1);
});
