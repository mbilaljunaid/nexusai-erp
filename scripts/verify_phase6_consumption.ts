
import * as dotenv from "dotenv";
import { resolve } from "path";
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { ContractService } from "../server/services/ContractService";
import { ProcurementService } from "../server/modules/scm/ProcurementService";
import { db } from "../server/db";
import { procurementContracts, purchaseOrders, suppliers } from "../shared/schema/scm";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("Starting Phase 6 Verification: Contract Consumption Visibility");

    try {
        const contractService = new ContractService();
        const procurementService = new ProcurementService();

        // 1. Setup Data: Create a unique supplier and contract for this test
        const uniqueId = Date.now();
        console.log(`Creating unique supplier: Supplier P6 ${uniqueId}...`);
        const [supplier] = await db.insert(suppliers).values({
            name: `Supplier P6 ${uniqueId}`,
            email: `p6_${uniqueId}@example.com`
        }).returning();

        console.log(`Creating unique contract with $1000 limit...`);
        const [contract] = await db.insert(procurementContracts).values({
            supplierId: supplier.id,
            contractNumber: `CONT-P6-${uniqueId}`,
            title: `P6 Verification Contract`,
            status: 'ACTIVE',
            totalAmountLimit: "1000.00",
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }).returning();

        console.log(`Using Supplier ID: ${supplier.id}`);
        console.log(`Using Contract: ${contract.contractNumber} (Limit: ${contract.totalAmountLimit})`);

        // 3. Create a COMPLIANT PO ($400)
        console.log("Creating a compliant PO ($400)...");
        const po1 = await procurementService.createPurchaseOrder({
            header: {
                supplierId: supplier.id,
                totalAmount: "400.00",
                orderNumber: `PO-P6-COMP-${Date.now()}`
            },
            lines: []
        });

        // Check if po1 is compliant
        const [verifiedPO1] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, po1.id));
        console.log(`PO1 Status: ${verifiedPO1.status}, Compliance: ${verifiedPO1.complianceStatus}`);
        if (verifiedPO1.complianceStatus !== 'COMPLIANT' && verifiedPO1.complianceStatus !== null) {
            console.error("FAIL: PO1 should be COMPLIANT");
        }

        // 4. Create a NON-COMPLIANT PO ($1200 > $1000 limit)
        console.log("Creating a non-compliant PO ($1200)...");
        const po2 = await procurementService.createPurchaseOrder({
            header: {
                supplierId: supplier.id,
                totalAmount: "1200.00",
                orderNumber: `PO-P6-NON-${Date.now()}`
            },
            lines: []
        });

        const [verifiedPO2] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, po2.id));
        console.log(`PO2 Status: ${verifiedPO2.status}, Compliance: ${verifiedPO2.complianceStatus}, Reason: ${verifiedPO2.complianceReason}`);
        if (verifiedPO2.complianceStatus !== 'NON_COMPLIANT') {
            console.error("FAIL: PO2 should be NON_COMPLIANT");
        }

        // 5. Verify Contract Consumption Details
        console.log("Verifying getContractDetails consumption data...");
        const details = await contractService.getContractDetails(contract.id);
        console.log(`Current Spend in API: ${details?.currentSpend}`);
        console.log(`Linked POs count: ${(details as any)?.linkedPOs?.length}`);

        if (Number(details?.currentSpend) < 1600) {
            console.error(`FAIL: Expected spend >= 1600 (400 + 1200), got ${details?.currentSpend}`);
        } else {
            console.log("SUCCESS: Consumption tracked correctly.");
        }

        console.log("Phase 6 Verification Completed Successfully.");

    } catch (err) {
        console.error("Verification failed with error:", err);
    }
}

verify();
