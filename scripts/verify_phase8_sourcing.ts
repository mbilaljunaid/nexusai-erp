
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { sourcingService } from "../server/services/SourcingService";
import { db } from "../server/db";
import { suppliers, sourcingRfqs, sourcingRfqLines, sourcingBids, procurementContracts } from "../shared/schema/scm";
import { eq } from "drizzle-orm";

async function verify() {
    console.log("Starting Phase 8 Verification: Strategic Sourcing");

    try {
        // 1. Setup Supplier
        let [supplier] = await db.select().from(suppliers).limit(1);
        if (!supplier) {
            [supplier] = await db.insert(suppliers).values({ name: "Sourcing Test Supplier" }).returning();
        }
        console.log(`Using Supplier: ${supplier.name}`);

        // 2. Create RFQ
        console.log("Creating RFQ...");
        const rfq = await sourcingService.createRFQ({
            title: "Verification RFQ",
            description: "Testing end-to-end sourcing flow.",
            lines: [
                { itemDescription: "Industrial Laptop", targetQuantity: 10, unitOfMeasure: "EA" },
                { itemDescription: "Monitor 24 inch", targetQuantity: 20, unitOfMeasure: "EA" }
            ]
        });
        console.log(`RFQ Created: ${rfq.rfqNumber} (ID: ${rfq.id})`);

        // 3. Publish RFQ
        console.log("Publishing RFQ...");
        await sourcingService.publishRFQ(rfq.id);
        const [published] = await db.select().from(sourcingRfqs).where(eq(sourcingRfqs.id, rfq.id));
        console.log(`RFQ Status: ${published.status}`);

        // 4. Submit Bid
        console.log("Submitting Bid...");
        const details = await sourcingService.getRFQDetails(rfq.id) as any;
        const bid = await sourcingService.submitBid({
            rfqId: rfq.id,
            supplierId: supplier.id,
            notes: "Best price for quantity.",
            lines: details.lines.map((l: any) => ({
                rfqLineId: l.id,
                offeredPrice: 1200, // laptop
                offeredQuantity: 10,
                supplierLeadTime: 7
            }))
        });
        console.log(`Bid Submitted: ${bid.id}`);

        // 5. Evaluate Bids
        console.log("Evaluating Bids...");
        const evaluation = await sourcingService.compareBids(rfq.id);
        console.log(`Bids received: ${evaluation.length}`);
        console.log(`Total Bid Amount: ${evaluation[0].totalBidAmount}`);

        // 6. Award RFQ
        console.log("Awarding RFQ...");
        const awardResult = await sourcingService.awardRFQ(rfq.id, bid.id);
        console.log(`Award Success: ${awardResult.bid.bidStatus}`);
        console.log(`Contract Created: ${awardResult.contract.contractNumber}`);

        // 7. Verify Contract
        const [finalContract] = await db.select().from(procurementContracts).where(eq(procurementContracts.id, awardResult.contract.id));
        if (finalContract) {
            console.log("SUCCESS: Draft contract exists in DB.");
        } else {
            console.error("FAIL: Contract not found.");
        }

        console.log("Phase 8 Verification Completed Successfully.");
    } catch (err) {
        console.error("Verification failed:", err);
    }
}

verify();
