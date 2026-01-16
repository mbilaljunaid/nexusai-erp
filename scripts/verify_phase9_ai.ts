
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), '.env') });
import { db } from "../server/db";
import { sourcingRfqs, sourcingRfqLines, sourcingBids, sourcingBidLines, suppliers } from "../shared/schema/scm";
import { sourcingAIService } from "../server/services/SourcingAIService";

async function verifyAI() {
    console.log("Starting Verification: Sourcing AI Anomaly Detection");

    try {
        // 1. Setup Data: 1 RFQ, 1 Line Item
        const [rfq] = await db.insert(sourcingRfqs).values({
            rfqNumber: "RFQ-AI-" + Date.now(),
            title: "AI Test RFQ",
            status: "PUBLISHED"
        }).returning();

        const [line] = await db.insert(sourcingRfqLines).values({
            rfqId: rfq.id,
            lineNumber: 1,
            itemDescription: "Standard Widget",
            targetQuantity: "100",
            unitOfMeasure: "Each"
        }).returning();

        // 2. Create Suppliers
        const supplierNames = ["Supplier A", "Supplier B", "Supplier C", "Supplier Outlier High", "Supplier Outlier Low"];
        const createdSuppliers = [];
        for (const name of supplierNames) {
            const [s] = await db.insert(suppliers).values({ name }).returning();
            createdSuppliers.push(s);
        }

        // 3. Submit Bids (Mean ~ $100)
        const bidData = [
            { price: 100, leadTime: 14, supplier: createdSuppliers[0] }, // Normal
            { price: 105, leadTime: 12, supplier: createdSuppliers[1] }, // Normal
            { price: 98, leadTime: 15, supplier: createdSuppliers[2] }, // Normal
            { price: 200, leadTime: 14, supplier: createdSuppliers[3] }, // High Outlier (> 1.5 std dev)
            { price: 95, leadTime: 2, supplier: createdSuppliers[4] }   // Lead Time Risk (< 5 days)
        ];

        for (const data of bidData) {
            const [bid] = await db.insert(sourcingBids).values({
                rfqId: rfq.id,
                supplierId: data.supplier.id,
                bidStatus: "SUBMITTED"
            }).returning();

            await db.insert(sourcingBidLines).values({
                bidId: bid.id,
                rfqLineId: line.id,
                offeredPrice: data.price.toString(),
                offeredQuantity: "100",
                supplierLeadTime: data.leadTime
            });
        }

        // 4. Run Analysis
        console.log("Analyzing RFQ...");
        const result = await sourcingAIService.analyzeRFQ(rfq.id);

        // 5. Assertions
        console.log("Analysis Result:", JSON.stringify(result.riskAnalysis, null, 2));

        const highPriceBid = result.riskAnalysis.find(r => r.supplierId === createdSuppliers[3].id);
        const fastBid = result.riskAnalysis.find(r => r.supplierId === createdSuppliers[4].id);

        let success = true;

        if (highPriceBid?.flags.includes("Price Outlier Detected")) {
            console.log("SUCCESS: High Price Outlier Detected");
        } else {
            console.error("FAIL: High Price Outlier NOT Detected");
            success = false;
        }

        if (fastBid?.flags.includes("Unusually Short Lead Time")) {
            console.log("SUCCESS: Lead Time Risk Detected");
        } else {
            console.error("FAIL: Lead Time Risk NOT Detected");
            success = false;
        }

        if (success) console.log("VERIFICATION PASSED");
        else console.log("VERIFICATION FAILED");

    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verifyAI();
