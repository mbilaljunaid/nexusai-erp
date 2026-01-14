
import * as schema from "../shared/schema.ts";
import { db } from "../server/db.ts";

async function checkSchema() {
    try {
        console.log("Checking schema exports...");
        const tableCount = Object.keys(schema).length;
        console.log(`Successfully loaded ${tableCount} exports from schema.`);

        // Find production_transactions
        if ("productionTransactions" in schema) {
            console.log("✅ productionTransactions found in schema.");
        } else {
            console.error("❌ productionTransactions NOT found in schema.");
        }

        if ("costAnomalies" in schema) {
            console.log("✅ costAnomalies found in schema.");
        } else {
            console.error("❌ costAnomalies NOT found in schema.");
        }

    } catch (e) {
        console.error("❌ Schema load failed:", e);
    }
}

checkSchema();
