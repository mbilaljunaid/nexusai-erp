
import "dotenv/config";
import { db } from "../server/db";
import { contracts, partners, dealRegistrations } from "../shared/schema";
import { eq } from "drizzle-orm";
import { PartnerService } from "../server/services/PartnerService";

async function verifyPRM() {
    console.log("🚀 Starting verification for Partner Portal (Phase 29)...");

    try {
        const partnerName = `Test Partner ${Date.now()}`;
        const email = `test${Date.now()}@partner.com`;

        // 1. Ensure Partner
        const partner = await PartnerService.ensurePartner(partnerName, email);
        console.log(`✅ Identified Partner: ${partner.name} (${partner.id})`);

        // 2. Register Deal
        const deal = await PartnerService.registerDeal({
            partnerId: partner.id,
            dealName: "Big Corp Deployment",
            customerName: "Big Corp Inc",
            amount: "75000",
            notes: "Ready to sign"
        });
        console.log(`✅ Registered Deal: ${deal.dealName} (Status: ${deal.status})`);

        if (deal.status !== 'Pending') throw new Error("Deal should start as Pending");

        // 3. Approve Deal
        const approved = await PartnerService.updateDealStatus(deal.id, "Approved", "Looks good");
        console.log(`✅ Approved Deal: Status is now ${approved.status}`);

        // Cleanup
        await db.delete(dealRegistrations).where(eq(dealRegistrations.id, deal.id));
        await db.delete(partners).where(eq(partners.id, partner.id));

        console.log("✅ Verification Passed");
        process.exit(0);

    } catch (error) {
        console.error("❌ Verification FAILED:", error);
        process.exit(1);
    }
}

verifyPRM();
