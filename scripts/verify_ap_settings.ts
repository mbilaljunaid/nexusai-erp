
import { db } from "../server/db";
import { apService } from "../server/services/ap";

async function verifySettings() {
    console.log("Verifying AP Settings...");

    // 1. Update System Parameters
    console.log("Updating System Parameters...");
    const updated = await apService.updateSystemParameters({
        priceTolerancePercent: "5.5",
        qtyTolerancePercent: "2.0",
        defaultCurrencyCode: "USD"
    });
    console.log("Updated Params:", updated);

    if (updated.priceTolerancePercent !== "5.5") {
        console.error("FAILED: Price Tolerance not updated via Service");
        process.exit(1);
    }

    // 2. Create Distribution Set
    console.log("Creating Distribution Set...");
    const distSet = await apService.createDistributionSet({
        header: {
            name: `Test Set ${Date.now()}`,
            description: "Test Distribution Template",
            isActive: true
        },
        lines: [
            {
                distributionPercent: "50.00",
                distCodeCombinationId: 1001,
                distributionSetId: 0, // Should be ignored/overwritten by service
                description: "Alloc 1"
            },
            {
                distributionPercent: "50.00",
                distCodeCombinationId: 1002,
                distributionSetId: 0,
                description: "Alloc 2"
            }
        ]
    });
    console.log("Created Set:", distSet);

    if (distSet.lines && distSet.lines.length !== 2) {
        console.error("FAILED: Expected 2 lines in created set");
        process.exit(1);
    }

    // 3. Retrieve Distribution Set
    const lines = await apService.getDistributionSetLines(distSet.id);
    console.log(`Retrieved ${lines.length} lines for Set ${distSet.id}`);

    if (lines.length !== 2) {
        console.error("FAILED: Expected 2 lines retrieved from DB");
        process.exit(1);
    }

    console.log("SUCCESS: AP Settings & Distribution Sets verified.");
    process.exit(0);
}

verifySettings().catch(e => {
    console.error(e);
    process.exit(1);
});
