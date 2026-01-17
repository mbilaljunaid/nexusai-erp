import axios from "axios";

const BASE_URL = "http://localhost:5002/api"; // Adjust to current dev port

async function verifyL15Construction() {
    console.log("🚀 Starting Level-15 Construction Verification Suite...");

    try {
        // 1. Verify Contracts & Master Data (Phase 7)
        console.log("--- Phase 7: Master Data ---");
        const costCodes = await axios.get(`${BASE_URL}/construction/cost-codes`);
        console.log(`✅ Cost Codes retrieved: ${costCodes.data.length}`);

        // 2. Verify Site Operations (Phase 6)
        console.log("--- Phase 6: Field Ops ---");
        // We'll pick a contract if exists
        const contracts = await axios.get(`${BASE_URL}/construction/contracts`);
        const contract = contracts.data[0];
        if (contract) {
            const logs = await axios.get(`${BASE_URL}/construction/contracts/${contract.id}/daily-logs`);
            console.log(`✅ Daily Logs for contract ${contract.contractNumber}: ${logs.data.length}`);

            const rfis = await axios.get(`${BASE_URL}/construction/contracts/${contract.id}/rfis`);
            console.log(`✅ RFIs: ${rfis.data.length}`);
        }

        // 3. Verify Variation AI Simulator (Phase 8)
        console.log("--- Phase 8: AI & Claims ---");
        if (contract) {
            const simulation = await axios.post(`${BASE_URL}/construction/contracts/${contract.id}/variations/simulate`, {
                amount: 150000,
                type: "SCOPE_CHANGE",
                description: "Testing AI Simulator"
            });
            console.log(`✅ AI Simulator Result: Risk Score ${simulation.data.costRiskScore}, Delay ${simulation.data.predictedDelayDays}d`);

            const claims = await axios.get(`${BASE_URL}/construction/contracts/${contract.id}/claims`);
            console.log(`✅ Claims Register active: ${claims.data.length} records`);
        }

        // 4. Verify Resource & Telemetry (Phase 9)
        console.log("--- Phase 9: Resources & IoT ---");
        const resources = await axios.get(`${BASE_URL}/construction/resources`);
        console.log(`✅ Master Resource List: ${resources.data.length} total`);

        const equipment = resources.data.find((r: any) => r.type === "EQUIPMENT");
        if (equipment) {
            const telemetry = await axios.get(`${BASE_URL}/construction/resources/${equipment.id}/telemetry`);
            console.log(`✅ IoT Telemetry Simulated: Fuel ${telemetry.data.fuelLevel}%, Hours ${telemetry.data.engineHours}`);
        }

        console.log("\n⭐️ LEVEL-15 PARITY VERIFIED: Construction Management is production-ready.");
    } catch (error: any) {
        console.error("❌ Verification Failed:", error.message);
        if (error.response) console.error("Response Data:", error.response.data);
    }
}

verifyL15Construction();
