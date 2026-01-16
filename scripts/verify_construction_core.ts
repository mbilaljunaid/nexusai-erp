

const BASE_URL = `http://localhost:${process.env.PORT || 5002}`;

async function runVerification() {
    console.log("🏗️  Verifying Construction Management Core...\n");

    try {
        // 1. Create a Test Project (PPM Foundation)
        // We need a project ID to link the contract to.
        // We'll try to list projects, picking the first one, or insert a mock one if needed.
        // For verifying isolation, let's just pick one existing project.

        let projectId = "";
        console.log("1. Finding Project...");
        const projectsRes = await fetch(`${BASE_URL}/api/ppm/projects`);
        if (!projectsRes.ok) throw new Error("Failed to fetch projects");
        const projects = await projectsRes.json() as any[];

        if (projects.length > 0) {
            projectId = projects[0].id;
            console.log(`   - Linked to existing Project: ${projectId}`);
        } else {
            console.log("   - No projects found. Verification skipped (Please seed a project first).");
            return;
        }

        // 2. Create Prime Contract
        console.log("\n2. Creating Prime Contract...");
        const contractNum = `CTR-${Date.now()}`;
        const contractRes = await fetch(`${BASE_URL}/api/construction/contracts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId,
                contractNumber: contractNum,
                subject: "Main Construction Contract",
                originalAmount: "0", // Will be updated by SOV
                vendorId: "v-123" // Mock vendor
            })
        });

        if (!contractRes.ok) throw new Error(`Failed to create contract: ${contractRes.statusText}`);
        const contract = await contractRes.json() as any;
        console.log(`   - Created Contract: ${contract.id} (Number: ${contract.contractNumber})`);

        // 3. Add SOV Lines
        console.log("\n3. Adding SOV Lines...");
        const line1Res = await fetch(`${BASE_URL}/api/construction/contracts/${contract.id}/lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lineNumber: 1,
                description: "Mobilization",
                scheduledValue: "50000"
            })
        });
        const line2Res = await fetch(`${BASE_URL}/api/construction/contracts/${contract.id}/lines`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lineNumber: 2,
                description: "Concrete Foundation",
                scheduledValue: "150000"
            })
        });
        console.log("   - Added Line 1 ($50k) and Line 2 ($150k)");

        // 4. Verify Contract Total Rollup
        console.log("\n4. Verifying Contract Total...");
        const updatedContractRes = await fetch(`${BASE_URL}/api/construction/contracts/${contract.id}`);
        const updatedContract = await updatedContractRes.json() as any;

        console.log(`   - Original Amount: ${updatedContract.originalAmount}`);
        console.log(`   - Revised Amount:  ${updatedContract.revisedAmount}`);

        if (Number(updatedContract.originalAmount) !== 200000) {
            throw new Error(`Rollup Mismatch! Expected 200000, got ${updatedContract.originalAmount}`);
        }
        console.log("   - ✅ Rollup Correct (200,000)");

        // 5. Create Variation (PCO)
        console.log("\n5. Creating Variation (PCO)...");
        const variationRes = await fetch(`${BASE_URL}/api/construction/variations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contractId: contract.id,
                variationNumber: `VAR-${Date.now()}`,
                title: "Added Reinforcement",
                amount: "10000",
                type: "PCO"
            })
        });
        const variation = await variationRes.json() as any;
        console.log(`   - Created Variation: ${variation.id} ($10,000)`);

        // 6. Approve Variation
        console.log("\n6. Approving Variation...");
        const approveRes = await fetch(`${BASE_URL}/api/construction/variations/${variation.id}/approve`, {
            method: "POST"
        });
        if (!approveRes.ok) throw new Error("Failed to approve variation");
        console.log("   - Variation Approved");

        // 7. Verify Revised Amount Update
        console.log("\n7. Verifying Revised Contract Amount...");
        const finalContractRes = await fetch(`${BASE_URL}/api/construction/contracts/${contract.id}`);
        const finalContract = await finalContractRes.json() as any;

        console.log(`   - Final Revised Amount: ${finalContract.revisedAmount}`);

        if (Number(finalContract.revisedAmount) !== 210000) {
            throw new Error(`Revised Amount Mismatch! Expected 210000, got ${finalContract.revisedAmount}`);
        }
        console.log("   - ✅ Revised Amount Correct (Original 200k + Var 10k)");

        console.log("\n✅ VERIFICATION COMPLETE: Construction Core is Functional.\n");

    } catch (error: any) {
        console.error("\n❌ VERIFICATION FAILED:", error.message);
        process.exit(1);
    }
}

runVerification();
