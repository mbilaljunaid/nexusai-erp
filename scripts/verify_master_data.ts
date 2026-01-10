
import "dotenv/config";
import { financeService } from "../server/services/finance";

async function verifyMasterData() {
    console.log("🚀 Starting Master Data Verification (Chunk 4)...");

    try {
        // 1. Create Value Set
        console.log("🔧 Creating Value Set: 'Department'...");
        const valueSet = await financeService.createValueSet({
            name: "Department_VS_" + Date.now(),
            description: "Department Codes",
            validationType: "Independent",
            formatType: "Char",
            maxLength: 5,
            uppercaseOnly: true,
            isActive: true
        });
        console.log("✅ Value Set created:", valueSet.id, valueSet.name);

        // 2. Add Values
        console.log("➕ Adding Values to 'Department'...");
        const val1 = await financeService.createSegmentValue({
            valueSetId: valueSet.id,
            value: "SALES",
            description: "Sales Department",
            enabledFlag: true,
            isSummary: false
        });
        const val2 = await financeService.createSegmentValue({
            valueSetId: valueSet.id,
            value: "DEV",
            description: "Development Department",
            enabledFlag: true,
            isSummary: false
        });
        const val3 = await financeService.createSegmentValue({
            valueSetId: valueSet.id,
            value: "OPS",
            description: "Operations Department",
            enabledFlag: true,
            isSummary: true // Parent
        });
        console.log("✅ Values added: SALES, DEV, OPS");

        // 3. Create CoA Structure
        console.log("🔧 Creating CoA Structure: 'Corporate_CoA'...");
        const coa = await financeService.createCoaStructure({
            name: "Corporate_CoA_" + Date.now(),
            description: "Global Chart of Accounts",
            delimiter: "-",
            isActive: true
        });
        console.log("✅ CoA Structure created:", coa.id, coa.name);

        // 4. Add Segment
        console.log("➕ Adding Segment 'Department' to CoA...");
        const segment = await financeService.createSegment({
            coaStructureId: coa.id,
            segmentName: "Department",
            segmentNumber: 2,
            columnName: "segment2",
            valueSetId: valueSet.id, // Linking to the Value Set
            prompt: "Dept",
            displayWidth: 5,
            isActive: true
        });
        console.log("✅ Segment created:", segment.segmentName, "linked to ValueSet:", valueSet.name);

        // 5. Create Hierarchy (Relationship)
        console.log("🔗 Creating Hierarchy: OPS -> SALES...");
        const hierarchy = await financeService.createSegmentHierarchy({
            valueSetId: valueSet.id,
            parentValue: "OPS",
            childValue: "SALES",
            treeName: "DEFAULT"
        });
        console.log("✅ Hierarchy relationship created:", hierarchy.parentValue, "->", hierarchy.childValue);

        // 6. Verify Listings
        console.log("🔍 Verifying Listings...");
        const retrievedValues = await financeService.listSegmentValues(valueSet.id);
        const retrievedHierarchies = await financeService.listSegmentHierarchies(valueSet.id);
        const retrievedSegments = await financeService.listSegments(coa.id);

        if (retrievedValues.length !== 3) throw new Error("Expected 3 values, found " + retrievedValues.length);
        if (retrievedHierarchies.length !== 1) throw new Error("Expected 1 hierarchy, found " + retrievedHierarchies.length);
        if (retrievedSegments.length !== 1) throw new Error("Expected 1 segment, found " + retrievedSegments.length);

        console.log("✅ Listing Verification Passed!");
        console.log("🎉 Chunk 4 Master Data Verification SUCCESS!");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    }
}

verifyMasterData();
